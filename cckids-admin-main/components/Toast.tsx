import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
}

interface ToastProps {
    toast: ToastMessage;
    onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(toast.id);
        }, 4000);
        return () => clearTimeout(timer);
    }, [toast.id, onClose]);

    const variants = {
        success: {
            bg: 'bg-white',
            border: 'border-green-500',
            icon: <CheckCircle className="w-5 h-5 text-green-500" />,
            title: 'Başarılı'
        },
        error: {
            bg: 'bg-white',
            border: 'border-red-500',
            icon: <XCircle className="w-5 h-5 text-red-500" />,
            title: 'Hata'
        },
        info: {
            bg: 'bg-white',
            border: 'border-blue-500',
            icon: <AlertCircle className="w-5 h-5 text-blue-500" />,
            title: 'Bilgi'
        }
    };

    const style = variants[toast.type];

    return (
        <div className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 ${style.bg} border-l-4 ${style.border} transform transition-all duration-300 hover:scale-102`}>
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        {style.icon}
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-gray-900">{style.title}</p>
                        <p className="mt-1 text-sm text-gray-500">{toast.message}</p>
                    </div>
                    <div className="ml-4 flex flex-shrink-0">
                        <button
                            type="button"
                            className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                            onClick={() => onClose(toast.id)}
                        >
                            <span className="sr-only">Kapat</span>
                            <X className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Toast;