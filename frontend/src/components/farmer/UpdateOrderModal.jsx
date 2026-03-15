import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Navigation, Sprout, User, Phone, Truck } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const UpdateOrderModal = ({ order, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [showFieldInfo, setShowFieldInfo] = useState(false);
  const [formData, setFormData] = useState({
    status: order?.status || 'pending',
    location: '',
    description: '',
    // Crop field info
    farmName: '',
    farmerName: '',
    fieldAddress: '',
    cropDetails: '',
    farmingMethod: '',
    soilType: '',
    irrigationMethod: '',
    harvestDate: '',
    certifications: '',
    // Driver info
    driverName: '',
    driverPhone: '',
    vehicleNumber: '',
    // Live location
    useLiveLocation: false,
    latitude: null,
    longitude: null
  });

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          toast.success('Location captured!');
        },
        (error) => {
          toast.error('Unable to get location. Please enter manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        status: formData.status,
        location: formData.location,
        description: formData.description
      };

      // Add live location if enabled
      if (formData.useLiveLocation && formData.latitude && formData.longitude) {
        updateData.liveLocation = {
          coordinates: [formData.longitude, formData.latitude]
        };
      }

      // Add crop field info if any field is filled
      const fieldInfo = {};
      if (formData.farmName) fieldInfo.farmName = formData.farmName;
      if (formData.farmerName) fieldInfo.farmerName = formData.farmerName;
      if (formData.fieldAddress) fieldInfo.fieldAddress = formData.fieldAddress;
      if (formData.cropDetails) fieldInfo.cropDetails = formData.cropDetails;
      if (formData.farmingMethod) fieldInfo.farmingMethod = formData.farmingMethod;
      if (formData.soilType) fieldInfo.soilType = formData.soilType;
      if (formData.irrigationMethod) fieldInfo.irrigationMethod = formData.irrigationMethod;
      if (formData.harvestDate) fieldInfo.harvestDate = formData.harvestDate;
      if (formData.certifications) fieldInfo.certifications = formData.certifications.split(',').map(s => s.trim());

      if (Object.keys(fieldInfo).length > 0) {
        updateData.cropFieldInfo = fieldInfo;
      }

      // Add driver info if any field is filled
      const driverInfo = {};
      if (formData.driverName) driverInfo.name = formData.driverName;
      if (formData.driverPhone) driverInfo.phone = formData.driverPhone;
      if (formData.vehicleNumber) driverInfo.vehicleNumber = formData.vehicleNumber;

      if (Object.keys(driverInfo).length > 0) {
        updateData.driverInfo = driverInfo;
      }

      await api.put(`/orders/${order._id}/status`, updateData);
      toast.success('Order updated successfully!');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to update order:', error);
      toast.error(error.response?.data?.message || 'Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-xl font-bold text-text-700">Update Order Status</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-6 h-6 text-text-600" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Order Info */}
            <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
              <div className="flex items-center gap-3 mb-2">
                <Truck className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-text-700">Order #{order?.orderNumber}</h3>
              </div>
              <p className="text-sm text-text-600">Current Status: <span className="font-medium capitalize">{order?.status}</span></p>
            </div>

            {/* Status Update */}
            <div>
              <label className="block text-sm font-medium text-text-700 mb-2">
                Update Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="input"
                required
              >
                <option value="accepted">Accepted</option>
                <option value="preparing">Preparing</option>
                <option value="ready_for_pickup">Ready for Pickup</option>
                <option value="picked_up">Picked Up</option>
                <option value="in_transit">In Transit</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            {/* Location & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-700 mb-2">
                  Current Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Warehouse, Farm gate"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief update message"
                  className="input"
                />
              </div>
            </div>

            {/* Live Location */}
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-primary-600" />
                  <h3 className="font-semibold text-text-700">Live Location Tracking</h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.useLiveLocation}
                    onChange={(e) => setFormData(prev => ({ ...prev, useLiveLocation: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-text-600">Enable</span>
                </label>
              </div>
              
              {formData.useLiveLocation && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    className="btn-secondary text-sm py-2 px-4 flex items-center gap-2 w-full"
                  >
                    <MapPin className="w-4 h-4" />
                    Get Current Location
                  </button>
                  
                  {formData.latitude && formData.longitude && (
                    <div className="bg-gray-50 rounded-lg p-3 text-sm">
                      <p className="text-text-600">
                        Coordinates: <span className="font-medium text-text-700">
                          {formData.latitude}, {formData.longitude}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Crop Field Information Toggle */}
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-primary-600" />
                  <h3 className="font-semibold text-text-700">Crop Field Information</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFieldInfo(!showFieldInfo)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  {showFieldInfo ? 'Hide' : 'Add'}
                </button>
              </div>

              {showFieldInfo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-sm font-medium text-text-700 mb-2">
                      Farm Name
                    </label>
                    <input
                      type="text"
                      value={formData.farmName}
                      onChange={(e) => setFormData(prev => ({ ...prev, farmName: e.target.value }))}
                      placeholder="Your farm name"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-700 mb-2">
                      Farmer Name
                    </label>
                    <input
                      type="text"
                      value={formData.farmerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, farmerName: e.target.value }))}
                      placeholder="Your name"
                      className="input"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-700 mb-2">
                      Field Address
                    </label>
                    <input
                      type="text"
                      value={formData.fieldAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, fieldAddress: e.target.value }))}
                      placeholder="Complete address of the field"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-700 mb-2">
                      Crop Details
                    </label>
                    <input
                      type="text"
                      value={formData.cropDetails}
                      onChange={(e) => setFormData(prev => ({ ...prev, cropDetails: e.target.value }))}
                      placeholder="e.g., Organic Tomatoes"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-700 mb-2">
                      Farming Method
                    </label>
                    <input
                      type="text"
                      value={formData.farmingMethod}
                      onChange={(e) => setFormData(prev => ({ ...prev, farmingMethod: e.target.value }))}
                      placeholder="e.g., Organic, Conventional"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-700 mb-2">
                      Soil Type
                    </label>
                    <input
                      type="text"
                      value={formData.soilType}
                      onChange={(e) => setFormData(prev => ({ ...prev, soilType: e.target.value }))}
                      placeholder="e.g., Loamy, Sandy"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-700 mb-2">
                      Irrigation Method
                    </label>
                    <input
                      type="text"
                      value={formData.irrigationMethod}
                      onChange={(e) => setFormData(prev => ({ ...prev, irrigationMethod: e.target.value }))}
                      placeholder="e.g., Drip, Sprinkler"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-700 mb-2">
                      Harvest Date
                    </label>
                    <input
                      type="date"
                      value={formData.harvestDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, harvestDate: e.target.value }))}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-700 mb-2">
                      Certifications (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.certifications}
                      onChange={(e) => setFormData(prev => ({ ...prev, certifications: e.target.value }))}
                      placeholder="e.g., Organic India, USDA"
                      className="input"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Driver Information */}
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-text-700">Driver Information (Optional)</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-700 mb-2">
                    Driver Name
                  </label>
                  <input
                    type="text"
                    value={formData.driverName}
                    onChange={(e) => setFormData(prev => ({ ...prev, driverName: e.target.value }))}
                    placeholder="Driver's full name"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-700 mb-2">
                    Driver Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.driverPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, driverPhone: e.target.value }))}
                    placeholder="+91 XXXXXXXXXX"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-700 mb-2">
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                    placeholder="MH 12 AB 1234"
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {loading ? 'Updating...' : 'Update Order'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpdateOrderModal;
