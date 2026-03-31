import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save, Trash2, UploadCloud } from 'lucide-react';
import { api } from '../../services/api';
import { Category, UploadOut } from '../../types';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { useToast } from '../../context/ToastContext';
import { CATEGORY_EMOJI_POOL } from '../../lib/emojiPool';

const ProductCategoryForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const toast = useToast();
    
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    const [formData, setFormData] = useState<{
        name: string;
        name_en: string;
        emoji: string;
        image_url: string;
        image_uuid: string;
    }>({
        name: '',
        name_en: '',
        emoji: '',
        image_url: '',
        image_uuid: ''
    });

    useEffect(() => {
        if (isEdit && id) {
            setLoading(true);
            const fetchCat = async () => {
                try {
                    const res = await api.get<any>('/categories');
                    const found = res.items.find((c: Category) => c.id === Number(id));
                    if (found) {
                        setFormData({
                            name: found.name,
                            name_en: found.name_en || '',
                            emoji: found.emoji || '',
                            image_url: found.image_url || '',
                            image_uuid: found.image_uuid || ''
                        });
                    } else {
                        toast.error("Kategori bulunamadı");
                        navigate('/categories/products');
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await api.upload<UploadOut>('/uploads', file);
            setFormData(prev => ({
                ...prev,
                image_url: res.url,
                image_uuid: res.uuid
            }));
        } catch (err: any) {
            toast.error("Yükleme başarısız: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit && id) {
                await api.put(`/categories/${id}`, formData);
            } else {
                await api.post('/categories', formData);
            }
            navigate('/categories/products');
        } catch (error: any) {
            console.error("Save failed", error);
            toast.error(`Kaydetme başarısız: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Calculate selected emoji details for preview
    const selectedEmojiInfo = formData.emoji ? CATEGORY_EMOJI_POOL[formData.emoji] : null;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/categories/products')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">{isEdit ? 'Kategori Düzenle' : 'Yeni Kategori'}</h1>
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
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">EN Category Name</label>
                                <input
                                    value={formData.name_en}
                                    onChange={e => setFormData({...formData, name_en: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Emoji İkonu</label>
                            <div className="flex gap-4 items-center">
                                <select 
                                    value={formData.emoji}
                                    onChange={e => setFormData({...formData, emoji: e.target.value})}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                >
                                    <option value="">Emoji Seçiniz...</option>
                                    {Object.entries(CATEGORY_EMOJI_POOL).map(([key, info]) => (
                                        <option key={key} value={key}>
                                            {info.emoji} {info.name}
                                        </option>
                                    ))}
                                </select>
                                
                                <div className="w-12 h-10 flex items-center justify-center text-3xl bg-gray-50 border border-gray-200 rounded-lg">
                                    {selectedEmojiInfo ? selectedEmojiInfo.emoji : '❓'}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {selectedEmojiInfo ? `Seçilen: ${selectedEmojiInfo.name}` : 'Kategori için bir ikon seçin.'}
                            </p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori Görseli</label>
                            <div className="flex items-start gap-4">
                                {formData.image_url ? (
                                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 group">
                                        <img src={formData.image_url} alt="Category" className="w-full h-full object-cover" />
                                        <button 
                                            type="button"
                                            onClick={() => setFormData(prev => ({...prev, image_url: '', image_uuid: ''}))}
                                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                        <UploadCloud className="w-6 h-6 mb-2 text-gray-400" />
                                        <span className="text-xs text-gray-500">Yükle</span>
                                        <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                                    </label>
                                )}
                            </div>
                            {uploading && <p className="text-xs text-indigo-600 mt-2">Yükleniyor...</p>}
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Button type="button" variant="secondary" onClick={() => navigate('/categories/products')}>İptal</Button>
                        <Button type="submit" disabled={loading || uploading}>
                            <Save size={18} />
                            {loading ? 'Kaydediliyor...' : 'Kaydet'}
                        </Button>
                    </div>
                </Card>
            </form>
        </div>
    );
};

export default ProductCategoryForm;
