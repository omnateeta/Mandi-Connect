import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Menu, LogOut, User, Sprout, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../../store/slices/authSlice';
import api from '../../services/api';
import LanguageToggle, { useLanguage } from './LanguageToggle';

const Header = ({ userType }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Order Received',
      message: 'You have a new order for 50kg Tomato',
      time: '5 min ago',
      type: 'order',
      read: false
    },
    {
      id: 2,
      title: 'Payment Completed',
      message: '₹2,500 received for your crop sale',
      time: '1 hour ago',
      type: 'payment',
      read: false
    },
    {
      id: 3,
      title: 'Price Alert',
      message: 'Potato prices increased by 15% in your area',
      time: '3 hours ago',
      type: 'alert',
      read: true
    }
  ]);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    fetchProfileImage();
    fetchNotifications();
  }, [userType]);

  const fetchProfileImage = async () => {
    try {
      if (userType === 'farmer') {
        const response = await api.get('/farmers/profile');
        setProfileImage(response.data.data.farmer?.profileImage);
      } else if (userType === 'retailer') {
        const response = await api.get('/retailers/profile');
        setProfileImage(response.data.data.retailer?.profileImage);
      }
    } catch (error) {
      console.error('Failed to fetch profile image:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      // In production, fetch from API
      // For now, using mock data
      console.log('Fetching notifications...');
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      {/* Hidden Google Translate Widget Container */}
      <div style={{position:'absolute',left:'-9999px',top:'-9999px'}}>
        <div id="google_translate_element"></div>
      </div>
      
      {/* Role Indicator Banner */}
      <div className={`px-4 py-2 text-center ${userType === 'farmer' ? 'bg-gradient-to-r from-leaf-500 to-leaf-600' : 'bg-gradient-to-r from-primary-500 to-primary-600'}`}>
        <div className="flex items-center justify-center gap-2 text-white">
          {userType === 'farmer' ? (
            <Sprout className="w-5 h-5" />
          ) : (
            <ShoppingCart className="w-5 h-5" />
          )}
          <span className="font-bold text-sm tracking-wide uppercase">
            {userType === 'farmer' ? "🌾 Farmer's Portal" : "🛒 Retailer's Portal"}
          </span>
          {userType === 'farmer' ? (
            <Sprout className="w-5 h-5" />
          ) : (
            <ShoppingCart className="w-5 h-5" />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        {/* Left: Mobile Menu, Title */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800 capitalize lg:hidden">
            {t(userType === 'farmer' ? 'Farmer' : 'Retailer')} {t('Dashboard')}
          </h2>
        </div>

        {/* Right: Language, Search, Notifications, Profile */}
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <LanguageToggle />
          
          {/* Search - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`${t('Search crops, orders...')}`}
              className="bg-transparent border-none outline-none text-sm w-48 placeholder-gray-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  // Navigate to marketplace with search query
                  if (userType === 'retailer') {
                    navigate(`/retailer/marketplace?search=${encodeURIComponent(searchQuery)}`);
                  } else if (userType === 'farmer') {
                    navigate(`/farmer/crops?search=${encodeURIComponent(searchQuery)}`);
                  }
                }
              }}
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
              className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>

            <AnimatePresence>
              {showNotificationsMenu && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotificationsMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-elevated border border-gray-100 z-50 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-bold text-gray-800">Notifications</h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Mark all read
                        </button>
                        <button
                          onClick={clearAllNotifications}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Clear all
                        </button>
                      </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-600 font-medium">No notifications</p>
                          <p className="text-sm text-gray-500">You're all caught up!</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => markAsRead(notif.id)}
                            className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                              !notif.read ? 'bg-blue-50/50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                                !notif.read ? 'bg-blue-500' : 'bg-gray-300'
                              }`} />
                              <div className="flex-1">
                                <p className={`font-semibold text-sm ${
                                  !notif.read ? 'text-gray-800' : 'text-gray-600'
                                }`}>{notif.title}</p>
                                <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                                <p className="text-xs text-gray-400 mt-2">{notif.time}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                        <button
                          onClick={() => {
                            setShowNotificationsMenu(false);
                            navigate(`/${userType}/notifications`);
                          }}
                          className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          View all notifications →
                        </button>
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-9 h-9 bg-leaf-100 rounded-full flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-leaf-600" />
                )}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {user?.name?.split(' ')[0] || 'User'}
              </span>
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-elevated border border-gray-100 z-50 py-2"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.phone}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate(`/${userType}/profile`);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      {t('Profile')}
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('Logout')}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
