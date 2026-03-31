import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, Check } from 'lucide-react';
import { api } from '../../services/api';
import { Project, ProjectDetailOut } from '../../types';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';

interface HomeProjectImage {
    id: number;
    project_image_id: number;
    sort_order: number;
}

const HomeProjectImages = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [homeImages, setHomeImages] = useState<HomeProjectImage[]>([]);
    
    // For selection UI
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<number | null>(null);
    const [projectImages, setProjectImages] = useState<any[]>([]);
    const [showSelector, setShowSelector] = useState(false);
    const [imageMap, setImageMap] = useState<Record<number, string>>({});

    // Modal
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const loadData = async () => {
        try {
            const [hRes, pRes] = await Promise.all([
                api.get<any>('/home-project-images'),
                api.get<any>('/projects?page_size=100') // Get many
            ]);
            setHomeImages(hRes.items);
            setProjects(pRes.items);
            
            const map: Record<number, string> = {};
            for (const p of pRes.items) {
                 const detail = await api.get<ProjectDetailOut>(`/projects/${p.id}`);
                 detail.images.forEach(img => {
                     map[img.id] = img.url;
                 });
            }
            setImageMap(map);

        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleProjectSelect = async (pid: number) => {
        setSelectedProject(pid);
        const res = await api.get<ProjectDetailOut>(`/projects/${pid}`);
        setProjectImages(res.images);
    };

    const handleAdd = async (imgId: number) => {
        try {
            // Calculate safe sort order
            const maxOrder = homeImages.reduce((max, img) => (img.sort_order > max ? img.sort_order : max), 0);
            const nextOrder = maxOrder + 1;

            await api.post('/home-project-images', { project_image_id: imgId, sort_order: nextOrder });
            setShowSelector(false);
            loadData();
        } catch (e: any) {
            toast.error(`İşlem başarısız: ${e.message}`);
        }
    };

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await api.delete(`/home-project-images/${deleteId}`);
            await loadData();
            setDeleteId(null);
        } catch (e: any) {
            toast.error(`İşlem başarısız: ${e.message}`);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
             <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={() => navigate('/content')}><ChevronLeft size={16} /> Geri</Button>
                    <h1 className="text-2xl font-bold text-gray-800">Ana Sayfa Proje Galerisi</h1>
                </div>
                <Button onClick={() => setShowSelector(true)}><Plus size={16} /> Görsel Ekle</Button>
            </div>

            {showSelector && (
                <Card className="border-indigo-100 bg-indigo-50/50">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-indigo-900">Eklenecek Görseli Seçin</h3>
                            <button onClick={() => setShowSelector(false)} className="text-sm text-gray-500 hover:text-gray-800">Kapat</button>
                        </div>
                        <select 
                            className="w-full p-2 rounded border" 
                            onChange={(e) => handleProjectSelect(Number(e.target.value))}
                            value={selectedProject || ''}
                        >
                            <option value="">-- Bir Proje Seçin --</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>

                        {selectedProject && (
                            <div className="grid grid-cols-4 md:grid-cols-6 gap-2 max-h-60 overflow-y-auto p-2 bg-white rounded border">
                                {projectImages.map(img => (
                                    <button key={img.id} onClick={() => handleAdd(img.id)} className="relative aspect-square group">
                                        <img src={img.url} className="w-full h-full object-cover rounded" alt="" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs">
                                            Seç
                                        </div>
                                    </button>
                                ))}
                                {projectImages.length === 0 && <p className="col-span-4 text-sm text-gray-400 p-2">Bu projede görsel yok.</p>}
                            </div>
                        )}
                    </div>
                </Card>
            )}

            <Card>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {homeImages.map(hi => (
                        <div key={hi.id} className="relative aspect-square rounded-lg overflow-hidden group border border-gray-200 bg-gray-50">
                            {imageMap[hi.project_image_id] ? (
                                <img src={imageMap[hi.project_image_id]} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-xs text-gray-400">Yükleniyor...</div>
                            )}
                            <button 
                                type="button"
                                onClick={() => handleDeleteClick(hi.id)} 
                                className="absolute top-2 right-2 bg-white text-red-600 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    {homeImages.length === 0 && <p className="text-gray-500 col-span-full py-8 text-center">Seçili görsel yok.</p>}
                </div>
            </Card>

            <ConfirmModal 
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                loading={deleting}
                title="Görseli Kaldır"
                message="Bu görseli ana sayfadan kaldırmak istediğinize emin misiniz?"
            />
        </div>
    );
};

export default HomeProjectImages;