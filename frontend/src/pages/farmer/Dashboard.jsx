import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  IndianRupee,
  Sprout,
  Star,
  ArrowUpRight,
  Calendar,
  Store
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useLanguage } from '../../components/common/LanguageToggle';
import CropAnalytics from '../../components/farmer/CropAnalytics';

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="card p-6"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        {trend && (
          <p className={`text-sm mt-2 flex items-center gap-1 ${trend > 0 ? 'text-leaf-600' : 'text-red-500'}`}>
            <ArrowUpRight className="w-4 h-4" />
            {trend > 0 ? '+' : ''}{trend}% this month
          </p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

const FarmerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/farmers/dashboard');
      console.log('Dashboard response:', response.data);
      setStats(response.data?.data?.stats || null);
      setRecentOrders(response.data?.data?.recentOrders || []);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leaf-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('Welcome back')}! 👋</h1>
          <p className="text-gray-600 mt-1">{t("Here's what's happening with your farm today")}</p>
        </div>
        <Link
          to="/farmer/crops/add"
          className="btn-primary inline-flex items-center gap-2"
        >
          <Sprout className="w-5 h-5" />
          {t('Add New Crop')}
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats ? (
          <>
            <StatCard
              title={t('Total Revenue')}
              value={`₹${stats.totalRevenue?.toLocaleString() || 0}`}
              icon={IndianRupee}
              trend={12}
              color="bg-leaf-500"
            />
            <StatCard
              title={t('Active Crops')}
              value={stats.activeCrops || 0}
              icon={Package}
              trend={8}
              color="bg-sky-500"
            />
            <StatCard
              title={t('Total Orders')}
              value={stats.totalOrders || 0}
              icon={ShoppingCart}
              trend={-3}
              color="bg-harvest-500"
            />
            <StatCard
              title={t('Trust Score')}
              value={`${stats.trustScore || 0}/100`}
              icon={Star}
              color="bg-soil-500"
            />
          </>
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">Unable to load statistics. Please try refreshing the page.</p>
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">{t('Recent Orders')}</h2>
          <Link to="/farmer/orders" className="text-leaf-600 text-sm font-medium hover:text-leaf-700">
            {t('View All')}
          </Link>
        </div>
        
        <div className="divide-y divide-gray-100">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>{t('No orders yet. Start by adding crops!')}</p>
            </div>
          ) : (
            recentOrders.map((order) => (
              <div key={order._id} className="border-b border-gray-100 last:border-0">
                {/* Order Summary - Clickable */}
                <div 
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-leaf-100 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-leaf-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">
                        {order.items.length} items • ₹{order.totalAmount}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${
                      order.status === 'pending' ? 'badge-warning' :
                      order.status === 'accepted' ? 'badge-success' :
                      'badge-info'
                    }`}>
                      {order.status}
                    </span>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Expanded Order Details */}
                {expandedOrderId === order._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 pb-4 bg-gray-50"
                  >
                    <div className="space-y-4">
                      {/* Retailer Info */}
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                        <Store className="w-5 h-5 text-leaf-600" />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{t('Retailer')}</p>
                          <p className="text-sm text-gray-600">{order.retailerId?.businessName || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">{t('Order Items')}</h4>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">{item.cropId?.name || 'Crop'}</p>
                                <p className="text-xs text-gray-500">{item.quantity} kg × ₹{item.pricePerKg}/kg</p>
                              </div>
                              <p className="font-semibold text-gray-800">₹{item.total}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                          <span className="text-sm font-semibold text-gray-800">{t('Total Amount')}</span>
                          <span className="text-lg font-bold text-leaf-600">₹{order.totalAmount}</span>
                        </div>
                      </div>

                      {/* Payment & Status Info */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">{t('Payment Status')}</p>
                          <p className={`text-sm font-semibold ${
                            order.paymentStatus === 'paid' ? 'text-green-600' :
                            order.paymentStatus === 'pending' ? 'text-amber-600' :
                            'text-red-600'
                          }`}>
                            {order.paymentStatus || 'Pending'}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">{t('Order Date')}</p>
                          <p className="text-sm font-semibold text-gray-800">
                            {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>

                      {/* Transaction ID */}
                      {order.transactionId && (
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">{t('Transaction ID')}</p>
                          <p className="text-sm font-mono text-gray-800">{order.transactionId}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/farmer/crops" className="card p-6 hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 bg-leaf-100 rounded-xl flex items-center justify-center mb-4">
            <Sprout className="w-6 h-6 text-leaf-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">{t('Manage Crops')}</h3>
          <p className="text-sm text-gray-500">{t('View and update your crop listings')}</p>
        </Link>
        
        <Link to="/farmer/orders" className="card p-6 hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
            <ShoppingCart className="w-6 h-6 text-sky-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">{t('View Orders')}</h3>
          <p className="text-sm text-gray-500">{t('Track and manage customer orders')}</p>
        </Link>
        
        <Link to="/farmer/analytics" className="card p-6 hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 bg-harvest-100 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-harvest-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">{t('Crop Analytics')}</h3>
          <p className="text-sm text-gray-500">{t('View demand insights and recommendations')}</p>
        </Link>
      </div>

      {/* Full Analytics Section */}
      <div className="mt-8">
        <CropAnalytics />
      </div>
    </div>
  );
};

export default FarmerDashboard;
