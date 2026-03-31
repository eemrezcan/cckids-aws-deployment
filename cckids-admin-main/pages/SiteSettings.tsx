import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X, Search, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { SiteSettings, ContactMaps } from '../types';
import Button from '../components/Button';
import Card from '../components/Card';
import LanguageTabs from '../components/LanguageTabs';
import { useToast } from '../context/ToastContext';

declare const L: any;

const MapPicker: React.FC<{ onSelect: (lat: number, lng: number) => void, onClose: () => void }> = ({ onSelect, onClose }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [mapInstance, setMapInstance] = useState<any>(null);
    const [markerInstance, setMarkerInstance] = useState<any>(null);
    const [selectedPos, setSelectedPos] = useState<{lat: number, lng: number} | null>(null);
    const toast = useToast();
    
    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Initialize Map
    useEffect(() => {
        if (!mapRef.current) return;
        if (mapInstance) return;

        // Fix Leaflet Icons
        const iconDefault = L.icon({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        const map = L.map(mapRef.current).setView([39.9334, 32.8597], 6); // Default Center: Ankara

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        map.on('click', (e: any) => {
            const { lat, lng } = e.latlng;
            updateMarker(lat, lng, map, iconDefault);
        });

        setMapInstance(map);

        // Cleanup
        return () => {
            map.remove();
        };
    }, []);

    const updateMarker = (lat: number, lng: number, map: any, icon: any) => {
        setSelectedPos({ lat, lng });

        // If marker exists, remove it first (or move it)
        map.eachLayer((layer: any) => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        const newMarker = L.marker([lat, lng], { icon: icon }).addTo(map);
        setMarkerInstance(newMarker);
        map.panTo([lat, lng]);
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
            const data = await res.json();
            setSearchResults(data);
        } catch (err: any) {
            console.error(err);
            toast.error("Arama sırasında hata oluştu.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectResult = (result: any) => {
        if (!mapInstance) return;
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        const iconDefault = L.icon({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41]
        });

        updateMarker(lat, lng, mapInstance, iconDefault);
        mapInstance.setView([lat, lng], 16);
        setSearchResults([]); // Clear results
        setSearchQuery(result.display_name); // Set input to selected address
    };

    const handleConfirm = () => {
        if (selectedPos) {
            onSelect(selectedPos.lat, selectedPos.lng);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800">Haritadan Konum Seç</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
                </div>
                
                {/* Search Bar */}
                <div className="p-4 bg-white border-b relative z-10">
                    <form onSubmit={handleSearch} className="relative flex gap-2">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm shadow-sm"
                                placeholder="Şehir, ilçe veya açık adres arayın..."
                            />
                        </div>
                        <Button type="submit" disabled={isSearching} className="px-6">
                            {isSearching ? <Loader2 className="animate-spin" size={18} /> : 'Ara'}
                        </Button>
                    </form>

                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-4 right-4 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-20">
                            {searchResults.map((result, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectResult(result)}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-0 border-gray-100 text-sm text-gray-700 flex items-center gap-2"
                                >
                                    <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{result.display_name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="relative flex-1 min-h-[400px]">
                    <div ref={mapRef} className="absolute inset-0 z-0 w-full h-full" />
                </div>
                
                <div className="p-4 border-t flex justify-between items-center bg-white">
                    <div className="text-sm text-gray-600">
                        {selectedPos ? `Seçilen: ${selectedPos.lat.toFixed(6)}, ${selectedPos.lng.toFixed(6)}` : 'Konum seçmek için haritaya tıklayın veya arama yapın'}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={onClose}>İptal</Button>
                        <Button disabled={!selectedPos} onClick={handleConfirm}>Bu Konumu Kullan</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SiteSettingsPage = () => {
    const [settings, setSettings] = useState<SiteSettings>({
        phone_number: '',
        email: '',
        whatsapp_number: '',
        whatsapp_default_message: '',
        whatsapp_default_message_en: '',
        office_address: '',
        office_address_en: '',
        workshop_address: '',
        workshop_address_en: ''
    });
    const [maps, setMaps] = useState<ContactMaps>({
        maps_embed_url: '', maps_directions_url: ''
    });
    const [savingSettings, setSavingSettings] = useState(false);
    const [savingMaps, setSavingMaps] = useState(false);
    const [showMapPicker, setShowMapPicker] = useState(false);
    const toast = useToast();

    useEffect(() => {
        const load = async () => {
            try {
                // Fetch basic settings
                const data = await api.get<SiteSettings>('/site-settings');
                setSettings(data);
                
                // Try to see if maps info is included in site-settings or separate
                if ((data as any).maps_embed_url) {
                    setMaps({
                        maps_embed_url: (data as any).maps_embed_url,
                        maps_directions_url: (data as any).maps_directions_url
                    });
                }
            } catch (err) {
                console.error(err);
            }
        };
        load();
    }, []);

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            await api.put('/site-settings', settings);
            toast.success("Bilgiler başarıyla kaydedildi.");
        } catch (err: any) {
            toast.error('Hata: ' + err.message);
        } finally {
            setSavingSettings(false);
        }
    };

    const handleSaveMaps = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingMaps(true);
        try {
            await api.put('/contact-maps', maps);
            toast.success("Harita ayarları başarıyla kaydedildi.");
        } catch (err: any) {
            toast.error('Hata: ' + err.message);
        } finally {
            setSavingMaps(false);
        }
    };

    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleMapsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMaps({ ...maps, [e.target.name]: e.target.value });
    };

    const handleLocationSelect = (lat: number, lng: number) => {
        // Generate Directions URL
        const dirUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        const embedUrl = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s`;

        setMaps({
            maps_directions_url: dirUrl,
            maps_embed_url: embedUrl
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
             <h1 className="text-2xl font-bold text-gray-800">Site Yapılandırması</h1>
             
             {/* General Settings */}
             <Card title="İletişim Bilgileri">
                <form onSubmit={handleSaveSettings} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                            <input name="email" value={settings.email || ''} onChange={handleSettingsChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                            <input name="phone_number" value={settings.phone_number || ''} onChange={handleSettingsChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                            <input name="whatsapp_number" value={settings.whatsapp_number || ''} onChange={handleSettingsChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                         <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Varsayılan WhatsApp Mesajı</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input name="whatsapp_default_message" value={settings.whatsapp_default_message || ''} onChange={handleSettingsChange} placeholder="TR mesaj" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                                <input name="whatsapp_default_message_en" value={settings.whatsapp_default_message_en || ''} onChange={handleSettingsChange} placeholder="EN message" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ofis Adresi</label>
                            <LanguageTabs>
                                {(lang) => (
                                    <textarea
                                        name={lang === 'tr' ? 'office_address' : 'office_address_en'}
                                        value={lang === 'tr' ? settings.office_address || '' : settings.office_address_en || ''}
                                        onChange={handleSettingsChange}
                                        rows={2}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                )}
                            </LanguageTabs>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Atölye Adresi</label>
                            <LanguageTabs>
                                {(lang) => (
                                    <textarea
                                        name={lang === 'tr' ? 'workshop_address' : 'workshop_address_en'}
                                        value={lang === 'tr' ? settings.workshop_address || '' : settings.workshop_address_en || ''}
                                        onChange={handleSettingsChange}
                                        rows={2}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                )}
                            </LanguageTabs>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <Button type="submit" disabled={savingSettings}>
                            {savingSettings ? 'Kaydediliyor...' : 'Bilgileri Kaydet'}
                        </Button>
                    </div>
                </form>
             </Card>

             {/* Map Settings */}
             <Card title="Harita ve Konum Ayarları">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-500">Google Maps linklerini elle girebilir veya haritadan seçerek oluşturabilirsiniz.</p>
                    <Button variant="secondary" onClick={() => setShowMapPicker(true)}>
                        <MapPin size={16} /> Haritadan Konum Seç
                    </Button>
                </div>

                <form onSubmit={handleSaveMaps} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Harita Gömme Linki (Embed URL)</label>
                        <div className="flex gap-2">
                            <input 
                                name="maps_embed_url" 
                                value={maps.maps_embed_url || ''} 
                                onChange={handleMapsChange} 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-xs" 
                                placeholder="https://www.google.com/maps/embed?pb=..."
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Google Maps'te "Paylaş" {'>'} "Harita Yerleştir" kısmındaki <b>src</b> linki.
                            Haritadan seçim yapıldığında otomatik oluşturulan link yaklaşık merkez konumunu gösterir.
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Yol Tarifi Linki</label>
                        <input 
                            name="maps_directions_url" 
                            value={maps.maps_directions_url || ''} 
                            onChange={handleMapsChange} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-xs" 
                            placeholder="https://maps.app.goo.gl/..."
                        />
                        <p className="text-xs text-gray-500 mt-1">Google Maps'te "Paylaş" {'>'} "Bağlantıyı Kopyala" linki.</p>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <Button type="submit" disabled={savingMaps}>
                            {savingMaps ? 'Kaydediliyor...' : 'Harita Ayarlarını Kaydet'}
                        </Button>
                    </div>
                </form>
             </Card>

             {/* Map Picker Modal */}
             {showMapPicker && (
                 <MapPicker 
                    onClose={() => setShowMapPicker(false)}
                    onSelect={handleLocationSelect}
                 />
             )}
        </div>
    );
};

export default SiteSettingsPage;
