import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { Color } from '../../types';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';

const ColorsList = () => {
    const [colors, setColors] = useState<Color[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    
    const navigate = useNavigate();
    const toast = useToast();

    const fetchColors = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<any>('/colors');
            setColors(res.items);
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
            await api.delete(`/colors/${deleteId}`);
            await fetchColors();
            setDeleteId(null);
        } catch (error: any) {
            toast.error(`İşlem başarısız: ${error.message}`);
        } finally {
            setDeleting(false);
        }
    }

    useEffect(() => {
        fetchColors();
    }, [fetchColors]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Renkler</h1>
                <Button onClick={() => navigate('/colors/new')}><Plus size={16} /> Renk Ekle</Button>
            </div>

            <Card className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                                <th className="px-6 py-4">Önizleme</th>
                                <th className="px-6 py-4">İsim</th>
                                <th className="px-6 py-4">Hex Kodu</th>
                                <th className="px-6 py-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Renkler yükleniyor...</td></tr>
                            ) : colors.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Renk bulunamadı.</td></tr>
                            ) : colors.map((color) => (
                                <tr key={color.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div 
                                            className="w-10 h-10 rounded-lg border border-gray-200 shadow-sm" 
                                            style={{ backgroundColor: color.hex }}
                                            title={color.hex}
                                        />
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{color.name}</td>
                                    <td className="px-6 py-4 text-gray-500 font-mono text-sm">{color.hex}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                type="button"
                                                onClick={() => navigate(`/colors/${color.id}`)}
                                                className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => handleDeleteClick(color.id)}
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
                title="Rengi Sil"
                message="Bu rengi silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
            />
        </div>
    );
};

export default ColorsList;