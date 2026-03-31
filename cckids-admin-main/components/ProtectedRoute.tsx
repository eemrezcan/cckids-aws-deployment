import React from 'react';
import { Navigate } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const token = localStorage.getItem('access_token');
    if (!token) return <Navigate to="/login" replace />;
    return <AdminLayout>{children}</AdminLayout>;
};

export default ProtectedRoute;