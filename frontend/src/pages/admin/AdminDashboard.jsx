import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Package, ShoppingCart, DollarSign, TrendingUp, 
  AlertTriangle, Shield, UserCheck, Activity, LogOut,
  Menu, X, Award, MapPin, Phone, Mail, AlertCircle,
  CheckCircle, XCircle, Clock, AlertOctagon, Thermometer,
  Scale, Microscope, FileText, BarChart3, Bell, Zap
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [fraudData, setFraudData] = useState(null);
  const [farmerData, setFarmerData] = useState(null);
  const [retailerData, setRetailerData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    checkAuth();
    fetchDashboardData();
  }, []);

  const checkAuth = () => {
    const adminData = localStorage.getItem('admin');
    const token = localStorage.getItem('adminToken');
    
    if (!adminData || !token) {
      navigate('/admin/login');
      return;
    }
    
    setAdmin(JSON.parse(adminData));
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get('/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDashboardData(response.data.data);
      
      // Also fetch fraud detection data
      const fraudResponse = await api.get('/admin/fraud-detection', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFraudData(fraudResponse.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchFarmerAnalytics = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get('/admin/farmers/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFarmerData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch farmer analytics:', error);
      toast.error('Failed to load farmer data');
    }
  };

  const fetchRetailerAnalytics = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get('/admin/retailers/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRetailerData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch retailer analytics:', error);
      toast.error('Failed to load retailer data');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-green-50 to-emerald-100">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #16a34a 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-white to-green-50 shadow-2xl transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-r border-green-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Farmsetu</h2>
              <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'overview' 
                  ? 'bg-gradient-to-r from-primary-600 to-green-600 text-white shadow-lg shadow-green-500/30' 
                  : 'text-gray-600 hover:bg-green-100 hover:shadow-md'
              }`}
            >
              <Activity className="w-5 h-5" />
              <span className="font-medium">Overview</span>
            </button>
            
            <button
              onClick={() => setActiveTab('fraud')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'fraud' 
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/30' 
                  : 'text-gray-600 hover:bg-red-100 hover:shadow-md'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Fraud Detection</span>
              {fraudData?.summary?.critical > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {fraudData.summary.critical}
                </span>
              )}
            </button>
            
            <button
              onClick={() => { setActiveTab('farmers'); fetchFarmerAnalytics(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'farmers' 
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-gray-600 hover:bg-blue-100 hover:shadow-md'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Farmers</span>
            </button>
            
            <button
              onClick={() => { setActiveTab('retailers'); fetchRetailerAnalytics(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'retailers' 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30' 
                  : 'text-gray-600 hover:bg-purple-100 hover:shadow-md'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="font-medium">Retailers</span>
            </button>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-3 mb-4 p-3 bg-white rounded-xl shadow-md">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-green-600 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-800">{admin?.username}</p>
              <p className="text-xs text-gray-500 capitalize">{admin?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-gradient-to-r from-white via-green-50 to-emerald-50 shadow-lg border-b border-green-200">
          <div className="px-6 py-5 flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-green-100 rounded-xl transition-colors">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-green-600 bg-clip-text text-transparent">
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'fraud' && 'Fraud Detection'}
                {activeTab === 'farmers' && 'Farmer Management'}
                {activeTab === 'retailers' && 'Retailer Management'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {activeTab === 'overview' && 'Monitor platform performance'}
                {activeTab === 'fraud' && 'Detect and prevent fraudulent activities'}
                {activeTab === 'farmers' && 'Manage farmer accounts and analytics'}
                {activeTab === 'retailers' && 'Manage retailer accounts and analytics'}
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 space-y-6">
          {activeTab === 'overview' && dashboardData && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={<Users className="w-6 h-6" />}
                  title="Total Farmers"
                  value={dashboardData.overview.totalFarmers}
                  color="from-blue-500 to-blue-600"
                />
                <StatCard
                  icon={<ShoppingCart className="w-6 h-6" />}
                  title="Total Retailers"
                  value={dashboardData.overview.totalRetailers}
                  color="from-green-500 to-green-600" />
                <StatCard
                  icon={<Package className="w-6 h-6" />}
                  title="Total Crops"
                  value={dashboardData.overview.totalCrops}
                  color="from-amber-500 to-amber-600"
                />
                <StatCard
                  icon={<DollarSign className="w-6 h-6" />}
                  title="Total Revenue"
                  value={`₹${(dashboardData.overview.totalRevenue / 1000).toFixed(2)}K`}
                  color="from-purple-500 to-purple-600"
                />
              </div>

              {/* Top Farmers */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Top Performing Farmers
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Rank</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Farmer</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Orders</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.topFarmers.slice(0, 5).map((farmer, index) => (
                        <tr key={farmer.farmerId} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                              index === 0 ? 'bg-yellow-100 text-yellow-700' :
                              index === 1 ? 'bg-gray-100 text-gray-700' :
                              index === 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-50 text-gray-600'
                            }`}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-800">{farmer.farmerName}</td>
                          <td className="py-3 px-4 text-sm text-right text-gray-600">{farmer.totalOrders}</td>
                          <td className="py-3 px-4 text-sm text-right font-semibold text-green-600">
                            ₹{(farmer.totalRevenue / 1000).toFixed(2)}K
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Retailers */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  Top Active Retailers
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Rank</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Business</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Orders</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Spent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.topRetailers.slice(0, 5).map((retailer, index) => (
                        <tr key={retailer.retailerId} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                              index === 0 ? 'bg-yellow-100 text-yellow-700' :
                              index === 1 ? 'bg-gray-100 text-gray-700' :
                              index === 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-50 text-gray-600'
                            }`}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-800">{retailer.businessName}</td>
                          <td className="py-3 px-4 text-sm text-right text-gray-600">{retailer.totalOrders}</td>
                          <td className="py-3 px-4 text-sm text-right font-semibold text-blue-600">
                            ₹{(retailer.totalSpent / 1000).toFixed(2)}K
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fraud' && fraudData && (
            <div className="space-y-6">
              {/* Emergency Alerts Banner */}
              {fraudData.summary.critical > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-xl shadow-2xl p-6 text-white relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-black/10 animate-pulse" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
                        <AlertOctagon className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">🚨 EMERGENCY ALERT</h2>
                        <p className="text-white/90">{fraudData.summary.critical} critical fraud issue(s) detected requiring immediate action!</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toast.error('Emergency response team notified!', { duration: 4000 })}
                      className="px-6 py-3 bg-white text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors shadow-lg flex items-center gap-2"
                    >
                      <Bell className="w-5 h-5" />
                      Alert Team
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Quality Verification Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-lg p-6 border-2 border-green-300">
                  <div className="flex items-center justify-between mb-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <TrendingUp className="w-5 h-5 text-green-700" />
                  </div>
                  <p className="text-sm text-green-700 font-medium">Verified Genuine</p>
                  <p className="text-3xl font-bold text-green-800">{fraudData.summary.verified || 0}</p>
                  <p className="text-xs text-green-600 mt-1">Crops authenticated</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-xl shadow-lg p-6 border-2 border-red-300">
                  <div className="flex items-center justify-between mb-3">
                    <XCircle className="w-8 h-8 text-red-600" />
                    <AlertTriangle className="w-5 h-5 text-red-700" />
                  </div>
                  <p className="text-sm text-red-700 font-medium">Suspected Fraud</p>
                  <p className="text-3xl font-bold text-red-800">{fraudData.summary.fraudulent || 0}</p>
                  <p className="text-xs text-red-600 mt-1">Requires investigation</p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl shadow-lg p-6 border-2 border-amber-300">
                  <div className="flex items-center justify-between mb-3">
                    <Clock className="w-8 h-8 text-amber-600" />
                    <FileText className="w-5 h-5 text-amber-700" />
                  </div>
                  <p className="text-sm text-amber-700 font-medium">Pending Review</p>
                  <p className="text-3xl font-bold text-amber-800">{fraudData.summary.pending || 0}</p>
                  <p className="text-xs text-amber-600 mt-1">Under verification</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl shadow-lg p-6 border-2 border-blue-300">
                  <div className="flex items-center justify-between mb-3">
                    <Award className="w-8 h-8 text-blue-600" />
                    <BarChart3 className="w-5 h-5 text-blue-700" />
                  </div>
                  <p className="text-sm text-blue-700 font-medium">Quality Score</p>
                  <p className="text-3xl font-bold text-blue-800">{(fraudData.summary.qualityScore || 0).toFixed(1)}%</p>
                  <p className="text-xs text-blue-600 mt-1">Overall platform health</p>
                </div>
              </div>

              {/* Advanced Detection Features */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Crop Quality Analysis */}
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border-2 border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Microscope className="w-6 h-6 text-green-600" />
                      Crop Quality Analysis
                    </h3>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      AI-Powered
                    </span>
                  </div>
                  <div className="space-y-3">
                    {fraudData.cropAnalysis?.slice(0, 5).map((crop, idx) => (
                      <div key={idx} className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              crop.quality === 'excellent' ? 'bg-green-500' :
                              crop.quality === 'good' ? 'bg-blue-500' :
                              crop.quality === 'fair' ? 'bg-amber-500' : 'bg-red-500'
                            }`} />
                            <div>
                              <p className="font-semibold text-gray-800">{crop.name}</p>
                              <p className="text-xs text-gray-600">Farmer: {crop.farmerName}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-800">Quality: {crop.qualityScore}/100</p>
                            <p className="text-xs text-gray-600 capitalize">{crop.quality} Grade</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Anomaly Detection */}
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border-2 border-amber-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Scale className="w-6 h-6 text-amber-600" />
                      Price Anomaly Detection
                    </h3>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                      Real-Time
                    </span>
                  </div>
                  <div className="space-y-3">
                    {fraudData.priceAnomalies?.slice(0, 5).map((anomaly, idx) => (
                      <div key={idx} className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-800">{anomaly.cropName}</p>
                            <p className="text-xs text-gray-600">Current: ₹{anomaly.currentPrice}/kg</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-red-600">+{anomaly.deviation}% above market</p>
                            <p className="text-xs text-gray-600">Market avg: ₹{anomaly.marketPrice}/kg</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Document Verification */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-600" />
                    Document Verification Status
                  </h3>
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-200">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Document Type</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Submitted By</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Verification Status</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Authenticity</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Action Required</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fraudData.documentVerification?.slice(0, 8).map((doc, idx) => (
                        <tr key={idx} className="border-b hover:bg-blue-50 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-800">{doc.type}</p>
                            <p className="text-xs text-gray-500">{doc.date}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-800">{doc.submitterName}</p>
                            <p className="text-xs text-gray-500">{doc.submitterType}</p>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                              doc.status === 'verified' ? 'bg-green-100 text-green-700' :
                              doc.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {doc.status === 'verified' && <CheckCircle className="w-3 h-3" />}
                              {doc.status === 'pending' && <Clock className="w-3 h-3" />}
                              {doc.status === 'failed' && <XCircle className="w-3 h-3" />}
                              {doc.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    doc.authenticity >= 80 ? 'bg-green-500' :
                                    doc.authenticity >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${doc.authenticity}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold text-gray-700">{doc.authenticity}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button 
                              onClick={() => toast.info(`Reviewing ${doc.type}...`, { duration: 3000 })}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Emergency Contacts */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-100 rounded-xl shadow-xl p-6 border-2 border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Phone className="w-6 h-6 text-purple-600" />
                    Emergency Response Team
                  </h3>
                  <Bell className="w-6 h-6 text-purple-600 animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <p className="text-sm text-gray-600 mb-1">Fraud Investigation Unit</p>
                    <p className="text-lg font-bold text-purple-700 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      +91-1800-123-4567
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Toll Free • 24/7 Available</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <p className="text-sm text-gray-600 mb-1">Quality Assurance Lab</p>
                    <p className="text-lg font-bold text-blue-700 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      +91-9876543210
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Direct • Crop Testing</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <p className="text-sm text-gray-600 mb-1">Legal Support</p>
                    <p className="text-lg font-bold text-red-700 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      +91-11-2345-6789
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Emergency • Legal Action</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'farmers' && farmerData && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  icon={<Users className="w-6 h-6" />}
                  title="Total Farmers"
                  value={farmerData.summary.totalFarmers}
                  color="from-blue-500 to-blue-600"
                />
                <StatCard
                  icon={<Award className="w-6 h-6" />}
                  title="Avg Trust Score"
                  value={farmerData.summary.avgTrustScore}
                  color="from-green-500 to-green-600"
                />
                <StatCard
                  icon={<DollarSign className="w-6 h-6" />}
                  title="Total Revenue"
                  value={`₹${(farmerData.summary.totalRevenue / 1000).toFixed(2)}K`}
                  color="from-purple-500 to-purple-600"
                />
              </div>

              {/* Farmers List */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-green-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  All Farmers Performance
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Farmer</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Location</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Crops</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Orders</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Trust Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {farmerData.farmers.map((farmer, index) => (
                        <tr key={farmer.farmerId} className="border-b hover:bg-green-50 transition-colors">
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                              index === 0 ? 'bg-yellow-100 text-yellow-700' :
                              index === 1 ? 'bg-gray-100 text-gray-700' :
                              index === 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-50 text-gray-600'
                            }`}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-semibold text-gray-800">{farmer.farmName}</p>
                              <p className="text-xs text-gray-500">{farmer.ownerName}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <Phone className="w-3 h-3 text-green-600" />
                                <span className="font-mono">{farmer.phone || 'N/A'}</span>
                              </div>
                              {farmer.email && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                  <Mail className="w-3 h-3 text-blue-600" />
                                  <span className="truncate max-w-[150px]">{farmer.email}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {farmer.location?.coordinates ? `${farmer.location.coordinates[1].toFixed(4)}, ${farmer.location.coordinates[0].toFixed(4)}` : (farmer.district || farmer.location || 'N/A')}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-medium text-gray-800">
                            {farmer.stats.totalCrops}
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-gray-600">
                            {farmer.stats.totalOrders}
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-bold text-green-600">
                            ₹{(farmer.stats.totalRevenue / 1000).toFixed(2)}K
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              farmer.trustScore >= 80 ? 'bg-green-100 text-green-700' :
                              farmer.trustScore >= 50 ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {farmer.trustScore}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Crops Section */}
              {farmerData.farmers.length > 0 && farmerData.farmers[0].topCrops.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Top Selling Crops Across All Farmers
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(() => {
                      // Aggregate all top crops
                      const allCrops = {};
                      farmerData.farmers.forEach(farmer => {
                        farmer.topCrops.forEach(crop => {
                          if (!allCrops[crop.cropName]) {
                            allCrops[crop.cropName] = { ...crop, totalQuantity: 0, totalRevenue: 0 };
                          }
                          allCrops[crop.cropName].totalQuantity += crop.totalQuantity;
                          allCrops[crop.cropName].totalRevenue += crop.totalRevenue;
                        });
                      });
                      const sortedCrops = Object.values(allCrops).sort((a, b) => b.totalQuantity - a.totalQuantity).slice(0, 6);
                      
                      return sortedCrops.map((crop, idx) => (
                        <div key={idx} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-bold text-gray-800">{crop.cropName}</p>
                              <p className="text-xs text-gray-500 capitalize">{crop.category}</p>
                            </div>
                            <Award className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Qty: {crop.totalQuantity}kg</span>
                            <span className="font-bold text-green-700">₹{(crop.totalRevenue / 1000).toFixed(2)}K</span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'retailers' && retailerData && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  icon={<ShoppingCart className="w-6 h-6" />}
                  title="Total Retailers"
                  value={retailerData.summary.totalRetailers}
                  color="from-blue-500 to-blue-600"
                />
                <StatCard
                  icon={<Award className="w-6 h-6" />}
                  title="Avg Trust Score"
                  value={retailerData.summary.avgTrustScore}
                  color="from-green-500 to-green-600"
                />
                <StatCard
                  icon={<DollarSign className="w-6 h-6" />}
                  title="Total Spent"
                  value={`₹${(retailerData.summary.totalSpent / 1000).toFixed(2)}K`}
                  color="from-purple-500 to-purple-600"
                />
              </div>

              {/* Retailers List */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-purple-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-purple-600" />
                  All Retailers Performance
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Business</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Location</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Orders</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Spent</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg Order</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Trust Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {retailerData.retailers.map((retailer, index) => (
                        <tr key={retailer.retailerId} className="border-b hover:bg-purple-50 transition-colors">
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                              index === 0 ? 'bg-yellow-100 text-yellow-700' :
                              index === 1 ? 'bg-gray-100 text-gray-700' :
                              index === 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-50 text-gray-600'
                            }`}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-semibold text-gray-800">{retailer.businessName}</p>
                              <p className="text-xs text-gray-500">{retailer.ownerName}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <Phone className="w-3 h-3 text-purple-600" />
                                <span className="font-mono">{retailer.phone || 'N/A'}</span>
                              </div>
                              {retailer.email && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                  <Mail className="w-3 h-3 text-blue-600" />
                                  <span className="truncate max-w-[150px]">{retailer.email}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {retailer.location?.coordinates ? `${retailer.location.coordinates[1].toFixed(4)}, ${retailer.location.coordinates[0].toFixed(4)}` : (retailer.district || retailer.location || 'N/A')}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-medium text-gray-800">
                            {retailer.stats.totalOrders}
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-bold text-purple-600">
                            ₹{(retailer.stats.totalSpent / 1000).toFixed(2)}K
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-gray-600">
                            ₹{retailer.stats.avgOrderValue}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              retailer.trustScore >= 80 ? 'bg-green-100 text-green-700' :
                              retailer.trustScore >= 50 ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {retailer.trustScore}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Ordered Crops */}
              {retailerData.retailers.length > 0 && retailerData.retailers[0].topCrops.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-purple-600" />
                    Most Ordered Crops by Retailers
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(() => {
                      const allCrops = {};
                      retailerData.retailers.forEach(retailer => {
                        retailer.topCrops.forEach(crop => {
                          if (!allCrops[crop.cropName]) {
                            allCrops[crop.cropName] = { ...crop, totalQuantity: 0, totalSpent: 0, orderCount: 0 };
                          }
                          allCrops[crop.cropName].totalQuantity += crop.totalQuantity;
                          allCrops[crop.cropName].totalSpent += crop.totalSpent;
                          allCrops[crop.cropName].orderCount += crop.orderCount;
                        });
                      });
                      const sortedCrops = Object.values(allCrops).sort((a, b) => b.orderCount - a.orderCount).slice(0, 6);
                      
                      return sortedCrops.map((crop, idx) => (
                        <div key={idx} className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-bold text-gray-800">{crop.cropName}</p>
                              <p className="text-xs text-gray-500 capitalize">{crop.category}</p>
                            </div>
                            <ShoppingCart className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Orders:</span>
                              <span className="font-semibold text-purple-700">{crop.orderCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Qty:</span>
                              <span className="font-medium text-gray-700">{crop.totalQuantity}kg</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Value:</span>
                              <span className="font-bold text-purple-700">₹{(crop.totalSpent / 1000).toFixed(2)}K</span>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}

              {/* Top Farmers Preferred by Retailers */}
              {retailerData.retailers.length > 0 && retailerData.retailers[0].topFarmers.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Most Preferred Farmers by Retailers
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(() => {
                      const allFarmers = {};
                      retailerData.retailers.forEach(retailer => {
                        retailer.topFarmers.forEach(farmer => {
                          if (!allFarmers[farmer.farmerName]) {
                            allFarmers[farmer.farmerName] = { orderCount: 0, totalSpent: 0 };
                          }
                          allFarmers[farmer.farmerName].orderCount += farmer.orderCount;
                          allFarmers[farmer.farmerName].totalSpent += farmer.totalSpent;
                        });
                      });
                      const sortedFarmers = Object.values(allFarmers).sort((a, b) => b.orderCount - a.orderCount).slice(0, 6);
                      
                      return sortedFarmers.map((farmer, idx) => (
                        <div key={idx} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                          <div className="mb-2">
                            <p className="font-bold text-gray-800">{farmer.farmerName}</p>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Orders:</span>
                              <span className="font-semibold text-blue-700">{farmer.orderCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Revenue:</span>
                              <span className="font-bold text-blue-700">₹{(farmer.totalSpent / 1000).toFixed(2)}K</span>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, color }) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
        {icon}
      </div>
    </div>
    <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
  </div>
);

// Fraud Stat Card
const FraudStatCard = ({ title, count, color }) => (
  <div className={`${color} rounded-xl shadow-lg p-6 text-white`}>
    <h3 className="text-sm font-medium opacity-90 mb-2">{title}</h3>
    <p className="text-4xl font-bold">{count}</p>
  </div>
);

export default AdminDashboard;
