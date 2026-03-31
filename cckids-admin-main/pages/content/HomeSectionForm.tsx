import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save, CheckCircle, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { Project, ProjectDetailOut } from '../../types';
import Button from '../../components/Button';
import Card from '../../components/Card';
import LanguageTabs from '../../components/LanguageTabs';
import { useToast } from '../../context/ToastContext';

const HomeSectionForm = () => {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const toast = useToast();
    
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [projectImages, setProjectImages] = useState<{url: string, id: string | number, type: 'cover' | 'gallery'}[]>([]);
    const [loadingImages, setLoadingImages] = useState(false);

    const [formData, setFormData] = useState({
        kind: 'hero', // Default to hero/slider
        title: '',
        title_en: '',
        body: '',
        body_en: '',
        media_url: '',
        link_url: '',
        sort_order: 0,
        is_active: true
    });

    // 1. Load Projects and Existing Data
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                // Fetch projects for selection
                const pRes = await api.get<any>('/projects?page_size=100');
                setProjects(pRes.items);

                // If Edit mode, fetch existing section data
                if (isEdit && id) {
                    const res = await api.get<any>('/home-sections');
                    const found = res.items.find((i: any) => i.id === Number(id));
                    if (found) {
                        setFormData({
                            kind: found.kind || 'hero',
                            title: found.title || '',
                            title_en: found.title_en || '',
                            body: found.body || '',
                            body_en: found.body_en || '',
                            media_url: found.media_url || '',
                            link_url: found.link_url || '',
                            sort_order: found.sort_order,
                            is_active: found.is_active
                        });
                        
                        // Try to find which project this link belongs to (if link format is /projects/UUID or /projects/ID)
                        if (found.link_url && found.link_url.includes('/projects/')) {
                            const segment = found.link_url.split('/projects/')[1];
                            
                            // Check matching by UUID
                            const projectByUuid = pRes.items.find((p: Project) => p.uuid === segment);
                            
                            if (projectByUuid) {
                                setSelectedProjectId(projectByUuid.id);
                            } else {
                                // Fallback: Check matching by ID (legacy support)
                                const pid = parseInt(segment);
                                if (!isNaN(pid)) {
                                    const projectById = pRes.items.find((p: Project) => p.id === pid);
                                    if (projectById) {
                                        setSelectedProjectId(pid);
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (e: any) {
                console.error(e);
                toast.error("Veriler yüklenirken hata oluştu.");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [id, isEdit]);

    // 2. When Project is selected, fetch its images
    useEffect(() => {
        if (!selectedProjectId) {
            setProjectImages([]);
            return;
        }

        const loadProjectImages = async () => {
            setLoadingImages(true);
            try {
                const detail = await api.get<ProjectDetailOut>(`/projects/${selectedProjectId}`);
                
                const images: {url: string, id: string | number, type: 'cover' | 'gallery'}[] = [];
                
                // Add Cover Image
                if (detail.featured_image_url) {
                    images.push({
                        url: detail.featured_image_url,
                        id: 'cover',
                        type: 'cover'
                    });
                }

                // Add Gallery Images
                if (detail.images && detail.images.length > 0) {
                    detail.images.forEach(img => {
                        images.push({
                            url: img.url,
                            id: img.id,
                            type: 'gallery'
                        });
                    });
                }
                
                setProjectImages(images);
            } catch (e) {
                console.error(e);
                toast.error("Proje görselleri yüklenemedi.");
            } finally {
                setLoadingImages(false);
            }
        };

        loadProjectImages();
    }, [selectedProjectId]);

    const handleImageSelect = (url: string) => {
        const project = projects.find(p => p.id === selectedProjectId);
        
        setFormData(prev => ({
            ...prev,
            media_url: url,
            link_url: project ? `/projects/${project.uuid}` : prev.link_url, // Link to project UUID
            title: project ? project.name : prev.title, // Use project name as title
            title_en: project?.name_en || prev.title_en
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.media_url) {
            toast.error("Lütfen bir görsel seçiniz.");
            return;
        }

        setLoading(true);
        try {
            if (isEdit && id) {
                await api.put(`/home-sections/${id}`, formData);
            } else {
                await api.post('/home-sections', formData);
            }
            navigate('/content/home-sections');
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    // Helper to display current project UUID in the hint text
    const currentProject = projects.find(p => p.id === selectedProjectId);

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-3">
                <Button variant="secondary" onClick={() => navigate('/content/home-sections')}><ChevronLeft size={16} /></Button>
                <h1 className="text-2xl font-bold text-gray-800">{isEdit ? 'Slider/Banner Düzenle' : 'Yeni Slider/Banner Ekle'}</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Selection Logic */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card title="1. Proje Seçimi">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Hangi projenin görselini kullanmak istiyorsunuz?</label>
                                    <select 
                                        className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                        value={selectedProjectId || ''}
                                        onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                                    >
                                        <option value="">-- Proje Seçiniz --</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </Card>

                        {selectedProjectId && (
                            <Card title="2. Görsel Seçimi">
                                {loadingImages ? (
                                    <div className="py-8 flex justify-center text-gray-500">
                                        <Loader2 className="animate-spin mr-2" /> Görseller yükleniyor...
                                    </div>
                                ) : (
                                    <div>
                                        {projectImages.length === 0 ? (
                                            <p className="text-gray-500 text-sm">Bu projede hiç görsel bulunmuyor.</p>
                                        ) : (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                {projectImages.map((img, idx) => {
                                                    const isSelected = formData.media_url === img.url;
                                                    return (
                                                        <div 
                                                            key={idx} 
                                                            onClick={() => handleImageSelect(img.url)}
                                                            className={`
                                                                relative aspect-square rounded-lg overflow-hidden cursor-pointer group border-2 transition-all
                                                                ${isSelected ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-gray-200 hover:border-indigo-300'}
                                                            `}
                                                        >
                                                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                                                            
                                                            {/* Label for Cover vs Gallery */}
                                                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 text-white text-[10px] rounded backdrop-blur-sm uppercase">
                                                                {img.type === 'cover' ? 'Kapak' : 'Galeri'}
                                                            </div>

                                                            {/* Selected Overlay */}
                                                            {isSelected && (
                                                                <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                                                                    <div className="bg-white rounded-full p-1 shadow-md">
                                                                        <CheckCircle className="text-indigo-600 w-6 h-6" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500 mt-4 break-all">
                                            * Bir görsel seçtiğinizde, ana sayfadaki bu bölüm otomatik olarak ilgili proje sayfasına 
                                            ({currentProject ? `/projects/${currentProject.uuid}` : '...'}) yönlendirecektir.
                                        </p>
                                    </div>
                                )}
                            </Card>
                        )}

                        <Card title="3. Başlık ve İçerik">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Başlık (TR)</label>
                                        <input
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title (EN)</label>
                                        <input
                                            value={formData.title_en}
                                            onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">İçerik</label>
                                    <LanguageTabs>
                                        {(lang) => (
                                            <textarea
                                                rows={4}
                                                value={lang === 'tr' ? formData.body : formData.body_en}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    [lang === 'tr' ? 'body' : 'body_en']: e.target.value
                                                })}
                                                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        )}
                                    </LanguageTabs>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Settings */}
                    <div className="space-y-6">
                        <Card title="Ayarlar">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sıralama</label>
                                    <input 
                                        type="number" 
                                        name="sort_order" 
                                        value={formData.sort_order} 
                                        onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})} 
                                        className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500" 
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Düşük sayılar önce gösterilir.</p>
                                </div>

                                <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <span className="text-sm font-medium text-gray-700">Yayında</span>
                                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${formData.is_active ? 'bg-green-500' : 'bg-gray-300'}`}>
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${formData.is_active ? 'translate-x-4' : ''}`} />
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={formData.is_active} 
                                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})} 
                                        className="hidden" 
                                    />
                                </label>
                            </div>
                        </Card>

                        <Card title="Önizleme Bilgisi">
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="text-gray-500 block text-xs">Seçilen Görsel URL</span>
                                    <div className="font-mono text-xs text-gray-800 break-all bg-gray-50 p-2 rounded border border-gray-100">
                                        {formData.media_url || '-'}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-500 block text-xs">Yönlenecek Link</span>
                                    <div className="font-medium text-indigo-600 break-all">
                                        {formData.link_url || '-'}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:pl-72 flex justify-end gap-3 z-10 shadow-lg-up">
                    <Button type="button" variant="secondary" onClick={() => navigate('/content/home-sections')}>İptal</Button>
                    <Button type="submit" disabled={loading || !formData.media_url}>
                        <Save size={18} />
                        {loading ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default HomeSectionForm;
