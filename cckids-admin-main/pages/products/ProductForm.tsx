import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    ChevronLeft,
    Save,
    Trash2,
    Plus,
    X,
    UploadCloud,
    Loader2,
    Ruler,
    List,
    FileText,
    Settings as SettingsIcon,
    Layers
} from 'lucide-react';
import { api } from '../../services/api';
import { 
    ProductCreatePayload, 
    ProductDetailOut, 
    ProductDetails,
    Category,
    Color,
    UploadOut,
    ProductImage,
    ProductSize
} from '../../types';
import Button from '../../components/Button';
import Card from '../../components/Card';
import LanguageTabs from '../../components/LanguageTabs';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';

type DetailsTarget = 'details' | 'details_en';

const getEmptyDetails = (): ProductDetails => ({
    ozet_ozellik: ['', '', '', ''],
    aciklama: { aciklama_detay: '' },
    teknik_ozellikler: [],
    malzeme_uretim: []
});

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const toast = useToast();
    
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [galleryUploading, setGalleryUploading] = useState(false);

    // Meta data for selections
    const [categories, setCategories] = useState<Category[]>([]);
    const [colors, setColors] = useState<Color[]>([]);
    
    // Additional data for gallery mapping
    const [productImages, setProductImages] = useState<ProductImage[]>([]);
    const [productSizes, setProductSizes] = useState<ProductSize[]>([]);

    // Confirmation State
    const [deleteModal, setDeleteModal] = useState<{
        open: boolean;
        type: 'size' | 'image' | null;
        id: number | null;
    }>({ open: false, type: null, id: null });
    const [deleting, setDeleting] = useState(false);

    // New Size Input State
    const [newSize, setNewSize] = useState({
        width: '',
        height: '',
        depth: '',
        unit: 'cm',
        sort_order: 0
    });
    const [addingSize, setAddingSize] = useState(false);

    // Form Data
    const [formData, setFormData] = useState<ProductCreatePayload>({
        name: '',
        name_en: '',
        description: '',
        description_en: '',
        has_size: false,
        is_active: true,
        sort_order: 0,
        cover_image_url: '',
        cover_image_uuid: '',
        category_ids: [],
        color_ids: [],
        details: {
            ozet_ozellik: ['', '', '', ''],
            aciklama: { aciklama_detay: '' },
            teknik_ozellikler: [],
            malzeme_uretim: []
        },
        details_en: getEmptyDetails()
    });

    // Fetch initial data
    useEffect(() => {
        const loadMeta = async () => {
            try {
                const [catRes, colRes] = await Promise.all([
                    api.get<any>('/categories'),
                    api.get<any>('/colors')
                ]);
                setCategories(catRes.items);
                setColors(colRes.items);
            } catch (err) {
                console.error("Failed to load metadata", err);
            }
        };
        loadMeta();

        if (isEdit && id) {
            const fetchProduct = async () => {
                try {
                    setLoading(true);
                    const res = await api.get<ProductDetailOut>(`/products/${id}`);
                    setFormData({
                        name: res.name,
                        name_en: res.name_en || '',
                        description: res.description || '',
                        description_en: res.description_en || '',
                        has_size: res.has_size,
                        is_active: res.is_active,
                        sort_order: res.sort_order,
                        cover_image_url: res.cover_image_url || '',
                        cover_image_uuid: res.cover_image_uuid || '',
                        category_ids: res.categories?.map(c => c.id) || [],
                        color_ids: res.colors?.map(c => c.id) || [],
                        details: {
                            ozet_ozellik: res.details?.ozet_ozellik || ['', '', '', ''],
                            aciklama: res.details?.aciklama || { aciklama_detay: '' },
                            teknik_ozellikler: res.details?.teknik_ozellikler || [],
                            malzeme_uretim: res.details?.malzeme_uretim || []
                        },
                        details_en: {
                            ozet_ozellik: res.details_en?.ozet_ozellik || ['', '', '', ''],
                            aciklama: res.details_en?.aciklama || { aciklama_detay: '' },
                            teknik_ozellikler: res.details_en?.teknik_ozellikler || [],
                            malzeme_uretim: res.details_en?.malzeme_uretim || []
                        }
                    });
                    
                    // Set images and sizes
                    setProductImages(res.images || []);
                    setProductSizes(res.sizes || []);
                    
                } catch (error) {
                    console.error("Failed to fetch product", error);
                    toast.error("İşlem başarısız: Ürün detayları yüklenemedi.");
                    navigate('/products');
                } finally {
                    setLoading(false);
                }
            };
            fetchProduct();
        }
    }, [id, isEdit, navigate]);

    // Handle Cover Image Upload (Generic Upload)
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await api.upload<UploadOut>('/uploads', file);
            setFormData(prev => ({
                ...prev,
                cover_image_url: res.url,
                cover_image_uuid: res.uuid
            }));
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            toast.error("İşlem başarısız: " + msg);
        } finally {
            setUploading(false);
        }
    };

    // --- SIZE MANAGEMENT ---
    const handleAddSize = async () => {
        if (!id) return;
        if (!newSize.width || !newSize.height || !newSize.depth) {
            toast.info("Lütfen tüm boyut bilgilerini giriniz.");
            return;
        }

        setAddingSize(true);
        try {
            const payload = {
                width: parseInt(newSize.width),
                height: parseInt(newSize.height),
                depth: parseInt(newSize.depth),
                unit: newSize.unit,
                sort_order: Number(newSize.sort_order)
            };
            const res = await api.post<ProductSize>(`/products/${id}/sizes`, payload);
            setProductSizes(prev => [...prev, res]);
            setNewSize({ width: '', height: '', depth: '', unit: 'cm', sort_order: 0 }); // Reset form
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            toast.error("İşlem başarısız: " + msg);
        } finally {
            setAddingSize(false);
        }
    };

    const handleDeleteSizeClick = (sizeId: number) => {
        setDeleteModal({ open: true, type: 'size', id: sizeId });
    };

    // Handle Gallery Image Upload (Direct to Product)
    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !id) return;

        setGalleryUploading(true);
        try {
            // Calculate next sort order based on max existing order to avoid conflicts
            const maxOrder = productImages.reduce((max, img) => (img.sort_order > max ? img.sort_order : max), 0);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('sort_order', String(maxOrder + 1));

            const newImage = await api.uploadWithFormData<ProductImage>(`/products/${id}/images`, formData);
            setProductImages(prev => [...prev, newImage]);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            toast.error("İşlem başarısız: " + msg);
        } finally {
            setGalleryUploading(false);
        }
    };

    const handleGalleryDeleteClick = (imageId: number) => {
        setDeleteModal({ open: true, type: 'image', id: imageId });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.id || !deleteModal.type) return;
        setDeleting(true);
        try {
            if (deleteModal.type === 'size') {
                await api.delete(`/product-sizes/${deleteModal.id}`);
                setProductSizes(prev => prev.filter(s => s.id !== deleteModal.id));
            } else if (deleteModal.type === 'image') {
                await api.delete(`/product-images/${deleteModal.id}`);
                setProductImages(prev => prev.filter(img => img.id !== deleteModal.id));
            }
            setDeleteModal({ open: false, type: null, id: null });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            toast.error("İşlem başarısız: " + msg);
        } finally {
            setDeleting(false);
        }
    };

    const updateImageMapping = (imageId: number, field: 'color_id' | 'size_id', value: string) => {
        const val = value ? parseInt(value) : null;
        setProductImages(prev => prev.map(img => 
            img.id === imageId ? { ...img, [field]: val } : img
        ));
    };

    const updateImageOrder = (imageId: number, value: string) => {
        const order = parseInt(value) || 0;
        setProductImages(prev => prev.map(img => 
            img.id === imageId ? { ...img, sort_order: order } : img
        ));
    };

    // --- PRODUCT DETAILS MANAGEMENT ---

    const updateDetailSummary = (index: number, value: string, target: DetailsTarget) => {
        const currentDetails = formData[target] || getEmptyDetails();
        const newSummary = [...(currentDetails.ozet_ozellik || ['', '', '', ''])];
        newSummary[index] = value;
        setFormData(prev => ({
            ...prev,
            [target]: { ...(prev[target] || getEmptyDetails()), ozet_ozellik: newSummary }
        }));
    };
    
    const addTechSpec = (target: DetailsTarget) => {
        const currentDetails = formData[target] || getEmptyDetails();
        const currentSpecs = currentDetails.teknik_ozellikler || [];
        if (currentSpecs.length >= 9) {
            toast.info("Maksimum 9 teknik özellik eklenebilir.");
            return;
        }
        setFormData(prev => ({
            ...prev,
            [target]: { 
                ...(prev[target] || getEmptyDetails()), 
                teknik_ozellikler: [...currentSpecs, { "Özellik": "" }] 
            }
        }));
    };

    const updateTechSpec = (index: number, key: string, value: string, target: DetailsTarget) => {
        const currentDetails = formData[target] || getEmptyDetails();
        const newSpecs = [...(currentDetails.teknik_ozellikler || [])];
        newSpecs[index] = { [key]: value };
        setFormData(prev => ({
            ...prev,
            [target]: { ...(prev[target] || getEmptyDetails()), teknik_ozellikler: newSpecs }
        }));
    };

    const removeTechSpec = (index: number, target: DetailsTarget) => {
        const currentDetails = formData[target] || getEmptyDetails();
        const newSpecs = [...(currentDetails.teknik_ozellikler || [])];
        newSpecs.splice(index, 1);
        setFormData(prev => ({
            ...prev,
            [target]: { ...(prev[target] || getEmptyDetails()), teknik_ozellikler: newSpecs }
        }));
    };

    const addMaterialSection = (target: DetailsTarget) => {
        const currentDetails = formData[target] || getEmptyDetails();
        const currentSections = currentDetails.malzeme_uretim || [];
        if (currentSections.length >= 6) {
            toast.info("Maksimum 6 malzeme bölümü eklenebilir.");
            return;
        }

        setFormData(prev => ({
            ...prev,
            [target]: {
                ...(prev[target] || getEmptyDetails()),
                malzeme_uretim: [...((prev[target] || getEmptyDetails()).malzeme_uretim || []), { baslik: "", items: [""] }]
            }
        }));
    };

    const updateMaterialTitle = (index: number, title: string, target: DetailsTarget) => {
        const currentDetails = formData[target] || getEmptyDetails();
        const newMats = [...(currentDetails.malzeme_uretim || [])];
        newMats[index] = { ...newMats[index], baslik: title };
        setFormData(prev => ({
            ...prev,
            [target]: { ...(prev[target] || getEmptyDetails()), malzeme_uretim: newMats }
        }));
    };

    const addMaterialItem = (sectionIndex: number, target: DetailsTarget) => {
        const currentDetails = formData[target] || getEmptyDetails();
        const newMats = [...(currentDetails.malzeme_uretim || [])];
        if (newMats[sectionIndex].items.length >= 20) {
            toast.info("Bölüm başına maksimum 20 madde eklenebilir.");
            return;
        }
        newMats[sectionIndex].items.push("");
        setFormData(prev => ({
            ...prev,
            [target]: { ...(prev[target] || getEmptyDetails()), malzeme_uretim: newMats }
        }));
    };

    const updateMaterialItem = (sectionIndex: number, itemIndex: number, value: string, target: DetailsTarget) => {
        const currentDetails = formData[target] || getEmptyDetails();
        const newMats = [...(currentDetails.malzeme_uretim || [])];
        newMats[sectionIndex].items[itemIndex] = value;
        setFormData(prev => ({
            ...prev,
            [target]: { ...(prev[target] || getEmptyDetails()), malzeme_uretim: newMats }
        }));
    };
    
    const removeMaterialSection = (index: number, target: DetailsTarget) => {
        const currentDetails = formData[target] || getEmptyDetails();
        const newMats = [...(currentDetails.malzeme_uretim || [])];
        newMats.splice(index, 1);
        setFormData(prev => ({
            ...prev,
            [target]: { ...(prev[target] || getEmptyDetails()), malzeme_uretim: newMats }
        }));
    };
    
    const removeMaterialItem = (sectionIndex: number, itemIndex: number, target: DetailsTarget) => {
        const currentDetails = formData[target] || getEmptyDetails();
        const newMats = [...(currentDetails.malzeme_uretim || [])];
        newMats[sectionIndex].items.splice(itemIndex, 1);
        setFormData(prev => ({
            ...prev,
            [target]: { ...(prev[target] || getEmptyDetails()), malzeme_uretim: newMats }
        }));
    };

    const toggleIdInList = (listName: 'category_ids' | 'color_ids', id: number) => {
        setFormData(prev => {
            const list = prev[listName] || [];
            if (list.includes(id)) {
                return { ...prev, [listName]: list.filter(item => item !== id) };
            } else {
                return { ...prev, [listName]: [...list, id] };
            }
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
             const checked = (e.target as HTMLInputElement).checked;
             setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'number') {
             setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
        } else {
             setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = JSON.parse(JSON.stringify(formData));

        const cleanDetails = (details?: ProductDetails | null): ProductDetails | null => {
            if (!details) return null;
            const cleaned: ProductDetails = JSON.parse(JSON.stringify(details));
            let summary = cleaned.ozet_ozellik || [];
            while (summary.length < 4) summary.push("");
            if (summary.length > 4) summary = summary.slice(0, 4);
            cleaned.ozet_ozellik = summary;

            if (cleaned.malzeme_uretim) {
                const cleanMaterials = [];
                for (const section of cleaned.malzeme_uretim) {
                    const title = (section.baslik || "").trim();
                    if (title.length > 0) {
                         const validItems = (section.items || []).filter((i: string) => i.trim() !== "");
                         if (validItems.length > 0) {
                             cleanMaterials.push({ baslik: title, items: validItems });
                         }
                    }
                }
                cleaned.malzeme_uretim = cleanMaterials;
            }

            return cleaned;
        };

        const isDetailsEmpty = (details?: ProductDetails | null) => {
            if (!details) return true;
            const summaryEmpty = (details.ozet_ozellik || []).every((x) => !x || !x.trim());
            const descEmpty = !details.aciklama?.aciklama_detay?.trim();
            const specsEmpty = (details.teknik_ozellikler || []).every((s) => {
                const key = Object.keys(s)[0] || '';
                const value = Object.values(s)[0] || '';
                return !key.trim() && !String(value).trim();
            });
            const materialsEmpty = (details.malzeme_uretim || []).every((m) => {
                const titleEmpty = !m.baslik?.trim();
                const itemsEmpty = (m.items || []).every((i) => !i.trim());
                return titleEmpty && itemsEmpty;
            });
            return summaryEmpty && descEmpty && specsEmpty && materialsEmpty;
        };

        payload.details = cleanDetails(payload.details);
        payload.details_en = cleanDetails(payload.details_en);
        if (isDetailsEmpty(payload.details_en)) {
            payload.details_en = null;
        }

        try {
            let productId = id;
            if (isEdit && id) {
                await api.put(`/products/${id}`, payload);
            } else {
                const res = await api.post<{id: number}>('/products', payload);
                productId = String(res.id);
            }

            if (productId && productImages.length > 0) {
                await Promise.all(productImages.map(img => 
                    api.put(`/product-images/${img.id}`, {
                        sort_order: img.sort_order < 1 ? 1 : img.sort_order, // Enforce min 1 to avoid 'ge=1' errors
                        color_id: img.color_id,
                        size_id: img.size_id
                    })
                ));
            }

            navigate('/products');
        } catch (error) {
            console.error("Save failed", error);
            const msg = error instanceof Error ? error.message : String(error);
            toast.error(`İşlem başarısız: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEdit && !formData.name) {
        return <div className="p-8 text-center text-gray-500">Ürün detayları yükleniyor...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/products')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">{isEdit ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card title="Temel Bilgiler">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Adı (TR) *</label>
                                        <input
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="Örn: Modern Kanepe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name (EN)</label>
                                        <input
                                            name="name_en"
                                            value={formData.name_en || ''}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="e.g. Modern Sofa"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kısa Açıklama</label>
                                    <LanguageTabs>
                                        {(lang) => (
                                            <textarea
                                                name={lang === 'tr' ? 'description' : 'description_en'}
                                                rows={3}
                                                value={lang === 'tr' ? formData.description || '' : formData.description_en || ''}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                placeholder={lang === 'tr' ? 'Ürün listesinde görünecek kısa açıklama...' : 'Short description for product list...'}
                                            />
                                        )}
                                    </LanguageTabs>
                                </div>
                            </div>
                        </Card>

                        {/* DETAILED INFO CARD */}
                        <Card title="Detaylı Bilgiler">
                            <LanguageTabs>
                                {(lang) => {
                                    const target: DetailsTarget = lang === 'tr' ? 'details' : 'details_en';
                                    const details = formData[target] || getEmptyDetails();
                                    return (
                                        <div className="space-y-6">
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                                    <List size={16} /> Özet Özellikler (Maks 4 Madde)
                                                </label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {[0, 1, 2, 3].map(idx => (
                                                        <input
                                                            key={idx}
                                                            placeholder={lang === 'tr' ? `${idx + 1}. Özellik` : `${idx + 1}. Feature`}
                                                            value={details.ozet_ozellik?.[idx] || ''}
                                                            onChange={(e) => updateDetailSummary(idx, e.target.value, target)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                                    <FileText size={16} /> Detaylı Ürün Açıklaması
                                                </label>
                                                <textarea
                                                    rows={5}
                                                    value={details.aciklama?.aciklama_detay || ''}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        [target]: {
                                                            ...(prev[target] || getEmptyDetails()),
                                                            aciklama: { aciklama_detay: e.target.value }
                                                        }
                                                    }))}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>

                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                        <SettingsIcon size={16} /> Teknik Özellikler
                                                    </label>
                                                    <button type="button" onClick={() => addTechSpec(target)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                                                        + Özellik Ekle
                                                    </button>
                                                </div>
                                                <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                    {details.teknik_ozellikler?.map((spec, idx) => {
                                                        const key = Object.keys(spec)[0] || '';
                                                        const val = Object.values(spec)[0] || '';
                                                        return (
                                                            <div key={idx} className="flex gap-2">
                                                                <input
                                                                    placeholder={lang === 'tr' ? 'Başlık' : 'Label'}
                                                                    value={key}
                                                                    onChange={(e) => updateTechSpec(idx, e.target.value, String(val), target)}
                                                                    className="w-1/3 px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                                                                />
                                                                <input
                                                                    placeholder={lang === 'tr' ? 'Değer' : 'Value'}
                                                                    value={String(val)}
                                                                    onChange={(e) => updateTechSpec(idx, key, e.target.value, target)}
                                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                                                                />
                                                                <button type="button" onClick={() => removeTechSpec(idx, target)} className="text-red-500 hover:text-red-700">
                                                                    <X size={16} />
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                    {(!details.teknik_ozellikler || details.teknik_ozellikler.length === 0) && (
                                                        <div className="text-center text-xs text-gray-400 py-2">Henüz teknik özellik eklenmemiş.</div>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                        <Layers size={16} /> Malzeme ve Üretim Bilgileri
                                                    </label>
                                                    <button type="button" onClick={() => addMaterialSection(target)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                                                        + Bölüm Ekle
                                                    </button>
                                                </div>
                                                <div className="space-y-4">
                                                    {details.malzeme_uretim?.map((section, sIdx) => (
                                                        <div key={sIdx} className="border border-gray-200 rounded-lg p-3 bg-white">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <input
                                                                    placeholder={lang === 'tr' ? 'Bölüm Başlığı' : 'Section Title'}
                                                                    value={section.baslik}
                                                                    onChange={(e) => updateMaterialTitle(sIdx, e.target.value, target)}
                                                                    className="font-medium text-sm text-gray-800 border-b border-transparent hover:border-gray-300 focus:border-indigo-500 outline-none w-full mr-2"
                                                                />
                                                                <button type="button" onClick={() => removeMaterialSection(sIdx, target)} className="text-red-500">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                            <div className="space-y-2 pl-2 border-l-2 border-gray-100">
                                                                {section.items.map((item, iIdx) => (
                                                                    <div key={iIdx} className="flex gap-2 items-center">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                                                                        <input
                                                                            placeholder={lang === 'tr' ? 'Madde açıklaması...' : 'Item description...'}
                                                                            value={item}
                                                                            onChange={(e) => updateMaterialItem(sIdx, iIdx, e.target.value, target)}
                                                                            className="flex-1 text-sm bg-transparent outline-none border-b border-gray-100 focus:border-indigo-300 py-1"
                                                                        />
                                                                        <button type="button" onClick={() => removeMaterialItem(sIdx, iIdx, target)} className="text-gray-400 hover:text-red-500">
                                                                            <X size={12} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                                <button type="button" onClick={() => addMaterialItem(sIdx, target)} className="text-xs text-indigo-500 hover:text-indigo-700 pl-4 mt-1">
                                                                    + Madde Ekle
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }}
                            </LanguageTabs>
                        </Card>

                         {/* PRODUCT SIZES SECTION - Only visible if has_size is checked */}
                         {formData.has_size && (
                            <Card title="Boyut Seçenekleri">
                                {!isEdit ? (
                                    <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                        <Ruler className="mx-auto mb-2 text-gray-400" size={24} />
                                        <p>Boyut eklemek için lütfen önce ürünü kaydedin.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* List Existing Sizes */}
                                        {productSizes.length > 0 && (
                                            <div className="grid grid-cols-1 gap-2">
                                                {productSizes.map(size => (
                                                    <div key={size.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-indigo-100 text-indigo-700 p-2 rounded">
                                                                <Ruler size={16} />
                                                            </div>
                                                            <span className="font-medium text-gray-700">
                                                                {size.width} x {size.height} x {size.depth} <span className="text-gray-500 text-sm">{size.unit}</span>
                                                            </span>
                                                        </div>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleDeleteSizeClick(size.id)}
                                                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Add New Size Form */}
                                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                <Plus size={16} /> Yeni Boyut Ekle
                                            </h4>
                                            <div className="grid grid-cols-5 gap-2 items-end">
                                                <div className="col-span-1">
                                                    <label className="text-xs text-gray-500 block mb-1">Genişlik</label>
                                                    <input 
                                                        type="number" 
                                                        value={newSize.width} 
                                                        onChange={(e) => setNewSize({...newSize, width: e.target.value})}
                                                        placeholder="W" 
                                                        className="w-full p-2 border rounded text-sm outline-none focus:border-indigo-500"
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <label className="text-xs text-gray-500 block mb-1">Yükseklik</label>
                                                    <input 
                                                        type="number" 
                                                        value={newSize.height} 
                                                        onChange={(e) => setNewSize({...newSize, height: e.target.value})}
                                                        placeholder="H" 
                                                        className="w-full p-2 border rounded text-sm outline-none focus:border-indigo-500"
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <label className="text-xs text-gray-500 block mb-1">Derinlik</label>
                                                    <input 
                                                        type="number" 
                                                        value={newSize.depth} 
                                                        onChange={(e) => setNewSize({...newSize, depth: e.target.value})}
                                                        placeholder="D" 
                                                        className="w-full p-2 border rounded text-sm outline-none focus:border-indigo-500"
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <label className="text-xs text-gray-500 block mb-1">Birim</label>
                                                    <select 
                                                        value={newSize.unit}
                                                        onChange={(e) => setNewSize({...newSize, unit: e.target.value})}
                                                        className="w-full p-2 border rounded text-sm outline-none focus:border-indigo-500 bg-white"
                                                    >
                                                        <option value="cm">cm</option>
                                                        <option value="mm">mm</option>
                                                        <option value="m">m</option>
                                                        <option value="in">in</option>
                                                    </select>
                                                </div>
                                                <div className="col-span-1">
                                                    <Button 
                                                        type="button" 
                                                        onClick={handleAddSize}
                                                        disabled={addingSize}
                                                        className="w-full py-2 text-sm"
                                                    >
                                                        {addingSize ? '...' : 'Ekle'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        )}

                        {/* PRODUCT GALLERY SECTION */}
                        <Card title="Ürün Galerisi">
                            {!isEdit ? (
                                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                    <p>Görsel eklemek için lütfen önce ürünü kaydedin.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {productImages.map((img) => (
                                            <div key={img.id} className="relative group border border-gray-200 rounded-lg p-2 bg-white hover:shadow-md transition-shadow">
                                                <div className="aspect-square bg-gray-50 rounded overflow-hidden mb-2 relative">
                                                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleGalleryDeleteClick(img.id)}
                                                        className="absolute top-1 right-1 bg-white text-red-600 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div className="col-span-2">
                                                            {/* Color Select */}
                                                            <select 
                                                                className="w-full text-xs p-1.5 border border-gray-200 rounded bg-gray-50 outline-none focus:border-indigo-400"
                                                                value={img.color_id || ''}
                                                                onChange={(e) => updateImageMapping(img.id, 'color_id', e.target.value)}
                                                            >
                                                                <option value="">Renk Yok</option>
                                                                {colors.map(c => (
                                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            {/* Sort Order Input */}
                                                            <input 
                                                                type="number"
                                                                placeholder="Sıra"
                                                                className="w-full text-xs p-1.5 border border-gray-200 rounded bg-gray-50 outline-none focus:border-indigo-400 text-center"
                                                                value={img.sort_order}
                                                                onChange={(e) => updateImageOrder(img.id, e.target.value)}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Size Select - Only if has_size is checked */}
                                                    {formData.has_size && (
                                                        <div>
                                                            <select 
                                                                className="w-full text-xs p-1.5 border border-gray-200 rounded bg-gray-50 outline-none focus:border-indigo-400"
                                                                value={img.size_id || ''}
                                                                onChange={(e) => updateImageMapping(img.id, 'size_id', e.target.value)}
                                                            >
                                                                <option value="">Boyut Yok</option>
                                                                {productSizes.map(s => (
                                                                    <option key={s.id} value={s.id}>
                                                                        {s.width}x{s.height}x{s.depth} {s.unit}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Upload Button */}
                                        <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-indigo-400 transition-colors">
                                            {galleryUploading ? (
                                                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                            ) : (
                                                <>
                                                    <UploadCloud className="w-8 h-8 mb-2 text-gray-400" />
                                                    <span className="text-xs text-gray-500 font-medium text-center px-2">Görsel Yükle</span>
                                                    <input type="file" className="hidden" onChange={handleGalleryUpload} accept="image/*" />
                                                </>
                                            )}
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500 italic">* Renk, boyut ve sıra değişiklikleri "Kaydet" butonuna basıldığında güncellenir.</p>
                                </div>
                            )}
                        </Card>

                        <Card title="Kategoriler">
                             <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                                 {categories.map(cat => (
                                     <label key={cat.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-100">
                                         <input 
                                            type="checkbox" 
                                            checked={formData.category_ids?.includes(cat.id)}
                                            onChange={() => toggleIdInList('category_ids', cat.id)}
                                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                         />
                                         <span className="text-sm text-gray-700">{cat.name}</span>
                                     </label>
                                 ))}
                                 {categories.length === 0 && <p className="text-xs text-gray-400">Kategori bulunamadı.</p>}
                             </div>
                        </Card>

                        <Card title="Renkler (Genel)">
                             <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                                 {colors.map(col => (
                                     <label key={col.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-100">
                                         <input 
                                            type="checkbox" 
                                            checked={formData.color_ids?.includes(col.id)}
                                            onChange={() => toggleIdInList('color_ids', col.id)}
                                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                         />
                                         <div className="w-6 h-6 rounded-full border border-gray-200 shadow-sm" style={{backgroundColor: col.hex}} />
                                         <span className="text-sm text-gray-700">{col.name}</span>
                                     </label>
                                 ))}
                                 {colors.length === 0 && <p className="text-xs text-gray-400">Renk bulunamadı.</p>}
                             </div>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card title="Ayarlar">
                            <div className="space-y-4">
                                <label className="flex items-center justify-between p-2 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <span className="text-sm font-medium text-gray-700">Aktif</span>
                                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${formData.is_active ? 'bg-green-500' : 'bg-gray-300'}`}>
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${formData.is_active ? 'translate-x-4' : ''}`} />
                                    </div>
                                    <input type="checkbox" name="is_active" checked={formData.is_active || false} onChange={handleChange} className="hidden" />
                                </label>

                                <label className="flex items-center justify-between p-2 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <span className="text-sm font-medium text-gray-700">Boyut Seçenekleri Var mı?</span>
                                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${formData.has_size ? 'bg-indigo-500' : 'bg-gray-300'}`}>
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${formData.has_size ? 'translate-x-4' : ''}`} />
                                    </div>
                                    <input type="checkbox" name="has_size" checked={formData.has_size || false} onChange={handleChange} className="hidden" />
                                </label>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sıralama</label>
                                    <input 
                                        type="number" 
                                        name="sort_order" 
                                        value={formData.sort_order} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card title="Kapak Görseli">
                            <div>
                                <div className="mb-4">
                                    {formData.cover_image_url ? (
                                        <div className="relative rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-50 group">
                                            <img 
                                                src={formData.cover_image_url} 
                                                alt="Preview" 
                                                className="h-full w-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                 <button type="button" onClick={() => setFormData(prev => ({...prev, cover_image_url: '', cover_image_uuid: ''}))} className="bg-white text-red-600 p-2 rounded-full">
                                                     <Trash2 size={20} />
                                                 </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                                                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Yükle</span></p>
                                                <p className="text-xs text-gray-500">JPG, PNG</p>
                                            </div>
                                            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                                        </label>
                                    )}
                                </div>
                                {uploading && <div className="text-xs text-center text-indigo-600 animate-pulse">Yükleniyor...</div>}
                                
                                <div className="mt-2">
                                     <label className="text-xs text-gray-500 block mb-1">Veya manuel URL:</label>
                                     <input 
                                        name="cover_image_url" 
                                        value={formData.cover_image_url || ''} 
                                        onChange={handleChange} 
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs"
                                        placeholder="https://..."
                                     />
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:pl-72 flex justify-end gap-3 z-10 shadow-lg-up">
                    <Button type="button" variant="secondary" onClick={() => navigate('/products')}>İptal</Button>
                    <Button type="submit" disabled={loading || uploading || galleryUploading}>
                        <Save size={18} />
                        {loading ? 'Kaydediliyor...' : 'Ürünü Kaydet'}
                    </Button>
                </div>
            </form>

            <ConfirmModal 
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, type: null, id: null })}
                onConfirm={handleConfirmDelete}
                loading={deleting}
                title={deleteModal.type === 'size' ? "Boyutu Sil" : "Görseli Sil"}
                message={deleteModal.type === 'size' 
                    ? "Bu boyut seçeneğini silmek istediğinize emin misiniz?" 
                    : "Bu görseli galeriden kaldırmak istediğinize emin misiniz?"
                }
            />
        </div>
    );
};

export default ProductForm;
