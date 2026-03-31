import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Package, 
    Briefcase, 
    MessageSquare, 
    Settings, 
    LogOut, 
    Menu, 
    Globe,
    Palette,
    Tags,
    Folder
} from 'lucide-react';
import { api } from '../services/api';
import { AdminUser } from '../types';

const SidebarItem = ({ icon: Icon, label, path, active }: any) => {
    const navigate = useNavigate();
    return (
        <button 
            onClick={() => navigate(path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                active 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                : 'text-gray-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm'
            }`}
        >
            <Icon size={20} className={active ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600'} />
            <span className="font-medium text-sm">{label}</span>
        </button>
    );
};

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState<AdminUser | null>(null);

    useEffect(() => {
        api.get<AdminUser>('/me').then(setUser).catch(() => {
            // Token invalid
            localStorage.removeItem('access_token');
            navigate('/login');
        });
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        navigate('/login');
    };

    const menu = [
        { icon: LayoutDashboard, label: 'Kontrol Paneli', path: '/' },
        { icon: Package, label: 'Ürünler', path: '/products' },
        { icon: Tags, label: 'Ürün Kategorileri', path: '/categories/products' },
        { icon: Palette, label: 'Renkler', path: '/colors' },
        { icon: Briefcase, label: 'Projeler', path: '/projects' },
        { icon: Folder, label: 'Proje Kategorileri', path: '/categories/projects' },
        { icon: MessageSquare, label: 'Teklif İstekleri', path: '/quotes' },
        { icon: Globe, label: 'Site İçeriği', path: '/content' },
        { icon: Settings, label: 'Ayarlar', path: '/settings' },
    ];

    if (!user) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Yönetici yükleniyor...</div>;

    return (
        <div className="min-h-screen flex bg-gray-50/50">
            {/* Sidebar */}
            <aside className="w-64 fixed h-full bg-[#f8f9fc] border-r border-gray-200/60 p-4 hidden md:flex flex-col justify-between z-20">
                <div className="space-y-8">
                    <div className="px-4 py-2 flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">A</div>
                        <span className="text-xl font-bold text-gray-800 tracking-tight">Admin</span>
                    </div>
                    <nav className="space-y-1">
                        {menu.map((item) => (
                            <SidebarItem 
                                key={item.path} 
                                {...item} 
                                active={location.pathname === item.path || location.pathname.startsWith(item.path + '/')} 
                            />
                        ))}
                    </nav>
                </div>
                <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                            {user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-semibold text-gray-800 truncate">{user.email}</p>
                            <p className="text-[10px] text-gray-500">Süper Yönetici</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-xs text-red-500 hover:text-red-700 py-1.5 border border-red-50 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut size={12} /> Çıkış Yap
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm">
                     <span className="font-bold text-gray-800">Admin</span>
                     <button className="text-gray-500"><Menu size={24} /></button>
                </header>
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;