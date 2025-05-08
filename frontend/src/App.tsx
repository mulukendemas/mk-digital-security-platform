
import '@/utils/axiosConfig';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, Route, createRoutesFromElements } from "react-router-dom";
import AuthWrapper from "@/components/AuthWrapper";
import AboutAdmin from "@/pages/admin/AboutAdmin";
import NewsDetail from "@/pages/NewsDetail";
import { useState, useEffect } from 'react';
import { settingsService } from '@/lib/api-service';
import { SiteSettings } from '@/lib/types';
import MaintenanceMode from '@/components/MaintenanceMode';
import { SiteSettingsProvider } from '@/context/SiteSettingsContext';

// Public pages
import Index from "./pages/Index";
import About from "./pages/About";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Solutions from "./pages/Solutions";
import SolutionDetail from "./pages/SolutionDetail";
import News from "./pages/News";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import ImageTest from "./pages/ImageTest";

// Admin pages
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import ProductsAdmin from "./pages/admin/ProductsAdmin";
import SolutionsAdmin from "./pages/admin/SolutionsAdmin";
import NewsAdmin from "./pages/admin/NewsAdmin";
import UsersAdmin from "./pages/admin/UsersAdmin";
import ContactsAdmin from "./pages/admin/ContactsAdmin";
import ForgotPassword from '@/pages/admin/ForgotPassword';
import ResetPassword from '@/pages/admin/ResetPassword';
import SettingsAdmin from '@/pages/admin/SettingsAdmin';

import ProtectedRoute from "./components/admin/ProtectedRoute";
import HomeAdmin from "./pages/admin/HomeAdmin";

const queryClient = new QueryClient();

// Create router with future flags to address warnings
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<About />} />
      <Route path="/products" element={<Products />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/solutions" element={<Solutions />} />
      <Route path="/solution/:id" element={<SolutionDetail />} />
      <Route path="/news" element={<News />} />
      <Route path="/news/:id" element={<NewsDetail />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin/forgot-password" element={<ForgotPassword />} />
      <Route path="/admin/reset-password/:token" element={<ResetPassword />} />

      {/* Protected Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute requiredRole="viewer">
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/home" element={
        <ProtectedRoute requiredRole="viewer">
          <HomeAdmin />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute requiredRole="admin">
          <UsersAdmin />
        </ProtectedRoute>
      } />
      <Route path="/admin/products" element={
        <ProtectedRoute requiredRole="viewer">
          <ProductsAdmin />
        </ProtectedRoute>
      } />
      <Route path="/admin/solutions" element={
        <ProtectedRoute requiredRole="viewer">
          <SolutionsAdmin />
        </ProtectedRoute>
      } />
      <Route path="/admin/news" element={
        <ProtectedRoute requiredRole="viewer">
          <NewsAdmin />
        </ProtectedRoute>
      } />
      <Route path="/admin/about" element={
        <ProtectedRoute requiredRole="viewer">
          <AboutAdmin />
        </ProtectedRoute>
      } />
      <Route path="/admin/contact" element={
        <ProtectedRoute requiredRole="viewer">
          <ContactsAdmin />
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute requiredRole="admin">
          <SettingsAdmin />
        </ProtectedRoute>
      } />
      <Route path="/admin/image-test" element={
        <ProtectedRoute requiredRole="viewer">
          <ImageTest />
        </ProtectedRoute>
      } />
      {/* Add other admin routes directly */}

      {/* Catch-all Route */}
      <Route path="*" element={<NotFound />} />
    </>
  ),
  // Add router options
  {
    // The future flags might not be supported in the current version
    // Removing them for now
  }
);

const App = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.getAll();
        if (data && data.length > 0) {
          setSettings(data[0]);
        } else {
          // Default settings if none exist
          setSettings({
            maintenanceMode: false,
            maintenanceMessage: 'Site is currently under maintenance. Please check back later.',
            siteName: 'MK Digital Security Solutions',
            siteDescription: 'Digital Security for a Connected World',
            contactEmail: 'contact@example.com'
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        // Default settings on error
        setSettings({
          maintenanceMode: false,
          maintenanceMessage: 'Site is currently under maintenance. Please check back later.',
          siteName: 'MK Digital Security Solutions',
          siteDescription: 'Digital Security for a Connected World',
          contactEmail: 'contact@example.com'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Check if the current path is an admin path
  const isAdminPath = window.location.pathname.startsWith('/admin');

  // Show maintenance mode only for non-admin paths and when maintenance mode is enabled
  const showMaintenanceMode = !isAdminPath && settings?.maintenanceMode && !loading;

  return (
    <QueryClientProvider client={queryClient}>
      <SiteSettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthWrapper
            router={router}
            showMaintenanceMode={showMaintenanceMode}
            settings={settings}
          />
        </TooltipProvider>
      </SiteSettingsProvider>
    </QueryClientProvider>
  );
};

export default App;








