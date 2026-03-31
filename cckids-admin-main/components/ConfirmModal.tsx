import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import Button from './Button';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    loading?: boolean;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Silmek istediğinize emin misiniz?", 
    message = "Bu işlem geri alınamaz ve ilgili veriler kalıcı olarak silinecektir.",
    loading = false,
    confirmText = "Evet, Sil",
    cancelText = "İptal"
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                {/* Header */}
                <div className="flex justify-between items-start p-6 pb-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 flex-shrink-0">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t border-gray-100">
                    <Button variant="secondary" onClick={onClose} disabled={loading} className="w-full sm:w-auto">
                        {cancelText}
                    </Button>
                    <button 
                        onClick={onConfirm} 
                        disabled={loading}
                        className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm hover:shadow font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {loading ? 'Siliniyor...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;