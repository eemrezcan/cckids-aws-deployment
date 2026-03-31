import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { QuoteRequest } from '../types';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const QuoteRequests = () => {
    const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();
    const navigate = useNavigate();

    const fetchQuotes = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<any>('/quote-requests');
            setQuotes(res.items);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateStatus = async (e: React.MouseEvent, id: number, status: string) => {
        e.stopPropagation();
        try {
            // Backend requires PUT for this endpoint
            await api.put(`/quote-requests/${id}`, { status });
            fetchQuotes();
        } catch (error: any) {
            toast.error(`Güncelleme başarısız: ${error.message}`);
        }
    };

    useEffect(() => {
        fetchQuotes();
    }, [fetchQuotes]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Teklif İstekleri</h1>
            </div>

            <Card className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                                <th className="px-6 py-4">Müşteri</th>
                                <th className="px-6 py-4">Mesaj</th>
                                <th className="px-6 py-4">Durum</th>
                                <th className="px-6 py-4">Tarih</th>
                                <th className="px-6 py-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">İstekler yükleniyor...</td></tr>
                            ) : quotes.map((quote) => (
                                <tr 
                                    key={quote.id} 
                                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                    onClick={() => navigate(`/quotes/${quote.id}`, { state: { quote } })}
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">{quote.name}</div>
                                        <div className="text-xs text-gray-500">{quote.email || quote.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={quote.message}>{quote.message}</td>
                                    <td className="px-6 py-4"><Badge status={quote.status} /></td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">{new Date(quote.created_at).toLocaleDateString('tr-TR')}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {quote.status === 'PENDING' && (
                                                <button onClick={(e) => updateStatus(e, quote.id, 'REVIEWED')} className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md hover:bg-indigo-100 font-medium">
                                                    İncelendi İşaretle
                                                </button>
                                            )}
                                            {quote.status !== 'RESPONDED' && (
                                                <button onClick={(e) => updateStatus(e, quote.id, 'RESPONDED')} className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-md hover:bg-green-100 font-medium">
                                                    Yanıtlandı İşaretle
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default QuoteRequests;