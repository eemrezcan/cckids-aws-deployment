import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutTemplate, Info, Share2, Award } from 'lucide-react';
import Card from '../../components/Card';

const ContentDashboard = () => {
    const navigate = useNavigate();

    const modules = [
        { 
            title: 'Ana Sayfa Bölümleri', 
            desc: 'Slider, banner ve ana sayfa bloklarını yönetin.',
            icon: LayoutTemplate, 
            path: '/content/home-sections',
            color: 'bg-indigo-500' 
        },
        { 
            title: 'Hakkımızda Sayfası', 
            desc: 'Şirket tarihçesi ve galeri görsellerini güncelleyin.',
            icon: Info, 
            path: '/content/about',
            color: 'bg-pink-500' 
        },
        { 
            title: 'Referans Logoları', 
            desc: 'Müşteri ve partner logolarını yönetin.',
            icon: Award, 
            path: '/content/references',
            color: 'bg-amber-500' 
        },
        { 
            title: 'Sosyal Medya Linkleri', 
            desc: 'Sosyal medya profillerini güncelleyin.',
            icon: Share2, 
            path: '/content/socials',
            color: 'bg-blue-500' 
        }
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Site İçeriği</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((m) => (
                    <button 
                        key={m.title}
                        onClick={() => navigate(m.path)}
                        className="text-left group transition-all duration-300 hover:-translate-y-1"
                    >
                        <Card className="h-full border border-gray-100 group-hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl ${m.color} text-white flex items-center justify-center shadow-sm shrink-0`}>
                                    <m.icon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{m.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{m.desc}</p>
                                </div>
                            </div>
                        </Card>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ContentDashboard;