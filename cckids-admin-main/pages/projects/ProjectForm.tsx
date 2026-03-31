import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save, Trash2, Plus, UploadCloud, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { ProjectCreatePayload, ProjectCategory, UploadOut, ProjectDetailOut, ProjectImage } from '../../types';
import Button from '../../components/Button';
import Card from '../../components/Card';
import LanguageTabs from '../../components/LanguageTabs';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';

const ProjectForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const toast = useToast();
    
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [galleryUploading, setGalleryUploading] = useState(false);
    const [categories, setCategories] = useState<ProjectCategory[]>([]);

    // Modal
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Main Project Data
    const [formData, setFormData] = useState<ProjectCreatePayload>({
        name: '',
        name_en: '',
        short_info: '',
        short_info_en: '',
        about_text: '',
        about_text_en: '',
        featured_image_url: '',
        featured_image_uuid: '',
        location: '',
        location_en: '',
        completed_at: '',
        duration: '',
        capacity: '',
        total_products: '',
        general_info: [],
        general_info_en: [],
        category_id: null,
        sort_order: 0,
        is_active: true
    });

    // Gallery Images
    const [projectImages, setProjectImages] = useState<ProjectImage[]>([]);

    // Review Data (Separate Endpoint)
    const [reviewData, setReviewData] = useState({
        customer_name: '',
        comment: ''
    });

    useEffect(() => {
        // Fetch Categories
        api.get<any>('/project-categories').then(res => setCategories(res.items)).catch(console.error);

        if (isEdit && id) {
            setLoading(true);
            api.get<ProjectDetailOut>(`/projects/${id}`)
                .then(res => {
                    setFormData({
                        name: res.name,
                        name_en: res.name_en || '',
                        short_info: res.short_info || '',
                        short_info_en: res.short_info_en || '',
                        about_text: res.about_text || '',
                        about_text_en: res.about_text_en || '',
                        featured_image_url: res.featured_image_url || '',
                        featured_image_uuid: res.featured_image_uuid || '',
                        location: res.location || '',
                        location_en: res.location_en || '',
                        completed_at: res.completed_at || '',
                        duration: res.duration || '',
                        capacity: res.capacity || '',
                        total_products: res.total_products || '',
                        general_info: res.general_info || [],
                        general_info_en: res.general_info_en || [],
                        category_id: res.category_id || null,
                        sort_order: res.sort_order,
                        is_active: res.is_active
                    });

                    // Set Images
                    setProjectImages(res.images || []);

                    if (res.review) {
                        setReviewData({
                            customer_name: res.review.customer_name,
                            comment: res.review.comment
                        });
                    }
                })
                .catch(err => {
                    console.error(err);
                    toast.error("İşlem başarısız: Proje yüklenemedi");
                    navigate('/projects');
                })
                .finally(() => setLoading(false));
        }
    }, [id, isEdit, navigate]);

    // Handle Featured Image Upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await api.upload<UploadOut>('/uploads', file);
            setFormData(prev => ({
                ...prev,
                featured_image_url: res.url,
                featured_image_uuid: res.uuid
            }));
            // toast.success removed
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            toast.error("İşlem başarısız: " + msg);
        } finally {
            setUploading(false);
        }
    };

    // Handle Gallery Image Upload (Direct to Project)
    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !id) return;

        setGalleryUploading(true);
        try {
            // Calculate next sort order based on max existing order
            const maxOrder = projectImages.reduce((max, img) => (img.sort_order > max ? img.sort_order : max), 0);
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('kind', 'gallery'); // Backend requires 'kind'
            formData.append('sort_order', String(maxOrder + 1));

            const newImage = await api.uploadWithFormData<ProjectImage>(`/projects/${id}/images`, formData);
            setProjectImages(prev => [...prev, newImage]);
            // toast.success removed
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            toast.error("İşlem başarısız: " + msg);
        } finally {
            setGalleryUploading(false);
        }
    };

    const handleGalleryDeleteClick = (imageId: number) => {
        setDeleteId(imageId);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await api.delete(`/project-images/${deleteId}`);
            setProjectImages(prev => prev.filter(img => img.id !== deleteId));
            setDeleteId(null);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            toast.error("İşlem başarısız: " + msg);
        } finally {
            setDeleting(false);
        }
    };

    const updateImageOrder = (imageId: number, value: string) => {
        const order = parseInt(value) || 0;
        setProjectImages(prev => prev.map(img => 
            img.id === imageId ? { ...img, sort_order: order } : img
        ));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
             const checked = (e.target as HTMLInputElement).checked;
             setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'number') {
             setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
        } else {
             setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // General Info Logic
    const addGeneralInfo = (target: 'general_info' | 'general_info_en') => {
        const current = formData[target] || [];
        if (current.length >= 4) {
            toast.info("Maksimum 4 genel bilgi maddesi eklenebilir");
            return;
        }
        setFormData(prev => ({
            ...prev,
            [target]: [...(prev[target] || []), { "Etiket": "" }]
        }));
    };

    const updateGeneralInfo = (index: number, key: string, value: string, target: 'general_info' | 'general_info_en') => {
        const newInfo = [...(formData[target] || [])];
        newInfo[index] = { [key]: value };
        setFormData(prev => ({ ...prev, [target]: newInfo }));
    };

    const removeGeneralInfo = (index: number, target: 'general_info' | 'general_info_en') => {
        const newInfo = [...(formData[target] || [])];
        newInfo.splice(index, 1);
        setFormData(prev => ({ ...prev, [target]: newInfo }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let projectId = id;
            
            // 1. Create or Update Project
            if (isEdit && projectId) {
                await api.put(`/projects/${projectId}`, formData);
            } else {
                const res = await api.post<{id: number}>('/projects', formData);
                projectId = String(res.id);
            }

            // 2. Handle Review Logic (Separate Endpoint)
            if (projectId) {
                if (reviewData.customer_name && reviewData.comment) {
                    await api.put(`/projects/${projectId}/review`, reviewData);
                } else if (isEdit) {
                    // Check if we need to delete existing review? 
                    // Backend doesn't support "update to empty", but has DELETE endpoint.
                     try {
                        await api.delete(`/projects/${projectId}/review`);
                     } catch(ignored) {}
                }
            }

            // 3. Batch Update Images if project exists
            if (projectId && projectImages.length > 0) {
                 await Promise.all(projectImages.map(img => 
                    api.put(`/project-images/${img.id}`, {
                        sort_order: img.sort_order < 1 ? 1 : img.sort_order // Enforce min 1 to satisfy potential strict validation
                    })
                ));
            }

            // toast.success removed
            navigate('/projects');
        } catch (error) {
            console.error("Save failed", error);
            const msg = error instanceof Error ? error.message : String(error);
            toast.error(`İşlem başarısız: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/projects')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">{isEdit ? 'Proje Düzenle' : 'Yeni Proje Ekle'}</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card title="Proje Detayları">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Proje Adı (TR) *</label>
                                        <input
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Name (EN)</label>
                                        <input
                                            name="name_en"
                                            value={formData.name_en || ''}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kısa Bilgi (TR)</label>
                                        <input
                                            name="short_info"
                                            value={formData.short_info || ''}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            maxLength={500}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Short Info (EN)</label>
                                        <input
                                            name="short_info_en"
                                            value={formData.short_info_en || ''}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            maxLength={500}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hakkında Metni</label>
                                    <LanguageTabs>
                                        {(lang) => (
                                            <textarea
                                                name={lang === 'tr' ? 'about_text' : 'about_text_en'}
                                                rows={6}
                                                value={lang === 'tr' ? formData.about_text || '' : formData.about_text_en || ''}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        )}
                                    </LanguageTabs>
                                </div>
                            </div>
                        </Card>

                        {/* PROJECT GALLERY */}
                        <Card title="Proje Galerisi">
                            {!isEdit ? (
                                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                    <p>Fotoğraf eklemek için lütfen önce projeyi kaydedin.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {projectImages.map((img) => (
                                            <div key={img.id} className="relative group border border-gray-200 rounded-lg p-2 bg-white hover:shadow-md transition-shadow">
                                                <div className="aspect-square bg-gray-50 rounded overflow-hidden relative">
                                                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleGalleryDeleteClick(img.id)}
                                                        className="absolute top-1 right-1 bg-white text-red-600 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <div className="mt-2">
                                                    <input 
                                                        type="number"
                                                        placeholder="Sıra"
                                                        className="w-full text-xs p-1.5 border border-gray-200 rounded bg-gray-50 outline-none focus:border-indigo-400 text-center"
                                                        value={img.sort_order}
                                                        onChange={(e) => updateImageOrder(img.id, e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        ))}

                                        {/* Upload Button */}
                                        <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-indigo-400 transition-colors">
                                            {galleryUploading ? (
                                                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                            ) : (
                                                <>
                                                    <UploadCloud className="w-8 h-8 mb-2 text-gray-400" />
                                                    <span className="text-xs text-gray-500 font-medium text-center px-2">Fotoğraf Yükle</span>
                                                    <input type="file" className="hidden" onChange={handleGalleryUpload} accept="image/*" />
                                                </>
                                            )}
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500 italic">* Sıralama değişiklikleri "Kaydet" butonuna basıldığında güncellenir.</p>
                                </div>
                            )}
                        </Card>

                        {/* Stats Grid */}
                        <Card title="Proje İstatistikleri">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Konum (TR)</label>
                                    <input name="location" value={formData.location || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Location (EN)</label>
                                    <input name="location_en" value={formData.location_en || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Tamamlanma Tarihi</label>
                                    <input name="completed_at" value={formData.completed_at || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Örn: 2023" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Süre</label>
                                    <input name="duration" value={formData.duration || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Örn: 3 Ay" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Kapasite</label>
                                    <input name="capacity" value={formData.capacity || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Toplam Ürün</label>
                                    <input name="total_products" value={formData.total_products || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" />
                                </div>
                            </div>
                        </Card>

                        {/* General Info Dynamic List */}
                        <Card title="Genel Bilgiler (Anahtar Detaylar)">
                            <LanguageTabs>
                                {(lang) => {
                                    const target = lang === 'tr' ? 'general_info' : 'general_info_en';
                                    const items = formData[target] || [];
                                    return (
                                        <div className="space-y-3">
                                            {items.map((item, idx) => {
                                                const key = Object.keys(item)[0] || '';
                                                const val = Object.values(item)[0] || '';
                                                return (
                                                    <div key={idx} className="flex gap-2 items-center">
                                                        <input
                                                            placeholder={lang === 'tr' ? 'Etiket (Örn: Alan)' : 'Label (e.g. Area)'}
                                                            value={key}
                                                            onChange={(e) => updateGeneralInfo(idx, e.target.value, val, target)}
                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                        />
                                                        <input
                                                            placeholder={lang === 'tr' ? 'Değer (Örn: 500m2)' : 'Value (e.g. 500m2)'}
                                                            value={val}
                                                            onChange={(e) => updateGeneralInfo(idx, key, e.target.value, target)}
                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                        />
                                                        <button type="button" onClick={() => removeGeneralInfo(idx, target)} className="text-red-500 p-2">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                            {items.length < 4 && (
                                                <Button type="button" variant="secondary" onClick={() => addGeneralInfo(target)} className="text-xs">
                                                    <Plus size={14} /> Bilgi Ekle
                                                </Button>
                                            )}
                                        </div>
                                    );
                                }}
                            </LanguageTabs>
                        </Card>

                        {/* Customer Review Section */}
                         <Card title="Müşteri Görüşü">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri Adı</label>
                                    <input 
                                        value={reviewData.customer_name} 
                                        onChange={(e) => setReviewData({...reviewData, customer_name: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Yorum</label>
                                    <textarea 
                                        rows={3}
                                        value={reviewData.comment} 
                                        onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card title="Ayarlar">
                            <div className="space-y-4">
                                <label className="flex items-center justify-between p-2 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <span className="text-sm font-medium text-gray-700">Aktif</span>
                                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${formData.is_active ? 'bg-green-500' : 'bg-gray-300'}`}>
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${formData.is_active ? 'translate-x-4' : ''}`} />
                                    </div>
                                    <input type="checkbox" name="is_active" checked={formData.is_active || false} onChange={handleChange} className="hidden" />
                                </label>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                    <select 
                                        name="category_id" 
                                        value={formData.category_id || ''} 
                                        onChange={(e) => setFormData({...formData, category_id: e.target.value ? Number(e.target.value) : null})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    >
                                        <option value="">Kategori Seçin...</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sıralama</label>
                                    <input 
                                        type="number" 
                                        name="sort_order" 
                                        value={formData.sort_order} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card title="Öne Çıkan Görsel">
                            <div>
                                <div className="mb-4">
                                    {formData.featured_image_url ? (
                                        <div className="relative rounded-lg overflow-hidden border border-gray-200 aspect-video bg-gray-50 group">
                                            <img 
                                                src={formData.featured_image_url} 
                                                alt="Preview" 
                                                className="h-full w-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                 <button type="button" onClick={() => setFormData(prev => ({...prev, featured_image_url: '', featured_image_uuid: ''}))} className="bg-white text-red-600 p-2 rounded-full">
                                                     <Trash2 size={20} />
                                                 </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                                                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Yükle</span></p>
                                                <p className="text-xs text-gray-500">JPG, PNG</p>
                                            </div>
                                            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                                        </label>
                                    )}
                                </div>
                                {uploading && <div className="text-xs text-center text-indigo-600 animate-pulse">Yükleniyor...</div>}
                                
                                <div className="mt-2">
                                     <label className="text-xs text-gray-500 block mb-1">Veya manuel URL:</label>
                                     <input 
                                        name="featured_image_url" 
                                        value={formData.featured_image_url || ''} 
                                        onChange={handleChange} 
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs"
                                        placeholder="https://..."
                                     />
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:pl-72 flex justify-end gap-3 z-10 shadow-lg-up">
                    <Button type="button" variant="secondary" onClick={() => navigate('/projects')}>İptal</Button>
                    <Button type="submit" disabled={loading || uploading || galleryUploading}>
                        <Save size={18} />
                        {loading ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                </div>
            </form>

            <ConfirmModal 
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                loading={deleting}
                title="Görseli Sil"
                message="Bu görseli galeriden kaldırmak istediğinize emin misiniz?"
            />
        </div>
    );
};

export default ProjectForm;
