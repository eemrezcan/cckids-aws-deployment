import React from 'react';

const Card: React.FC<{ children: React.ReactNode, title?: string, className?: string }> = ({ children, title, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
        {title && <div className="px-6 py-4 border-b border-gray-100 font-semibold text-gray-800">{title}</div>}
        <div className="p-6">{children}</div>
    </div>
);

export default Card;