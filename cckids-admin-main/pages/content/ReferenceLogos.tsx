import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Trash2, ChevronLeft } from 'lucide-react';
import { api } from '../../services/api';
import { ReferenceLogo, UploadOut } from '../../types';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';

const ReferenceLogos = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [logos, setLogos] = useState<ReferenceLogo[]>([]);
    
    // Modal
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [uploading, setUploading] = useState(false);

    const fetchLogos = async () => {
        try {
            const res = await api.get<any>('/reference-logos');
            setLogos(res.items);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchLogos();
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        
        // Calculate safe sort order
        const maxOrder = logos.reduce((max, logo) => (logo.sort_order > max ? logo.sort_order : max), 0);
        const nextOrder = maxOrder + 1;

        // Backend expects multipart/form-data with 'file' and 'sort_order' directly
        const formData = new FormData();
        formData.append('file', file);
        formData.append('sort_order', String(nextOrder));

        try {
            const BASE_URL = (import.meta as any).env?.VITE_API_URL || 
                             (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || 
                             'https://api.cckkids.com';
            
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${BASE_URL}/admin/reference-logos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                const msg = err.detail 
                    ? (typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail)) 
                    : 'Yükleme başarısız';
                throw new Error(msg);
            }
            
            await fetchLogos();
            // Reset input
            e.target.value = '';
        } catch (e: any) {
            toast.error(`Yükleme başarısız: ${e.message}`);
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
            await api.delete(`/reference-logos/${deleteId}`);
            setLogos(prev => prev.filter(l => l.id !== deleteId));
            setDeleteId(null);
        } catch (e: any) {
            toast.error(`Silme başarısız: ${e.message}`);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
                <Button variant="secondary" onClick={() => navigate('/content')}><ChevronLeft size={16} /> Geri</Button>
                <h1 className="text-2xl font-bold text-gray-800">Referans Logoları</h1>
            </div>

            <Card>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {logos.map(logo => (
                        <div key={logo.id} className="relative aspect-square group rounded-xl border border-gray-200 p-4 flex items-center justify-center bg-gray-50">
                            <img src={logo.url} className="max-w-full max-h-full object-contain" alt="" />
                            <button 
                                type="button"
                                onClick={() => handleDeleteClick(logo.id)}
                                className="absolute top-2 right-2 bg-white shadow-sm p-1.5 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                     <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 border-gray-300 transition-colors">
                        <UploadCloud className={`mb-2 ${uploading ? 'text-indigo-500 animate-bounce' : 'text-gray-400'}`} />
                        <span className="text-xs text-gray-500 font-medium">{uploading ? 'Yükleniyor...' : 'Logo Yükle'}</span>
                        <input type="file" hidden onChange={handleUpload} accept="image/*" disabled={uploading} />
                    </label>
                </div>
            </Card>

            <ConfirmModal 
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                loading={deleting}
                title="Logoyu Sil"
                message="Bu referans logosunu silmek istediğinize emin misiniz?"
            />
        </div>
    );
};

export default ReferenceLogos;