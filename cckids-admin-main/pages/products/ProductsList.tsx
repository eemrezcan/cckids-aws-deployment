import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { api } from '../../services/api';
import { Product } from '../../types';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';

const ProductsList = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const navigate = useNavigate();
    const toast = useToast();

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<any>('/products');
            setProducts(res.items);
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
            await api.delete(`/products/${deleteId}`);
            await fetchProducts();
            setDeleteId(null);
        } catch (error: any) {
            toast.error(`İşlem başarısız: ${error.message}`);
        } finally {
            setDeleting(false);
        }
    }

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Ürünler</h1>
                <Button onClick={() => navigate('/products/new')}><Plus size={16} /> Ürün Ekle</Button>
            </div>

            <Card className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                                <th className="px-6 py-4">İsim</th>
                                <th className="px-6 py-4">Durum</th>
                                <th className="px-6 py-4">Sıra</th>
                                <th className="px-6 py-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Ürünler yükleniyor...</td></tr>
                            ) : products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {product.cover_image_url ? (
                                                <img src={product.cover_image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                    <ImageIcon size={16} />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-gray-900">{product.name}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-[200px]">{product.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><Badge status={String(product.is_active)} /></td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">{product.sort_order}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                type="button"
                                                onClick={() => navigate(`/products/${product.id}`)}
                                                className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => handleDeleteClick(product.id)}
                                                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && products.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Ürün bulunamadı.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <ConfirmModal 
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                loading={deleting}
                title="Ürünü Sil"
                message="Bu ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
            />
        </div>
    );
};

export default ProductsList;