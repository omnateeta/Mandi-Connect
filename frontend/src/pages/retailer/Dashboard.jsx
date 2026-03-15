import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Package, 
  IndianRupee,
  Star,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import NearbyLocations from '../../components/retailer/NearbyLocations';

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

const RetailerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/retailers/dashboard');
      setStats(response.data.data.stats);
      setRecentOrders(response.data.data.recentOrders);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
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
          <h1 className="text-2xl font-bold text-gray-800">Welcome back! 🛒</h1>
          <p className="text-gray-600 mt-1">Find fresh produce directly from farmers</p>
        </div>
        <Link
          to="/retailer/marketplace"
          className="btn-primary inline-flex items-center gap-2"
        >
          <ShoppingBag className="w-5 h-5" />
          Browse Marketplace
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Spent"
          value={`₹${stats?.totalSpent?.toLocaleString() || 0}`}
          icon={IndianRupee}
          trend={15}
          color="bg-leaf-500"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={Package}
          trend={8}
          color="bg-sky-500"
        />
        <StatCard
          title="Pending Orders"
          value={stats?.pendingOrders || 0}
          icon={TrendingUp}
          color="bg-harvest-500"
        />
        <StatCard
          title="Your Rating"
          value={`${stats?.rating?.average || 0}/5`}
          icon={Star}
          color="bg-soil-500"
        />
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
          <Link to="/retailer/orders" className="text-leaf-600 text-sm font-medium hover:text-leaf-700">
            View All
          </Link>
        </div>
        
        <div className="divide-y divide-gray-100">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No orders yet. Start shopping!</p>
              <Link to="/retailer/marketplace" className="btn-primary mt-4 inline-flex">
                Browse Marketplace
              </Link>
            </div>
          ) : (
            recentOrders.map((order) => (
              <div key={order._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-leaf-100 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-leaf-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">
                      From {order.farmerId?.farmName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`badge ${
                    order.status === 'pending' ? 'badge-warning' :
                    order.status === 'delivered' ? 'badge-success' :
                    'badge-info'
                  }`}>
                    {order.status}
                  </span>
                  <p className="text-sm font-medium text-gray-800 mt-1">₹{order.totalAmount}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/retailer/marketplace" className="card p-6 hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 bg-leaf-100 rounded-xl flex items-center justify-center mb-4">
            <ShoppingBag className="w-6 h-6 text-leaf-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">Browse Marketplace</h3>
          <p className="text-sm text-gray-500">Discover fresh produce from local farmers</p>
        </Link>
        
        <Link to="/retailer/orders" className="card p-6 hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
            <Package className="w-6 h-6 text-sky-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">Track Orders</h3>
          <p className="text-sm text-gray-500">View status of your orders</p>
        </Link>
      </div>

      {/* Nearby Agriculture Locations */}
      <div className="mt-8">
        <NearbyLocations />
      </div>
    </div>
  );
};

export default RetailerDashboard;
