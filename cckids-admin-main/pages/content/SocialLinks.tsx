import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, Plus, Trash2, Edit2
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { api } from '../../services/api';
import { SocialLink } from '../../types';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import { 
    Amazon, Trendyol, Hepsiburada, Shopier, N11, Etsy, Ebay, 
    AliExpress, Shopify, Sahibinden, Letgo 
} from '../../components/icons/MarketplaceLogos';

// Platform Rules with standard Lucide icon names mappings
const PLATFORM_RULES = [
  { keywords: ["instagram"], iconName: "Instagram", label: "Instagram" },
  { keywords: ["facebook"], iconName: "Facebook", label: "Facebook" },
  { keywords: ["twitter", "x.com", " x "], iconName: "Twitter", label: "Twitter" },
  { keywords: ["youtube"], iconName: "Youtube", label: "Youtube" },
  { keywords: ["linkedin"], iconName: "Linkedin", label: "Linkedin" },
  { keywords: ["tiktok"], iconName: "Music2", label: "TikTok" },
  { keywords: ["pinterest"], iconName: "Pin", label: "Pinterest" },
  { keywords: ["snapchat"], iconName: "MessageCircle", label: "Snapchat" },
  { keywords: ["telegram"], iconName: "Send", label: "Telegram" },
  { keywords: ["whatsapp"], iconName: "MessageCircle", label: "Whatsapp" },
  { keywords: ["discord"], iconName: "MessagesSquare", label: "Discord" },
  { keywords: ["twitch"], iconName: "Gamepad2", label: "Twitch" },
  { keywords: ["github"], iconName: "Github", label: "Github" },
  { keywords: ["gitlab"], iconName: "GitBranch", label: "Gitlab" },
  { keywords: ["bitbucket"], iconName: "GitFork", label: "Bitbucket" },
  { keywords: ["medium"], iconName: "BookOpen", label: "Medium" },
  { keywords: ["behance"], iconName: "Palette", label: "Behance" },
  { keywords: ["dribbble"], iconName: "CircleDot", label: "Dribbble" },
  { keywords: ["figma"], iconName: "PenTool", label: "Figma" },
  { keywords: ["notion"], iconName: "NotebookPen", label: "Notion" },
  { keywords: ["slack"], iconName: "Briefcase", label: "Slack" },
  { keywords: ["reddit"], iconName: "MessageSquare", label: "Reddit" },
  { keywords: ["quora"], iconName: "CircleHelp", label: "Quora" },
  { keywords: ["vimeo"], iconName: "Video", label: "Vimeo" },
  { keywords: ["spotify"], iconName: "Music", label: "Spotify" },
  { keywords: ["soundcloud"], iconName: "AudioLines", label: "Soundcloud" },
  { keywords: ["apple"], iconName: "Smartphone", label: "Apple" },
  { keywords: ["appstore", "app store"], iconName: "AppWindow", label: "App Store" },
  { keywords: ["googleplay", "google play", "playstore", "play store"], iconName: "PlayCircle", label: "Google Play" },
  { keywords: ["amazon"], iconName: "ShoppingBag", label: "Amazon" },
  { keywords: ["trendyol"], iconName: "Store", label: "Trendyol" },
  { keywords: ["hepsiburada"], iconName: "Store", label: "Hepsiburada" },
  { keywords: ["shopier"], iconName: "Store", label: "Shopier" },
  { keywords: ["n11"], iconName: "Store", label: "N11" },
  { keywords: ["çiçeksepeti", "ciceksepeti"], iconName: "Gift", label: "Çiçeksepeti" },
  { keywords: ["etsy"], iconName: "ShoppingBag", label: "Etsy" },
  { keywords: ["ebay"], iconName: "ShoppingBag", label: "Ebay" },
  { keywords: ["aliexpress"], iconName: "ShoppingBag", label: "AliExpress" },
  { keywords: ["shopify"], iconName: "ShoppingCart", label: "Shopify" },
  { keywords: ["woocommerce"], iconName: "ShoppingCart", label: "WooCommerce" },
  { keywords: ["magento"], iconName: "Store", label: "Magento" },
  { keywords: ["opencart"], iconName: "Store", label: "Opencart" },
  { keywords: ["iyzico"], iconName: "CreditCard", label: "Iyzico" },
  { keywords: ["stripe"], iconName: "CreditCard", label: "Stripe" },
  { keywords: ["paypal"], iconName: "Wallet", label: "Paypal" },
  { keywords: ["mastercard"], iconName: "CreditCard", label: "Mastercard" },
  { keywords: ["visa"], iconName: "CreditCard", label: "Visa" },
  { keywords: ["sahibinden"], iconName: "Store", label: "Sahibinden" },
  { keywords: ["letgo"], iconName: "Store", label: "Letgo" },
  { keywords: ["bionluk", "upwork", "fiverr"], iconName: "Briefcase", label: "Bionluk" },
];

