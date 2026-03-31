import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import { api } from '../../services/api';
import { ProjectCategory } from '../../types';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { useToast } from '../../context/ToastContext';

const ProjectCategoryForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const toast = useToast();
    
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [nameEn, setNameEn] = useState('');

    useEffect(() => {
        if (isEdit && id) {
            setLoading(true);
            const fetchCat = async () => {
                try {
                    const res = await api.get<any>('/project-categories');
                    const found = res.items.find((c: ProjectCategory) => c.id === Number(id));
                    if (found) {
                        setName(found.name);
                        setNameEn(found.name_en || '');
                    } else {
                        toast.error("Kategori bulunamadı");
                        navigate('/categories/projects');
                    }
                } catch (error) {
                    console.error("Failed to fetch category", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchCat();
        }
    }, [id, isEdit, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit && id) {
                await api.put(`/project-categories/${id}`, { name, name_en: nameEn });
            } else {
                await api.post('/project-categories', { name, name_en: nameEn });
            }
            navigate('/categories/projects');
        } catch (error: any) {
            console.error("Save failed", error);
            toast.error(`Kaydetme başarısız: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/categories/projects')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">{isEdit ? 'Proje Kategorisi Düzenle' : 'Yeni Proje Kategorisi'}</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Adı (TR) *</label>
                                <input
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">EN Category Name</label>
                                <input
                                    value={nameEn}
                                    onChange={e => setNameEn(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Button type="button" variant="secondary" onClick={() => navigate('/categories/projects')}>İptal</Button>
                        <Button type="submit" disabled={loading}>
                            <Save size={18} />
                            {loading ? 'Kaydediliyor...' : 'Kaydet'}
                        </Button>
                    </div>
                </Card>
            </form>
        </div>
    );
};

export default ProjectCategoryForm;
