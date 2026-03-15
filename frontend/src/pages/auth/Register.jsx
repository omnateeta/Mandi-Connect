import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, User, ArrowRight, Sprout, Loader2, Tractor, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import { sendOTP } from '../../store/slices/authSlice';
import { useLanguage } from '../../components/common/LanguageToggle';
import LanguageToggle from '../../components/common/LanguageToggle';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'farmer',
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error(t('Please enter your name'));
      return;
    }
    
    if (!formData.phone || formData.phone.length < 10) {
      toast.error(t('Please enter a valid phone number'));
      return;
    }

    const formattedPhone = formData.phone.startsWith('+') 
      ? formData.phone 
      : `+91${formData.phone}`;
    
    const result = await dispatch(sendOTP(formattedPhone));
    
    if (sendOTP.fulfilled.match(result)) {
      toast.success(t('OTP sent successfully!'));
      navigate('/verify-otp', { 
        state: { 
          phone: formattedPhone, 
          isLogin: false,
          name: formData.name,
          role: formData.role
        } 
      });
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
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center justify-center w-20 h-20 bg-leaf-500 rounded-3xl shadow-xl shadow-leaf-500/30 mb-4"
          >
            <Sprout className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('Create Account')}</h1>
          <p className="text-gray-600 mb-4">{t('Join today')}</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-sm font-medium text-gray-500">Powered by</span>
            <span className="text-lg font-bold bg-gradient-to-r from-leaf-600 to-emerald-600 bg-clip-text text-transparent">Mandi Connect</span>
          </div>
        </div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="label">{t('I am a')}</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'farmer' })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    formData.role === 'farmer'
                      ? 'border-leaf-500 bg-leaf-50 text-leaf-700'
                      : 'border-gray-200 hover:border-leaf-300'
                  }`}
                >
                  <Tractor className="w-8 h-8" />
                  <span className="font-medium">{t('Farmer')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'retailer' })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    formData.role === 'retailer'
                      ? 'border-leaf-500 bg-leaf-50 text-leaf-700'
                      : 'border-gray-200 hover:border-leaf-300'
                  }`}
                >
                  <Store className="w-8 h-8" />
                  <span className="font-medium">{t('Retailer')}</span>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="label">{t('Full Name')}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('Enter your full name')}
                  className="input pl-12"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="label">{t('Phone Number')}</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    phone: e.target.value.replace(/\D/g, '').slice(0, 10) 
                  })}
                  placeholder={t('Enter your 10-digit number')}
                  className="input pl-12"
                  maxLength={10}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  +91
                </span>
              </div>
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
                  {t('Create Account')}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('Already have an account?')}{' '}
              <Link
                to="/login"
                className="text-leaf-600 font-medium hover:text-leaf-700"
              >
                {t('Login here')}
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-500 mb-4">{t('Trusted by 10,000+ farmers & retailers')}</p>
          <div className="flex justify-center gap-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-2 h-2 bg-leaf-500 rounded-full"></span>
              {t('Secure')}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-2 h-2 bg-leaf-500 rounded-full"></span>
              {t('Free to use')}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-2 h-2 bg-leaf-500 rounded-full"></span>
              {t('24/7 Support')}
            </div>
          </div>
        </motion.div>
      </motion.div>
      </div>
    </div>
  );
};

export default Register;
