import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Image as ImageIcon, MapPin } from 'lucide-react';
import { api } from '../../services/api';
import { Project } from '../../types';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';

const ProjectsList = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    
    const navigate = useNavigate();
    const toast = useToast();

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<any>('/projects');
            setProjects(res.items);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await api.delete(`/projects/${deleteId}`);
            await fetchProjects();
            setDeleteId(null);
        } catch (error: any) {
            toast.error(`İşlem başarısız: ${error.message}`);
        } finally {
            setDeleting(false);
        }
    }

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Projeler</h1>
                <Button onClick={() => navigate('/projects/new')}><Plus size={16} /> Proje Ekle</Button>
            </div>

            <Card className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                                <th className="px-6 py-4">Proje Bilgisi</th>
                                <th className="px-6 py-4">Konum</th>
                                <th className="px-6 py-4">Durum</th>
                                <th className="px-6 py-4">Sıra</th>
                                <th className="px-6 py-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Projeler yükleniyor...</td></tr>
                            ) : projects.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Proje bulunamadı.</td></tr>
                            ) : projects.map((project) => (
                                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {project.featured_image_url ? (
                                                <img src={project.featured_image_url} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                    <ImageIcon size={20} />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-gray-900">{project.name}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-[200px]">{project.short_info}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {project.location && (
                                            <div className="flex items-center gap-1">
                                                <MapPin size={12} /> {project.location}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4"><Badge status={String(project.is_active)} /></td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">{project.sort_order}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                type="button"
                                                onClick={() => navigate(`/projects/${project.id}`)}
                                                className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => handleDeleteClick(project.id)}
                                                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            
            <ConfirmModal 
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                loading={deleting}
                title="Projeyi Sil"
                message="Bu projeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
            />
        </div>
    );
};

export default ProjectsList;