import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Truck, 
  Package, 
  CheckCircle, 
  Clock, 
  Phone,
  Navigation,
  Sprout,
  User,
  Calendar,
  Info,
  X
} from 'lucide-react';
import api from '../../services/api';
import { useLanguage } from '../../components/common/LanguageToggle';
import LiveLocationTracker from '../../components/common/LiveLocationTracker';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFieldInfo, setShowFieldInfo] = useState(false);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [showLiveTracker, setShowLiveTracker] = useState(false);

  const statusFlow = [
    'pending',
    'accepted',
    'preparing',
    'ready_for_pickup',
    'picked_up',
    'in_transit',
    'out_for_delivery',
    'delivered'
  ];

  const statusConfig = {
    pending: { icon: Clock, color: 'text-harvest-600', bg: 'bg-harvest-100', label: 'Pending' },
    accepted: { icon: CheckCircle, color: 'text-leaf-600', bg: 'bg-leaf-100', label: 'Accepted' },
    preparing: { icon: Package, color: 'text-sky-600', bg: 'bg-sky-100', label: 'Preparing' },
    ready_for_pickup: { icon: Package, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Ready for Pickup' },
    picked_up: { icon: Truck, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Picked Up' },
    in_transit: { icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'In Transit' },
    out_for_delivery: { icon: Truck, color: 'text-primary-600', bg: 'bg-primary-100', label: 'Out for Delivery' },
    delivered: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Delivered' },
    cancelled: { icon: CheckCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Cancelled' },
  };

  useEffect(() => {
    console.log('OrderTracking mounted, orderId:', orderId);
    fetchOrderTracking();
    const interval = setInterval(fetchOrderTracking, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrderTracking = async () => {
    try {
      console.log('Fetching order tracking for:', orderId);
      const response = await api.get(`/orders/${orderId}/tracking`);
      console.log('Order tracking response:', response.data);
      setOrder(response.data.data);
      
      // Update current status index
      const statusIdx = statusFlow.indexOf(response.data.data.currentStatus);
      setCurrentStatusIndex(statusIdx >= 0 ? statusIdx : 0);
    } catch (error) {
      console.error('Failed to fetch order tracking:', error);
      toast.error(t('Failed to load order details'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="card p-12 text-center">
        <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Order not found</h3>
        <button onClick={() => navigate(-1)} className="btn-primary mt-4">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-700">{t('Order Tracking')}</h1>
          <p className="text-text-600 mt-1">#{order.orderNumber}</p>
        </div>
        <button onClick={() => navigate(-1)} className="btn-secondary">
          {t('Go Back')}
        </button>
      </div>

      {/* Live Location Map */}
      {order.liveLocation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Navigation className="w-6 h-6 text-primary-600" />
              <h2 className="text-lg font-semibold text-text-700">Live Location Tracking</h2>
            </div>
            <button
              onClick={() => setShowLiveTracker(true)}
              className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              Start Live Tracking
            </button>
          </div>
          <div className="bg-gradient-to-br from-primary-50 to-secondary-100 rounded-xl p-6 border border-primary-200">
            <div className="text-center space-y-3">
              {order.liveLocation && order.liveLocation.coordinates ? (
                <>
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="w-8 h-8 text-primary-600" />
                    <div>
                      <p className="text-sm text-text-600">Current Location</p>
                      <p className="font-mono text-text-700">
                        {order.liveLocation.coordinates[1]?.toFixed(4) || 'N/A'}, {order.liveLocation.coordinates[0]?.toFixed(4) || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs text-text-500">
                    <Clock className="w-4 h-4" />
                    <span>Updated: {new Date(order.lastLocationUpdate).toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <p className="text-text-600">No live location available yet</p>
              )}
            </div>
          </div>
          {order.estimatedArrival && (
            <div className="mt-4 flex items-center gap-2 text-sm text-text-600">
              <Clock className="w-4 h-4" />
              <span>Estimated Arrival: {new Date(order.estimatedArrival).toLocaleString()}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Status Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-text-700 mb-6">{t('Order Status')}</h2>
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200">
            <div 
              className="h-full bg-primary-500 transition-all duration-500"
              style={{ width: `${(currentStatusIndex / (statusFlow.length - 1)) * 100}%` }}
            ></div>
          </div>

          {/* Status Points */}
          <div className="relative flex justify-between">
            {statusFlow.map((status, idx) => {
              const config = statusConfig[status];
              const Icon = config?.icon || Clock;
              const isActive = idx <= currentStatusIndex;
              
              return (
                <div key={status} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive ? config.bg : 'bg-gray-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? config.color : 'text-gray-400'}`} />
                  </div>
                  <span className={`text-xs mt-2 capitalize ${
                    isActive ? 'text-text-700 font-medium' : 'text-gray-400'
                  }`}>
                    {config?.label || status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Status */}
        <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-200">
          <div className="flex items-center gap-3">
            {(() => {
              const config = statusConfig[order.currentStatus];
              const Icon = config?.icon || Clock;
              return (
                <>
                  <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-text-700">{config?.label || order.currentStatus}</p>
                    <p className="text-sm text-text-600">Current Status</p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </motion.div>

      {/* Crop Field Information */}
      {order.cropFieldInfo && Object.keys(order.cropFieldInfo).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sprout className="w-6 h-6 text-primary-600" />
              <h2 className="text-lg font-semibold text-text-700">Crop Field Information</h2>
            </div>
            <button
              onClick={() => setShowFieldInfo(!showFieldInfo)}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              {showFieldInfo ? 'Hide Details' : 'View Details'}
            </button>
          </div>

          {showFieldInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {order.cropFieldInfo.farmName && (
                <div>
                  <label className="text-sm text-text-500">Farm Name</label>
                  <p className="font-medium text-text-700">{order.cropFieldInfo.farmName}</p>
                </div>
              )}
              {order.cropFieldInfo.farmerName && (
                <div>
                  <label className="text-sm text-text-500">Farmer Name</label>
                  <p className="font-medium text-text-700">{order.cropFieldInfo.farmerName}</p>
                </div>
              )}
              {order.cropFieldInfo.fieldAddress && (
                <div className="md:col-span-2">
                  <label className="text-sm text-text-500">Field Address</label>
                  <p className="font-medium text-text-700">{order.cropFieldInfo.fieldAddress}</p>
                </div>
              )}
              {order.cropFieldInfo.cropDetails && (
                <div>
                  <label className="text-sm text-text-500">Crop Details</label>
                  <p className="font-medium text-text-700">{order.cropFieldInfo.cropDetails}</p>
                </div>
              )}
              {order.cropFieldInfo.farmingMethod && (
                <div>
                  <label className="text-sm text-text-500">Farming Method</label>
                  <p className="font-medium text-text-700">{order.cropFieldInfo.farmingMethod}</p>
                </div>
              )}
              {order.cropFieldInfo.soilType && (
                <div>
                  <label className="text-sm text-text-500">Soil Type</label>
                  <p className="font-medium text-text-700">{order.cropFieldInfo.soilType}</p>
                </div>
              )}
              {order.cropFieldInfo.irrigationMethod && (
                <div>
                  <label className="text-sm text-text-500">Irrigation</label>
                  <p className="font-medium text-text-700">{order.cropFieldInfo.irrigationMethod}</p>
                </div>
              )}
              {order.cropFieldInfo.harvestDate && (
                <div>
                  <label className="text-sm text-text-500">Harvest Date</label>
                  <p className="font-medium text-text-700">
                    {new Date(order.cropFieldInfo.harvestDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              {order.cropFieldInfo.certifications?.length > 0 && (
                <div className="md:col-span-2">
                  <label className="text-sm text-text-500">Certifications</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {order.cropFieldInfo.certifications.map((cert, idx) => (
                      <span key={idx} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Driver Information */}
      {order.currentDriver && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <User className="w-6 h-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-text-700">Driver Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {order.currentDriver.name && (
              <div>
                <label className="text-sm text-text-500">Driver Name</label>
                <p className="font-medium text-text-700">{order.currentDriver.name}</p>
              </div>
            )}
            {order.currentDriver.phone && (
              <div>
                <label className="text-sm text-text-500">Phone</label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary-600" />
                  <p className="font-medium text-text-700">{order.currentDriver.phone}</p>
                </div>
              </div>
            )}
            {order.currentDriver.vehicleNumber && (
              <div>
                <label className="text-sm text-text-500">Vehicle Number</label>
                <p className="font-medium text-text-700">{order.currentDriver.vehicleNumber}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Tracking History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-6 h-6 text-primary-600" />
          <h2 className="text-lg font-semibold text-text-700">Tracking History</h2>
        </div>
        <div className="space-y-3">
          {order.trackingHistory?.map((event, idx) => {
            const config = statusConfig[event.status] || statusConfig.pending;
            const Icon = config.icon || Info;
            
            return (
              <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-text-700">{config.label || event.status}</h4>
                    <span className="text-xs text-text-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-text-600">{event.description}</p>
                  )}
                  {event.location && (
                    <p className="text-xs text-text-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Live Location Tracker Widget */}
      {showLiveTracker && (
        <LiveLocationTracker
          orderId={orderId}
          onClose={() => setShowLiveTracker(false)}
        />
      )}
    </div>
  );
};

export default OrderTracking;
