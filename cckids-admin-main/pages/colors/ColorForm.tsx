import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import { api } from '../../services/api';
import { Color } from '../../types';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { useToast } from '../../context/ToastContext';

const ColorForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const toast = useToast();
    
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        hex: '#000000'
    });

    useEffect(() => {
        if (isEdit && id) {
            const fetchColor = async () => {
                setLoading(true);
                try {
                    try {
                        const res = await api.get<Color>(`/colors/${id}`);
                        setFormData({ name: res.name, hex: res.hex });
                    } catch (e) {
                         const listRes = await api.get<any>('/colors');
                         const found = listRes.items.find((c: Color) => c.id === Number(id));
                         if (found) {
                             setFormData({ name: found.name, hex: found.hex });
                         } else {
                             throw new Error("Renk bulunamadı");
                         }
                    }
                } catch (error) {
                    console.error("Failed to fetch color", error);
                    navigate('/colors');
                } finally {
                    setLoading(false);
                }
            };
            fetchColor();
        }
    }, [id, isEdit, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit && id) {
                await api.put(`/colors/${id}`, formData);
            } else {
                await api.post('/colors', formData);
            }
            navigate('/colors');
        } catch (error: any) {
            console.error("Save failed", error);
            toast.error(`Hata: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/colors')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">{isEdit ? 'Renk Düzenle' : 'Yeni Renk Ekle'}</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Renk Adı</label>
                            <input 
                                name="name" 
                                required 
                                value={formData.name} 
                                onChange={handleChange} 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                                placeholder="Örn: Gece Mavisi"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hex Kodu</label>
                            <div className="flex gap-4 items-center">
                                <div className="relative">
                                    <input 
                                        type="color"
                                        name="hex"
                                        value={formData.hex}
                                        onChange={handleChange}
                                        className="h-12 w-24 p-1 rounded-lg border border-gray-300 cursor-pointer"
                                    />
                                </div>
                                <input 
                                    name="hex" 
                                    required 
                                    value={formData.hex} 
                                    onChange={handleChange} 
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono uppercase" 
                                    placeholder="#000000"
                                    pattern="^#+([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Seçiciden bir renk seçin veya manuel Hex kodu girin.</p>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Button type="button" variant="secondary" onClick={() => navigate('/colors')}>İptal</Button>
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

export default ColorForm;