import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Package, ShoppingCart, DollarSign, ArrowUpRight, ArrowDownRight, Sprout } from 'lucide-react';
import api from '../../services/api';
import { useLanguage } from '../common/LanguageToggle';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#14b8a6'];

// Beautiful gradient definitions for charts
const GRADIENTS = {
  emerald: { start: '#10b981', end: '#059669' },
  blue: { start: '#3b82f6', end: '#2563eb' },
  purple: { start: '#8b5cf6', end: '#7c3aed' },
  amber: { start: '#f59e0b', end: '#d97706' },
  rose: { start: '#f43f5e', end: '#e11d48' },
  cyan: { start: '#06b6d4', end: '#0891b2' }
};

const CropAnalytics = () => {
  const { t } = useLanguage();
  const [analyticsData, setAnalyticsData] = useState({
    cropDemand: [],
    orderTrends: [],
    topCrops: [],
    monthlyRevenue: [],
    summary: {}
  });
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('demand');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('📊 Fetching analytics data...');
      const response = await api.get('/analytics/crop-demand', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Analytics data received:', response.data);
      console.log('Crop Demand:', response.data.cropDemand);
      console.log('Order Trends:', response.data.orderTrends);
      console.log('Top Crops:', response.data.topCrops);
      
      setAnalyticsData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching analytics:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">📊 Crop Analytics Dashboard</h2>
        <p className="opacity-90">Track demand, orders, and make informed decisions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="High Demand Crops"
          value={analyticsData.summary?.highDemandCount || 0}
          trend="+12%"
          color="from-emerald-500 to-emerald-600"
        />
        <SummaryCard
          icon={<Package className="w-6 h-6" />}
          title="Total Orders"
          value={analyticsData.summary?.totalOrders || 0}
          trend="+8%"
          color="from-blue-500 to-blue-600"
        />
        <SummaryCard
          icon={<ShoppingCart className="w-6 h-6" />}
          title="Active Listings"
          value={analyticsData.summary?.activeListings || 0}
          trend="+15%"
          color="from-amber-500 to-amber-600"
        />
        <SummaryCard
          icon={<DollarSign className="w-6 h-6" />}
          title="Avg. Price/kg"
          value={`₹${analyticsData.summary?.avgPrice || 0}`}
          trend="+5%"
          color="from-purple-500 to-purple-600"
        />
      </div>

      {/* View Selector */}
      {analyticsData.cropDemand.length === 0 ? (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-12 text-center border-2 border-dashed border-amber-300">
          <Sprout className="w-24 h-24 mx-auto text-amber-400 mb-4" />
          <h3 className="text-2xl font-bold text-amber-900 mb-2">No Crops Added Yet!</h3>
          <p className="text-amber-700 mb-6 max-w-md mx-auto">
            Add your crops in "My Crops" section to see beautiful analytics graphs here.
          </p>
          <Link 
            to="/farmer/crops"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-leaf-500 to-leaf-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-leaf-600 hover:to-leaf-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Sprout className="w-5 h-5" />
            Add Your First Crop
          </Link>
        </div>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2">
        <ViewButton 
          active={selectedView === 'demand'} 
          onClick={() => setSelectedView('demand')}
          label="📈 Demand Analysis"
        />
        <ViewButton 
          active={selectedView === 'orders'} 
          onClick={() => setSelectedView('orders')}
          label="🛒 Order Trends"
        />
        <ViewButton 
          active={selectedView === 'revenue'} 
          onClick={() => setSelectedView('revenue')}
          label="💰 Revenue"
        />
        <ViewButton 
          active={selectedView === 'topcrops'} 
          onClick={() => setSelectedView('topcrops')}
          label="⭐ Top Crops"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {selectedView === 'demand' && (
          <>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></span>
                Crop Demand Overview
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={analyticsData.cropDemand} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <defs>
                    <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.4}/>
                    </linearGradient>
                    <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6b7280" 
                    fontSize={11}
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    tick={{ fill: '#6b7280' }}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    fontSize={12}
                    tick={{ fill: '#6b7280' }}
                    label={{ value: 'Quantity (kg)', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                      padding: '12px'
                    }}
                    cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      paddingTop: '20px',
                      display: 'flex',
                      justifyContent: 'center'
                    }} 
                  />
                  <Bar 
                    dataKey="demand" 
                    name="Demand"
                    fill="url(#colorDemand)" 
                    radius={[12, 12, 0, 0]}
                    barSize={40}
                  />
                  <Bar 
                    dataKey="supply" 
                    name="Your Supply"
                    fill="url(#colorSupply)" 
                    radius={[12, 12, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"></span>
                Demand vs Supply Gap Analysis
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={analyticsData.cropDemand} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <defs>
                    <linearGradient id="colorDemandArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorSupplyArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6b7280" 
                    fontSize={11}
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    tick={{ fill: '#6b7280' }}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    fontSize={12}
                    tick={{ fill: '#6b7280' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                      padding: '12px'
                    }}
                    cursor={{ stroke: '#6b7280', strokeWidth: 1 }}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      paddingTop: '20px',
                      display: 'flex',
                      justifyContent: 'center'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="demand" 
                    name="Demand"
                    stroke="#10b981" 
                    strokeWidth={3}
                    fill="url(#colorDemandArea)" 
                    activeDot={{ r: 8, strokeWidth: 2 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="supply" 
                    name="Your Supply"
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    fill="url(#colorSupplyArea)" 
                    activeDot={{ r: 8, strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {selectedView === 'orders' && (
          <>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></span>
                Order Trends (Last 6 Months)
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={analyticsData.orderTrends} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280" 
                    fontSize={11}
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    tick={{ fill: '#6b7280' }}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    fontSize={12}
                    tick={{ fill: '#6b7280' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                      padding: '12px'
                    }}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      paddingTop: '20px',
                      display: 'flex',
                      justifyContent: 'center'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    name="Orders"
                    stroke="#3b82f6" 
                    strokeWidth={4}
                    dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 3 }}
                    fill="url(#colorOrders)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    name="Value (₹1000s)"
                    stroke="#10b981" 
                    strokeWidth={4}
                    dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 3 }}
                    fill="url(#colorValue)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></span>
                Orders by Category Distribution
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <defs>
                    {COLORS.map((color, index) => (
                      <linearGradient key={`gradient-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={1}/>
                        <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={analyticsData.topCrops}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={110}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {analyticsData.topCrops.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#pieGradient-${index})`}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                      padding: '12px'
                    }} 
                  />
                  <Legend 
                    verticalAlign="bottom"
                    height={50}
                    wrapperStyle={{ 
                      paddingTop: '20px',
                      display: 'flex',
                      justifyContent: 'center',
                      flexWrap: 'wrap'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {selectedView === 'revenue' && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></span>
              Monthly Revenue & Profit Trends
            </h3>
            <ResponsiveContainer width="100%" height={370}>
              <AreaChart data={analyticsData.monthlyRevenue} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280" 
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                  label={{ value: 'Amount (₹1000s)', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    padding: '12px'
                  }}
                  cursor={{ stroke: '#8b5cf6', strokeWidth: 2 }}
                />
                <Legend 
                  wrapperStyle={{ 
                    paddingTop: '20px',
                    display: 'flex',
                    justifyContent: 'center'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Revenue (₹1000s)"
                  stroke="#8b5cf6" 
                  strokeWidth={4}
                  fill="url(#colorRevenue)" 
                  activeDot={{ r: 8, strokeWidth: 2 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  name="Profit (₹1000s)"
                  stroke="#10b981" 
                  strokeWidth={4}
                  fill="url(#colorProfit)" 
                  activeDot={{ r: 8, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {selectedView === 'topcrops' && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-2 h-8 bg-gradient-to-b from-rose-500 to-rose-600 rounded-full"></span>
              Top Performing Crops by Orders
            </h3>
            <ResponsiveContainer width="100%" height={370}>
              <BarChart data={analyticsData.topCrops} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <defs>
                  {COLORS.map((color, index) => (
                    <linearGradient key={`barGradient-${index}`} id={`barGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={1}/>
                      <stop offset="100%" stopColor={color} stopOpacity={0.6}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280" 
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                  label={{ value: 'Quantity (kg)', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    padding: '12px'
                  }}
                  cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                />
                <Legend 
                  wrapperStyle={{ 
                    paddingTop: '20px',
                    display: 'flex',
                    justifyContent: 'center'
                  }} 
                />
                <Bar 
                  dataKey="value" 
                  name="Total Ordered (kg)"
                  radius={[16, 16, 0, 0]}
                  barSize={60}
                >
                  {analyticsData.topCrops.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#barGradient-${index})`}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
        </>
      )}

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
        <h3 className="text-lg font-semibold text-emerald-900 mb-4">💡 Smart Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analyticsData.recommendations?.map((rec, index) => (
            <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-emerald-100">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-600 font-bold">{index + 1}</span>
                </div>
                <div>
                  <p className="text-emerald-900 font-medium">{rec.title}</p>
                  <p className="text-emerald-700 text-sm mt-1">{rec.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Summary Card Component
const SummaryCard = ({ icon, title, value, trend, color }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
        {icon}
      </div>
      <div className="flex items-center gap-1 text-emerald-600 bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-1.5 rounded-full text-sm font-semibold border border-emerald-200">
        <ArrowUpRight className="w-4 h-4" />
        {trend}
      </div>
    </div>
    <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
    <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{value}</p>
  </div>
);

// View Button Component
const ViewButton = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
      active
        ? 'bg-primary-600 text-white shadow-md'
        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
    }`}
  >
    {label}
  </button>
);

export default CropAnalytics;
