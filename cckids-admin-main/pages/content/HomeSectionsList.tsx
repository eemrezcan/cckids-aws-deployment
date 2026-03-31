import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { HomeSection } from '../../types';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';

const HomeSectionsList = () => {
    const [sections, setSections] = useState<HomeSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const navigate = useNavigate();
    const toast = useToast();

    const fetchSections = async () => {
        setLoading(true);
        try {
            const res = await api.get<any>('/home-sections');
            setSections(res.items);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSections();
    }, []);

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await api.delete(`/home-sections/${deleteId}`);
            await fetchSections();
            setDeleteId(null);
        } catch (e: any) {
            toast.error(`İşlem başarısız: ${e.message}`);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={() => navigate('/content')}>Geri</Button>
                    <h1 className="text-2xl font-bold text-gray-800">Ana Sayfa Bölümleri</h1>
                </div>
                <Button onClick={() => navigate('/content/home-sections/new')}><Plus size={16} /> Bölüm Ekle</Button>
            </div>

            <Card className="p-0">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                        <tr>
                            <th className="px-6 py-4">Medya</th>
                            <th className="px-6 py-4">Başlık / Tür</th>
                            <th className="px-6 py-4">Durum</th>
                            <th className="px-6 py-4">Sıra</th>
                            <th className="px-6 py-4 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sections.map(s => (
                            <tr key={s.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    {s.media_url ? (
                                        <img src={s.media_url} className="w-16 h-10 object-cover rounded bg-gray-100" alt="" />
                                    ) : (
                                        <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">Resim Yok</div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium">{s.title || 'Başlıksız'}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">{s.kind}</div>
                                </td>
                                <td className="px-6 py-4"><Badge status={String(s.is_active)} /></td>
                                <td className="px-6 py-4 text-sm">{s.sort_order}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => navigate(`/content/home-sections/${s.id}`)} 
                                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => handleDeleteClick(s.id)} 
                                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {sections.length === 0 && !loading && (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Bölüm bulunamadı.</td></tr>
                        )}
                    </tbody>
                </table>
            </Card>

            <ConfirmModal 
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                loading={deleting}
                title="Bölümü Sil"
                message="Bu ana sayfa bölümünü silmek istediğinize emin misiniz?"
            />
        </div>
    );
};

export default HomeSectionsList;