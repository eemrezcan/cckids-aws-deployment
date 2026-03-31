import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Mail, Phone, Calendar, Package, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import { QuoteRequest, ProductDetailOut } from '../types';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { useToast } from '../context/ToastContext';

const QuoteDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const [quote, setQuote] = useState<QuoteRequest | null>(null);
    const [product, setProduct] = useState<ProductDetailOut | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            let currentQuote = location.state?.quote as QuoteRequest | undefined;

            try {
                // If we don't have the quote from the previous page (e.g. direct link),
                // we need to fetch it. Since GET /quote-requests/:id doesn't exist on backend,
                // we try to find it in the list as a fallback.
                if (!currentQuote && id) {
                    try {
                        const res = await api.get<any>('/quote-requests', { page_size: 100 });
                        currentQuote = res.items.find((q: QuoteRequest) => q.id === Number(id));
                    } catch (e) {
                        console.error("List fetch failed", e);
                    }
                }

                if (currentQuote) {
                    setQuote(currentQuote);
                    
                    // Fetch product details if exists
                    if (currentQuote.product_id) {
                        try {
                            const pRes = await api.get<ProductDetailOut>(`/products/${currentQuote.product_id}`);
                            setProduct(pRes);
                        } catch (e) {
                            console.error("Product fetch failed", e);
                        }
                    }
                } else {
                    toast.error("Teklif bulunamadı");
                    navigate('/quotes');
                }
            } catch (e) {
                console.error(e);
                toast.error("Hata oluştu");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, navigate, location.state]);

    const updateStatus = async (status: string) => {
        if (!quote) return;
        try {
            // Backend requires PUT for this endpoint
            await api.put(`/quote-requests/${quote.id}`, { status });
            setQuote({ ...quote, status });
            toast.success("Durum güncellendi");
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;
    if (!quote) return <div className="p-8 text-center text-gray-500">Bulunamadı</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="secondary" onClick={() => navigate('/quotes')}>
                    <ChevronLeft size={16} /> Geri
                </Button>
                <h1 className="text-2xl font-bold text-gray-800">Teklif Detayı #{quote.id}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card title="Mesaj İçeriği">
                        <div className="space-y-4">
                             <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <MessageSquare className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                                <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{quote.message}</p>
                             </div>
                             <div className="flex gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    {new Date(quote.created_at).toLocaleString('tr-TR')}
                                </div>
                             </div>
                        </div>
                    </Card>

                    {product && (
                        <Card title="İlgili Ürün">
                            <div className="flex items-center gap-4">
                                {product.cover_image_url ? (
                                    <img src={product.cover_image_url} className="w-16 h-16 rounded-lg object-cover border border-gray-200" alt="" />
                                ) : (
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                        <Package />
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-semibold text-gray-800">{product.name}</h4>
                                    <Button 
                                        variant="secondary" 
                                        className="mt-2 text-xs py-1 px-3 h-8"
                                        onClick={() => navigate(`/products/${product.id}`)}
                                    >
                                        Ürüne Git
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card title="Müşteri Bilgileri">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">İsim Soyisim</label>
                                <div className="font-medium text-gray-800">{quote.name}</div>
                            </div>
                            {quote.email && (
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">E-posta</label>
                                    <div className="flex items-center gap-2">
                                        <Mail size={14} className="text-gray-400" />
                                        <a href={`mailto:${quote.email}`} className="text-indigo-600 hover:underline text-sm">{quote.email}</a>
                                    </div>
                                </div>
                            )}
                            {quote.phone && (
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Telefon</label>
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} className="text-gray-400" />
                                        <a href={`tel:${quote.phone}`} className="text-indigo-600 hover:underline text-sm">{quote.phone}</a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card title="Durum Yönetimi">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="text-sm font-medium text-gray-600">Mevcut Durum:</span>
                                <Badge status={quote.status} />
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <button
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${quote.status === 'PENDING' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
                                    onClick={() => updateStatus('PENDING')}
                                >
                                    Bekliyor
                                </button>
                                <button 
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${quote.status === 'REVIEWED' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
                                    onClick={() => updateStatus('REVIEWED')}
                                >
                                    İncelendi
                                </button>
                                <button 
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${quote.status === 'RESPONDED' ? 'bg-green-50 text-green-700 font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
                                    onClick={() => updateStatus('RESPONDED')}
                                >
                                    Yanıtlandı
                                </button>
                                <button 
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${quote.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-700 font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
                                    onClick={() => updateStatus('ARCHIVED')}
                                >
                                    Arşivle
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default QuoteDetail;