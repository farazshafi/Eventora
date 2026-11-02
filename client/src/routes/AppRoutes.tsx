import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Busy } from '../components/common/States';
import { SiteLayout } from '../components/layout/SiteLayout';
import { RequireAuth } from './RequireAuth';
import { RequireAdmin } from './RequireAdmin';
import { AdminLayout } from '../components/admin/AdminLayout';

const HomePage = lazy(() => import('../pages/HomePage'));
const ServicesPage = lazy(() => import('../pages/ServicesPage'));
const ServiceDetailPage = lazy(() => import('../pages/ServiceDetailPage'));
const AuthPage = lazy(() => import('../pages/AuthPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const BookingsPage = lazy(() => import('../pages/BookingsPage'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
const ConfirmationPage = lazy(() =>
  import('../pages/CheckoutPage').then((module) => ({ default: module.ConfirmationPage })),
);
const AdminLoginPage = lazy(() => import('../pages/admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminServicesPage = lazy(() => import('../pages/admin/AdminServicesPage'));
const AdminServiceFormPage = lazy(() => import('../pages/admin/AdminServiceFormPage'));
const AdminServiceDetailsPage = lazy(() => import('../pages/admin/AdminServiceDetailsPage'));
const AdminBookingsPage = lazy(() => import('../pages/admin/AdminBookingsPage'));
const AdminBookingDetailsPage = lazy(() => import('../pages/admin/AdminBookingDetailsPage'));
const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage'));

export function AppRoutes() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        <Suspense fallback={<Busy label="Preparing your page" />}>
          <Routes location={location}>
            <Route path="admin/login" element={<AdminLoginPage />} />
            <Route path="admin" element={<RequireAdmin />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="services" element={<AdminServicesPage />} />
                <Route path="services/new" element={<AdminServiceFormPage />} />
                <Route path="services/:id/edit" element={<AdminServiceFormPage />} />
                <Route path="services/:id" element={<AdminServiceDetailsPage />} />
                <Route path="bookings" element={<AdminBookingsPage />} />
                <Route path="bookings/:id" element={<AdminBookingDetailsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>
            </Route>
            <Route element={<SiteLayout />}>
              <Route index element={<HomePage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="services/:id" element={<ServiceDetailPage />} />
              <Route path="login" element={<AuthPage mode="login" />} />
              <Route path="register" element={<AuthPage mode="register" />} />
              <Route path="*" element={<Navigate to="/" replace />} />
              <Route element={<RequireAuth />}>
                <Route path="profile" element={<ProfilePage />} />
                <Route path="bookings" element={<BookingsPage />} />
                <Route path="checkout/:id" element={<CheckoutPage />} />
                <Route path="checkout/:id/confirmation" element={<ConfirmationPage />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}
