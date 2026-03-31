import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast, { ToastMessage } from '../components/Toast';

interface ToastContextType {
    addToast: (type: 'success' | 'error' | 'info', message: string) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, type, message }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const success = (message: string) => addToast('success', message);
    const error = (message: string) => addToast('error', message);
    const info = (message: string) => addToast('info', message);

    return (
        <ToastContext.Provider value={{ addToast, success, error, info }}>
            {children}
            <div className="fixed top-0 right-0 z-50 p-4 space-y-4 w-full max-w-sm pointer-events-none flex flex-col items-end">
                {toasts.map((toast) => (
                    <Toast key={toast.id} toast={toast} onClose={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};