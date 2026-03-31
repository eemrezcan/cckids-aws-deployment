import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, UploadCloud, Trash2, ChevronLeft } from 'lucide-react';
import { api } from '../../services/api';
import { About, AboutImage, UploadOut } from '../../types';
import Button from '../../components/Button';
import Card from '../../components/Card';
import LanguageTabs from '../../components/LanguageTabs';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';

const AboutManager = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [content, setContent] = useState('');
    const [contentEn, setContentEn] = useState('');
    const [images, setImages] = useState<AboutImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Modal
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchData = async () => {
        try {
            const aboutRes = await api.get<About>('/about');
            setContent(aboutRes.content || '');
            setContentEn(aboutRes.content_en || '');
            
            const imgRes = await api.get<any>('/about/images');
            setImages(imgRes.items);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSaveText = async () => {
        setLoading(true);
        try {
            await api.put('/about', { content, content_en: contentEn });
            toast.success('Metin kaydedildi.');
        } catch (e: any) {
            toast.error(`Hata: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setUploading(true);

        // Calculate safe sort order
        const maxOrder = images.reduce((max, img) => (img.sort_order > max ? img.sort_order : max), 0);
        const nextOrder = maxOrder + 1;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('sort_order', String(nextOrder));

        try {
            await api.uploadWithFormData('/about/images', formData);

            fetchData();
            e.target.value = ''; // Reset input
        } catch (e: any) {
            toast.error(`Yükleme hatası: ${e.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await api.delete(`/about/images/${deleteId}`);
            setImages(prev => prev.filter(i => i.id !== deleteId));
            setDeleteId(null);
        } catch (e: any) {
            toast.error(`Silme hatası: ${e.message}`);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
                <Button variant="secondary" onClick={() => navigate('/content')}><ChevronLeft size={16} /> Geri</Button>
                <h1 className="text-2xl font-bold text-gray-800">Hakkımızda Sayfası</h1>
            </div>

            <Card title="Hakkımızda Metni">
                <div className="space-y-4">
                    <LanguageTabs>
                        {(lang) => (
                            <textarea
                                value={lang === 'tr' ? content : contentEn}
                                onChange={e => (lang === 'tr' ? setContent(e.target.value) : setContentEn(e.target.value))}
                                rows={8}
                                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder={lang === 'tr' ? 'Hikayemiz...' : 'Our story...'}
                            />
                        )}
                    </LanguageTabs>
                    <div className="flex justify-end">
                        <Button onClick={handleSaveText} disabled={loading}><Save size={16} /> Metni Kaydet</Button>
                    </div>
                </div>
            </Card>

            <Card title="Hakkımızda Galerisi">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map(img => (
                        <div key={img.id} className="relative aspect-square group rounded-lg overflow-hidden border border-gray-200">
                            <img src={img.url} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button 
                                    type="button"
                                    onClick={() => handleDeleteClick(img.id)} 
                                    className="bg-white p-2 rounded-full text-red-600"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                    <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 border-gray-300 transition-colors">
                        <UploadCloud className={`mb-2 ${uploading ? 'text-indigo-500 animate-bounce' : 'text-gray-400'}`} />
                        <span className="text-xs text-gray-500 font-medium">{uploading ? 'Yükleniyor...' : 'Görsel Ekle'}</span>
                        <input type="file" hidden onChange={handleUpload} accept="image/*" disabled={uploading} />
                    </label>
                </div>
            </Card>

            <ConfirmModal 
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                loading={deleting}
                title="Görseli Sil"
                message="Bu görseli silmek istediğinize emin misiniz?"
            />
        </div>
    );
};

export default AboutManager;
