import React from 'react';

const Badge: React.FC<{ status: string }> = ({ status }) => {
    let colorClass = "bg-gray-100 text-gray-800";
    let label = status;
    const normalized = String(status || '').toLowerCase();

    if (status === 'PENDING') {
        colorClass = "bg-yellow-100 text-yellow-800";
        label = "BEKLİYOR";
    }
    if (status === 'REVIEWED') {
        colorClass = "bg-blue-100 text-blue-800";
        label = "İNCELENDİ";
    }
    if (status === 'RESPONDED') {
        colorClass = "bg-green-100 text-green-800";
        label = "YANITLANDI";
    }
    if (status === 'ARCHIVED') {
        colorClass = "bg-gray-200 text-gray-600";
        label = "ARŞİV";
    }

    if (normalized === 'new') {
        colorClass = "bg-amber-100 text-amber-800";
        label = "YENİ";
    }
    if (normalized === 'processing') {
        colorClass = "bg-blue-100 text-blue-800";
        label = "İŞLENİYOR";
    }
    if (normalized === 'completed') {
        colorClass = "bg-green-100 text-green-800";
        label = "TAMAMLANDI";
    }
    
    // Boolean checks
    if (status === 'Active' || status === 'true') {
        colorClass = "bg-green-50 text-green-700 border border-green-200";
        label = "Aktif";
    }
    if (status === 'Inactive' || status === 'false') {
        colorClass = "bg-red-50 text-red-700 border border-red-200";
        label = "Pasif";
    }

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            {label}
        </span>
    );
};

export default Badge;
