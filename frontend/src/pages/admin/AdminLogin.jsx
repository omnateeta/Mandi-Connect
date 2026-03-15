import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, User, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password) {
      toast.error('Please enter username and password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/admin/auth/login', formData);
      
      if (response.data.success) {
        const { admin, token } = response.data.data;
        
        // Store admin data
        localStorage.setItem('adminToken', token);
        localStorage.setItem('admin', JSON.stringify(admin));
        
        toast.success('Admin login successful!');
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error(
        error.response?.data?.message || 'Invalid credentials'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image with Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/loginbg.avif')`,
          filter: 'blur(8px)',
          transform: 'scale(1.1)'
        }}
      />
      
      {/* Dark Overlay for Better Readability */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Content Container */}
      <div className="relative z-10 w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowRight className="w-5 h-5 rotate-180" />
          Back to Login
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl shadow-xl shadow-primary-500/30 mb-4"
          >
            <Shield className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Mandi-Connect Admin
          </h1>
          <p className="text-gray-200">
            Platform Administration Portal
          </p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8"
        >
          {/* Warning Banner */}
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">🔒 Restricted Access</p>
              <p>This portal is for authorized administrators only.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            Username
            <div>
              <label className="label">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    username: e.target.value 
                  })}
                  placeholder="Enter admin username"
                  className="input pl-12"
                  autoComplete="username"
                />
              </div>
            </div>

            Password
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    password: e.target.value 
                  })}
                  placeholder="Enter admin password"
                  className="input pl-12"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Login as Admin
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Need help? Contact system administrator
            </p>
          </div>
        </motion.div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-white/20">
            <Shield className="w-4 h-4 text-primary-600" />
            <span className="text-sm text-white font-medium">
              🔐 Secure Admin Portal • 256-bit Encryption
            </span>
          </div>
        </div>
        
      </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;
