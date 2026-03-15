import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, Sprout, Loader2, UserCircle, Store, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { sendOTP, clearError } from '../../store/slices/authSlice';
import api from '../../services/api';
import { useLanguage } from '../../components/common/LanguageToggle';
import LanguageToggle from '../../components/common/LanguageToggle';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [detectedRole, setDetectedRole] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const { t } = useLanguage();

  // Check if user exists when phone number is complete
  useEffect(() => {
    const checkUser = async () => {
      if (phone.length === 10) {
        setIsChecking(true);
        try {
          const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
          console.log('Checking user with phone:', formattedPhone);
          const response = await api.post('/auth/check-user', { phone: formattedPhone });
          console.log('Check user response:', response.data);
          if (response.data.exists) {
            setDetectedRole(response.data.role);
            console.log('Role detected:', response.data.role);
          } else {
            setDetectedRole(null);
            console.log('User not found, showing new user message');
          }
        } catch (error) {
          console.error('Check user error:', error.response?.data || error.message);
          setDetectedRole(null);
        }
        setIsChecking(false);
      } else {
        setDetectedRole(null);
      }
    };

    const timeoutId = setTimeout(checkUser, 500);
    return () => clearTimeout(timeoutId);
  }, [phone]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phone || phone.length < 10) {
      toast.error(t('Please enter a valid phone number'));
      return;
    }

    // Format phone number
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    
    const result = await dispatch(sendOTP(formattedPhone));
    
    if (sendOTP.fulfilled.match(result)) {
      toast.success(t('OTP sent successfully!'));
      navigate('/verify-otp', { state: { phone: formattedPhone, isLogin: true } });
    } else {
      toast.error(result.payload || t('Failed to send OTP'));
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
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Content Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Language Toggle - Top Right */}
        <div className="absolute top-4 right-4 z-20">
          <LanguageToggle />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center justify-center w-20 h-20 bg-primary-500 rounded-3xl shadow-xl shadow-primary-500/30 mb-4"
          >
            <Sprout className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-text-700 mb-2">{t('Welcome Back')}</h1>
          <p className="text-text-600 mb-4">{t('Login to access your account')}</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-sm font-medium text-text-500">Powered by</span>
            <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-leaf-600 bg-clip-text text-transparent">Mandi Connect</span>
          </div>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">{t('Phone Number')}</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder={t('Enter your 10-digit number')}
                  className="input pl-12"
                  maxLength={10}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  +91
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {t("We'll send you a verification code")}
              </p>

              {/* Role Detection Display */}
              <AnimatePresence>
                {phone.length === 10 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3"
                  >
                    {isChecking ? (
                      <div className="flex items-center gap-2 text-sm text-text-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('Checking account...')}
                      </div>
                    ) : detectedRole ? (
                      <div className={`flex items-center gap-2 p-3 rounded-lg ${
                        detectedRole === 'farmer' 
                          ? 'bg-primary-100 text-primary-700' 
                          : 'bg-accent-100 text-accent-700'
                      }`}>
                        {detectedRole === 'farmer' ? (
                          <>
                            <UserCircle className="w-5 h-5" />
                            <span className="font-medium">{t('Farmer')} {t('Account Detected')}</span>
                          </>
                        ) : (
                          <>
                            <Store className="w-5 h-5" />
                            <span className="font-medium">{t('Retailer')} {t('Account Detected')}</span>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary-100 text-primary-700">
                        <span className="text-lg">✨</span>
                        <span className="font-medium">{t('New User')} - {t("You'll be redirected to register")}</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('Sending OTP...')}
                </>
              ) : (
                <>
                  {t('Continue')}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-600">
              {t("Don't have an account?")}{' '}
              <Link
                to="/register"
                className="text-primary-600 font-medium hover:text-primary-700"
              >
                {t('Register here')}
              </Link>
            </p>
          </div>
          
          {/* Admin Login Link */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link
              to="/admin/login"
              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg text-sm font-medium"
            >
              <Shield className="w-4 h-4" />
              {t('Admin Login')}
            </Link>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-3 gap-4 text-center"
        >
          <div className="p-4">
            <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">🌾</span>
            </div>
            <p className="text-xs text-text-600">{t('Direct Farm Sales')}</p>
          </div>
          <div className="p-4">
            <div className="w-12 h-12 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-xs text-text-600">{t('Better Prices')}</p>
          </div>
          <div className="p-4">
            <div className="w-12 h-12 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">🤝</span>
            </div>
            <p className="text-xs text-text-600">{t('Trusted Network')}</p>
          </div>
        </motion.div>
        
      </motion.div>
      </div>
    </div>
  );
};

export default Login;
