import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { ProjectCategory } from '../../types';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';

const ProjectCategoriesList = () => {
    const [categories, setCategories] = useState<ProjectCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    
    const navigate = useNavigate();
    const toast = useToast();

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<any>('/project-categories');
            setCategories(res.items);
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
            await api.delete(`/project-categories/${deleteId}`);
            await fetchCategories();
            setDeleteId(null);
        } catch (error: any) {
            toast.error(`İşlem başarısız: ${error.message}`);
        } finally {
            setDeleting(false);
        }
    }

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Proje Kategorileri</h1>
                <Button onClick={() => navigate('/categories/projects/new')}><Plus size={16} /> Kategori Ekle</Button>
            </div>

            <Card className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                                <th className="px-6 py-4">İsim</th>
                                <th className="px-6 py-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={2} className="px-6 py-8 text-center text-gray-500">Kategoriler yükleniyor...</td></tr>
                            ) : categories.length === 0 ? (
                                <tr><td colSpan={2} className="px-6 py-8 text-center text-gray-500">Kategori bulunamadı.</td></tr>
                            ) : categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                type="button"
                                                onClick={() => navigate(`/categories/projects/${cat.id}`)}
                                                className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => handleDeleteClick(cat.id)}
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
                title="Kategoriyi Sil"
                message="Bu kategoriyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
            />
        </div>
    );
};

export default ProjectCategoriesList;