const SocialLinks = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [links, setLinks] = useState<SocialLink[]>([]);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState({ platform: '', url: '', is_active: true });
    const [showForm, setShowForm] = useState(false);
    
    // Delete Modal State
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchLinks = async () => {
        try {
            const res = await api.get<any>('/social-links');
            setLinks(res.items);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchLinks(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/social-links/${editId}`, form);
            } else {
                await api.post('/social-links', { ...form, sort_order: links.length });
            }
            fetchLinks();
            resetForm();
        } catch (e: any) { 
            toast.error(`İşlem başarısız: ${e.message}`);
        }
    };

    const handleEdit = (link: SocialLink) => {
        setEditId(link.id);
        setForm({ platform: link.platform, url: link.url, is_active: link.is_active });
        setShowForm(true);
    };

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await api.delete(`/social-links/${deleteId}`);
            await fetchLinks();
            setDeleteId(null);
        } catch (e: any) {
            toast.error(`İşlem başarısız: ${e.message}`);
        } finally {
            setDeleting(false);
        }
    };

    const resetForm = () => {
        setEditId(null);
        setForm({ platform: '', url: '', is_active: true });
        setShowForm(false);
    };

    // Helper: Resolve icon (checks custom first, then falls back to Lucide)
    const resolveIcon = (platform: string) => {
        const p = (platform || "").toLowerCase();

        // Custom Marketplaces
        if (p.includes("trendyol")) return Trendyol;
        if (p.includes("hepsiburada")) return Hepsiburada;
        if (p.includes("shopier")) return Shopier;
        if (p.includes("amazon")) return Amazon;
        if (p.includes("aliexpress")) return AliExpress;
        if (p.includes("ebay")) return Ebay;
        if (p.includes("etsy")) return Etsy;
        if (p.includes("letgo")) return Letgo;
        if (p.includes("sahibinden")) return Sahibinden;
        if (p.includes("n11")) return N11;
        if (p.includes("shopify")) return Shopify;

        // Fallback to rules for standard Lucide icons
        const rule = PLATFORM_RULES.find(r => r.keywords.some(k => p.includes(k)));
        if (rule) {
            const IconComponent = (LucideIcons as any)[rule.iconName];
            return IconComponent || LucideIcons.Globe;
        }
        return LucideIcons.Globe;
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={() => navigate('/content')}><ChevronLeft size={16} /> Geri</Button>
                    <h1 className="text-2xl font-bold text-gray-800">Sosyal Medya Linkleri</h1>
                </div>
                <Button onClick={() => setShowForm(true)}><Plus size={16} /> Link Ekle</Button>
            </div>

            {showForm && (
                <Card className="bg-gray-50 border-indigo-100">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Preset Selection */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-2 block">Logosu Kayıtlı Platformlar</label>
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-40 overflow-y-auto p-1 border border-gray-200 rounded-lg bg-white custom-scrollbar">
                                {PLATFORM_RULES.map((p, idx) => {
                                    // Identify the icon for the FIRST keyword to show in the preset button
                                    const primaryKeyword = p.keywords[0];
                                    const Icon = resolveIcon(primaryKeyword);
                                    
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setForm({ ...form, platform: primaryKeyword })}
                                            className={`flex flex-col items-center justify-center p-2 rounded border transition-all text-xs gap-1 hover:shadow-sm ${
                                                form.platform === primaryKeyword
                                                ? 'bg-indigo-100 border-indigo-300 text-indigo-700 font-medium' 
                                                : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200'
                                            }`}
                                            title={p.label}
                                        >
                                            <Icon size={18} />
                                            <span className="truncate w-full text-center text-[10px]">{p.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="text-xs font-semibold text-gray-500">Platform (Manuel Giriş)</label>
                                <input 
                                    required 
                                    value={form.platform} 
                                    onChange={e => setForm({...form, platform: e.target.value.toLowerCase()})} 
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                                    placeholder="instagram" 
                                />
                            </div>
                            <div className="flex-[2]">
                                <label className="text-xs font-semibold text-gray-500">URL</label>
                                <input 
                                    required 
                                    value={form.url} 
                                    onChange={e => setForm({...form, url: e.target.value})} 
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                                    placeholder="https://instagram.com/..." 
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2">
                             <div className="flex items-center gap-2">
                                <input 
                                    id="is_active"
                                    type="checkbox" 
                                    checked={form.is_active} 
                                    onChange={e => setForm({...form, is_active: e.target.checked})}
                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer" 
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">Aktif</label>
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" variant="secondary" onClick={resetForm}>İptal</Button>
                                <Button type="submit">Kaydet</Button>
                            </div>
                        </div>
                    </form>
                </Card>
            )}

            <Card className="p-0">
                <table className="w-full text-left">
                     <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase">
                        <tr>
                            <th className="px-6 py-4">Platform</th>
                            <th className="px-6 py-4">URL</th>
                            <th className="px-6 py-4">Durum</th>
                            <th className="px-6 py-4 text-right">İşlemler</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {links.map(l => (
                            <tr key={l.id}>
                                <td className="px-6 py-4 font-medium capitalize flex items-center gap-2">
                                    {/* Resolve icon dynamically */}
                                    {(() => {
                                        const Icon = resolveIcon(l.platform);
                                        return <Icon size={16} className="text-gray-400" />;
                                    })()}
                                    {l.platform}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{l.url}</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${l.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {l.is_active ? 'Aktif' : 'Pasif'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => handleEdit(l)} 
                                            className="text-indigo-600 p-1 hover:bg-indigo-50 rounded"
                                        >
                                            <Edit2 size={16}/>
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => handleDeleteClick(l.id)} 
                                            className="text-red-600 p-1 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                     </tbody>
                </table>
            </Card>

            <ConfirmModal 
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                loading={deleting}
                title="Linki Sil"
                message="Bu sosyal medya linkini silmek istediğinize emin misiniz?"
            />
        </div>
    );
};

export default SocialLinks;