import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { verifyOTP, sendOTP } from '../../store/slices/authSlice';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading } = useSelector((state) => state.auth);
  
  const { phone, isLogin, name, role } = location.state || {};

  useEffect(() => {
    if (!phone) {
      navigate('/login');
      return;
    }

    // Start countdown timer
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phone, navigate]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    const result = await dispatch(verifyOTP({
      phone,
      otp: otpString,
      name: isLogin ? undefined : name,
      role: isLogin ? undefined : role
    }));

    if (verifyOTP.fulfilled.match(result)) {
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      
      // Redirect based on role
      const userRole = result.payload.user.role;
      if (userRole === 'farmer') {
        navigate('/farmer/dashboard');
      } else {
        navigate('/retailer/dashboard');
      }
    } else {
      toast.error(result.payload || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    const result = await dispatch(sendOTP(phone));
    
    if (sendOTP.fulfilled.match(result)) {
      toast.success('OTP resent successfully!');
      setTimer(60);
      setCanResend(false);
      
      // Restart timer
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      toast.error(result.payload || 'Failed to resend OTP');
    }
  };

  // Format phone number for display
  const displayPhone = phone ? phone.replace(/\+91/, '') : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-leaf-50 via-cream-50 to-sky-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <Link
          to={isLogin ? '/login' : '/register'}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center justify-center w-20 h-20 bg-leaf-500 rounded-3xl shadow-xl shadow-leaf-500/30 mb-4"
          >
            <Shield className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Verify OTP</h1>
          <p className="text-gray-600 mb-4">
            Enter the 6-digit code sent to<br />
            <span className="font-medium text-gray-800">+91 {displayPhone}</span>
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-sm font-medium text-gray-500">Powered by</span>
            <span className="text-lg font-bold bg-gradient-to-r from-leaf-600 to-emerald-600 bg-clip-text text-transparent">Mandi Connect</span>
          </div>
        </div>

        {/* OTP Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Inputs */}
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/20 outline-none transition-all"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </button>
          </form>

          {/* Resend */}
          <div className="mt-6 text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                className="inline-flex items-center gap-2 text-leaf-600 font-medium hover:text-leaf-700"
              >
                <RefreshCw className="w-4 h-4" />
                Resend OTP
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                Resend OTP in <span className="font-medium text-leaf-600">{timer}s</span>
              </p>
            )}
          </div>
        </motion.div>

        {/* Help Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          Didn't receive the code? Check your SMS or{' '}
          <button className="text-leaf-600 font-medium hover:text-leaf-700">
            contact support
          </button>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default OTPVerification;
