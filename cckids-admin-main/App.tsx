import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

// Providers
import { ToastProvider } from './context/ToastContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import ProductsList from './pages/products/ProductsList';
import ProductForm from './pages/products/ProductForm';

import ProductCategoriesList from './pages/categories/ProductCategoriesList';
import ProductCategoryForm from './pages/categories/ProductCategoryForm';

import ColorsList from './pages/colors/ColorsList';
import ColorForm from './pages/colors/ColorForm';

import ProjectsList from './pages/projects/ProjectsList';
import ProjectForm from './pages/projects/ProjectForm';

import ProjectCategoriesList from './pages/categories/ProjectCategoriesList';
import ProjectCategoryForm from './pages/categories/ProjectCategoryForm';

import QuoteRequests from './pages/QuoteRequests';
import QuoteDetail from './pages/QuoteDetail';
import SiteSettingsPage from './pages/SiteSettings';

// Content Pages
import ContentDashboard from './pages/content/ContentDashboard';
import HomeSectionsList from './pages/content/HomeSectionsList';
import HomeSectionForm from './pages/content/HomeSectionForm';
import AboutManager from './pages/content/AboutManager';
import ReferenceLogos from './pages/content/ReferenceLogos';
import SocialLinks from './pages/content/SocialLinks';
import HomeProjectImages from './pages/content/HomeProjectImages';

// Auth
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
    return (
        <ToastProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    
                    {/* Protected Routes */}
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    
                    <Route path="/products" element={<ProtectedRoute><ProductsList /></ProtectedRoute>} />
                    <Route path="/products/new" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
                    <Route path="/products/:id" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />

                    <Route path="/categories/products" element={<ProtectedRoute><ProductCategoriesList /></ProtectedRoute>} />
                    <Route path="/categories/products/new" element={<ProtectedRoute><ProductCategoryForm /></ProtectedRoute>} />
                    <Route path="/categories/products/:id" element={<ProtectedRoute><ProductCategoryForm /></ProtectedRoute>} />

                    <Route path="/colors" element={<ProtectedRoute><ColorsList /></ProtectedRoute>} />
                    <Route path="/colors/new" element={<ProtectedRoute><ColorForm /></ProtectedRoute>} />
                    <Route path="/colors/:id" element={<ProtectedRoute><ColorForm /></ProtectedRoute>} />

                    <Route path="/projects" element={<ProtectedRoute><ProjectsList /></ProtectedRoute>} />
                    <Route path="/projects/new" element={<ProtectedRoute><ProjectForm /></ProtectedRoute>} />
                    <Route path="/projects/:id" element={<ProtectedRoute><ProjectForm /></ProtectedRoute>} />

                    <Route path="/categories/projects" element={<ProtectedRoute><ProjectCategoriesList /></ProtectedRoute>} />
                    <Route path="/categories/projects/new" element={<ProtectedRoute><ProjectCategoryForm /></ProtectedRoute>} />
                    <Route path="/categories/projects/:id" element={<ProtectedRoute><ProjectCategoryForm /></ProtectedRoute>} />

                    <Route path="/quotes" element={<ProtectedRoute><QuoteRequests /></ProtectedRoute>} />
                    <Route path="/quotes/:id" element={<ProtectedRoute><QuoteDetail /></ProtectedRoute>} />
                    
                    <Route path="/settings" element={<ProtectedRoute><SiteSettingsPage /></ProtectedRoute>} />
                    
                    {/* Content Modules */}
                    <Route path="/content" element={<ProtectedRoute><ContentDashboard /></ProtectedRoute>} />
                    <Route path="/content/home-sections" element={<ProtectedRoute><HomeSectionsList /></ProtectedRoute>} />
                    <Route path="/content/home-sections/new" element={<ProtectedRoute><HomeSectionForm /></ProtectedRoute>} />
                    <Route path="/content/home-sections/:id" element={<ProtectedRoute><HomeSectionForm /></ProtectedRoute>} />
                    
                    <Route path="/content/about" element={<ProtectedRoute><AboutManager /></ProtectedRoute>} />
                    <Route path="/content/references" element={<ProtectedRoute><ReferenceLogos /></ProtectedRoute>} />
                    <Route path="/content/socials" element={<ProtectedRoute><SocialLinks /></ProtectedRoute>} />
                    <Route path="/content/home-projects" element={<ProtectedRoute><HomeProjectImages /></ProtectedRoute>} />

                </Routes>
            </Router>
        </ToastProvider>
    );
};

export default App;