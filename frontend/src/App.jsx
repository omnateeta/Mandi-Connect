import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

import store from './store';
import { getMe } from './store/slices/authSlice';
import { LanguageProvider } from './components/common/LanguageToggle';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OTPVerification from './pages/auth/OTPVerification';

// Farmer Pages
import FarmerDashboard from './pages/farmer/Dashboard';
import FarmerCrops from './pages/farmer/Crops';
import AddCrop from './pages/farmer/AddCrop';
import ViewCrop from './pages/farmer/ViewCrop';
import EditCrop from './pages/farmer/EditCrop';
import FarmerOrders from './pages/farmer/Orders';
import FarmerProfile from './pages/farmer/Profile';
import CropAnalytics from './components/farmer/CropAnalytics';

// Retailer Pages
import RetailerDashboard from './pages/retailer/Dashboard';
import Marketplace from './pages/retailer/Marketplace';
import CropDetails from './pages/retailer/CropDetails';
import RetailerOrders from './pages/retailer/Orders';
import RetailerProfile from './pages/retailer/Profile';
import Cart from './pages/retailer/Cart';
import QRPayment from './pages/retailer/QRPayment';
import PaymentHistory from './pages/retailer/PaymentHistory';

// Common Pages
import OrderTracking from './pages/common/OrderTracking';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';

function App() {
  useEffect(() => {
    // Clear any saved language preference to force English
    localStorage.removeItem('appLanguage');
    
    // Check for existing token and fetch user
    const token = localStorage.getItem('token');
    if (token) {
      store.dispatch(getMe());
    }
  }, []);

  return (
    <Provider store={store}>
      <LanguageProvider>
      <Router>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px 24px',
            },
            success: {
              iconTheme: {
                primary: '#4CAF50',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<OTPVerification />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Farmer Routes */}
            <Route element={<ProtectedRoute allowedRoles={['farmer']} />}>
              <Route element={<Layout userType="farmer" />}>
                <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
                <Route path="/farmer/crops" element={<FarmerCrops />} />
                <Route path="/farmer/crops/add" element={<AddCrop />} />
                <Route path="/farmer/crops/:id" element={<ViewCrop />} />
                <Route path="/farmer/crops/:id/edit" element={<EditCrop />} />
                <Route path="/farmer/analytics" element={<CropAnalytics />} />
                <Route path="/farmer/orders" element={<FarmerOrders />} />
                <Route path="/farmer/orders/:orderId/track" element={<OrderTracking />} />
                <Route path="/farmer/profile" element={<FarmerProfile />} />
              </Route>
            </Route>
            
            {/* Retailer Routes */}
            <Route element={<ProtectedRoute allowedRoles={['retailer']} />}>
              <Route element={<Layout userType="retailer" />}>
                <Route path="/retailer/dashboard" element={<RetailerDashboard />} />
                <Route path="/retailer/marketplace" element={<Marketplace />} />
                <Route path="/retailer/crop/:id" element={<CropDetails />} />
                <Route path="/retailer/orders" element={<RetailerOrders />} />
                <Route path="/retailer/orders/:orderId/track" element={<OrderTracking />} />
                <Route path="/retailer/cart" element={<Cart />} />
                <Route path="/retailer/payment/:orderId" element={<QRPayment />} />
                <Route path="/retailer/payments" element={<PaymentHistory />} />
                <Route path="/retailer/profile" element={<RetailerProfile />} />
              </Route>
            </Route>
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AnimatePresence>
      </Router>
      </LanguageProvider>
    </Provider>
  );
}

export default App;
