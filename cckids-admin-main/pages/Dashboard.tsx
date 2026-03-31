import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Briefcase, MessageSquare, Loader2, Plus, Settings, LayoutTemplate, Tags } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import Card from '../components/Card';

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProducts: 0,
        activeProjects: 0,
        pendingQuotes: 0
    });
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch all necessary data in parallel
                // Reduced page_size to 100 to avoid backend validation error (max 100)
                const [productsRes, projectsRes, quotesRes] = await Promise.all([
                    api.get<any>('/products', { page_size: 1 }), // Just need count from metadata if available
                    api.get<any>('/projects', { page_size: 100 }), // Filter active
                    api.get<any>('/quote-requests', { page_size: 100 }) // Filter pending & chart
                ]);

                // 1. Calculate Stats
                const activeProjs = projectsRes.items.filter((p: any) => p.is_active).length;
                const pendingQ = quotesRes.items.filter((q: any) => q.status === 'PENDING').length;

                setStats({
                    totalProducts: productsRes.total || productsRes.items.length, 
                    activeProjects: activeProjs,
                    pendingQuotes: pendingQ
                });

                // 2. Prepare Chart Data (Last 7 Days)
                const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
                const last7Days = [...Array(7)].map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    return d;
                });

                const chart = last7Days.map(date => {
                    const dayIndex = date.getDay();
                    const dayName = days[dayIndex];
                    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
                    
                    // Count quotes created on this date
                    const count = quotesRes.items.filter((q: any) => {
                        if (!q.created_at) return false;
                        const qDate = new Date(q.created_at).toISOString().split('T')[0];
                        return qDate === dateStr;
                    }).length;

                    return { name: dayName, quotes: count, date: dateStr };
                });

                setChartData(chart);

            } catch (error) {
                console.error("Dashboard data load failed", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const quickActions = [
        { title: 'Yeni Ürün Ekle', icon: Plus, path: '/products/new', color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' },
        { title: 'Yeni Proje Ekle', icon: Briefcase, path: '/projects/new', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
        { title: 'Teklif İstekleri', icon: MessageSquare, path: '/quotes', color: 'bg-orange-50 text-orange-600 hover:bg-orange-100' },
        { title: 'Site İçeriği', icon: LayoutTemplate, path: '/content', color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
        { title: 'Kategoriler', icon: Tags, path: '/categories/products', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
        { title: 'Ayarlar', icon: Settings, path: '/settings', color: 'bg-gray-50 text-gray-600 hover:bg-gray-100' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Genel Bakış</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-indigo-100 text-sm font-medium">Toplam Ürün</p>
                            <h3 className="text-3xl font-bold mt-1">{stats.totalProducts}</h3>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Package className="text-white" size={24} />
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-none">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Aktif Projeler</p>
                            <h3 className="text-3xl font-bold mt-1">{stats.activeProjects}</h3>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Briefcase className="text-white" size={24} />
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-orange-500 to-amber-600 text-white border-none">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-orange-100 text-sm font-medium">Bekleyen Teklifler</p>
                            <h3 className="text-3xl font-bold mt-1">{stats.pendingQuotes}</h3>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <MessageSquare className="text-white" size={24} />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Son 7 Günlük Teklif İstekleri">
                    <div className="w-full mt-4" style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#6B7280', fontSize: 12}} 
                                    dy={10} 
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#6B7280', fontSize: 12}} 
                                    allowDecimals={false}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{fill: '#F3F4F6'}}
                                    labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                                />
                                <Bar 
                                    dataKey="quotes" 
                                    name="Teklif Sayısı" 
                                    fill="#6366F1" 
                                    radius={[4, 4, 0, 0]} 
                                    barSize={40} 
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Hızlı İşlemler">
                    <div className="grid grid-cols-2 gap-4 h-full content-start mt-2">
                        {quickActions.map((action) => (
                            <button
                                key={action.title}
                                onClick={() => navigate(action.path)}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 border border-transparent ${action.color}`}
                            >
                                <action.icon size={24} className="mb-2" />
                                <span className="text-sm font-medium text-gray-700">{action.title}</span>
                            </button>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;