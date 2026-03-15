import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, Loader2, Sprout, ScanLine, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import AICameraScan from '../../components/farmer/AICameraScan';

const categories = [
  'vegetables', 'fruits', 'grains', 'pulses', 'spices', 
  'oilseeds', 'fibers', 'flowers', 'dairy', 'other'
];

const qualities = ['A', 'B', 'C', 'premium', 'standard', 'economy'];
const units = ['kg', 'quintal', 'ton', 'dozen', 'piece'];

const AddCrop = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [showAIScanner, setShowAIScanner] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'vegetables',
    variety: '',
    pricePerKg: '',
    quantity: '',
    unit: 'kg',
    quality: 'standard',
    harvestDate: '',
    shelfLife: 7,
    description: '',
    minOrderQuantity: 10,
    isOrganic: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create FormData for file upload
      const data = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      
      // Append images
      selectedImages.forEach(image => {
        data.append('images', image);
      });

      await api.post('/crops', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Crop added successfully!');
      navigate('/farmer/crops');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add crop');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + selectedImages.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast.error('Only JPEG, PNG and WebP images are allowed');
      return;
    }

    // Validate file size (5MB max)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Each image must be less than 5MB');
      return;
    }

    setSelectedImages(prev => [...prev, ...files]);
    
    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleAICropDetected = (detectedData) => {
    // Auto-fill form with AI detected data
    setFormData(prev => ({
      ...prev,
      ...detectedData
    }));
    toast.success('Form auto-filled with AI detection! Please verify and adjust values.');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/farmer/crops')}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Add New Crop</h1>
          <p className="text-gray-600">List your produce for retailers</p>
        </div>
      </div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="card p-6 space-y-6"
      >
        {/* Image Upload */}
        <div className="space-y-4">
          <label className="block">
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-leaf-400 transition-colors cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="w-16 h-16 bg-leaf-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-leaf-600" />
              </div>
              <p className="text-gray-600 font-medium">Upload crop photos</p>
              <p className="text-sm text-gray-400 mt-1">Click to select images (max 5)</p>
            </div>
          </label>

          {/* AI Scanner Button */}
          <button
            type="button"
            onClick={() => setShowAIScanner(true)}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-opacity shadow-lg"
          >
            <Sparkles className="w-6 h-6" />
            <div className="text-left">
              <p className="text-sm opacity-90">✨ NEW FEATURE</p>
              <p>AI Camera Scan - Auto-Fill Form</p>
            </div>
          </button>

          {/* Image Previews */}
          {imagePreviewUrls.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Crop Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Organic Tomatoes"
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input"
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Variety</label>
            <input
              type="text"
              name="variety"
              value={formData.variety}
              onChange={handleChange}
              placeholder="e.g., Roma, Cherry"
              className="input"
            />
          </div>

          <div>
            <label className="label">Quality Grade</label>
            <select
              name="quality"
              value={formData.quality}
              onChange={handleChange}
              className="input"
            >
              {qualities.map(q => (
                <option key={q} value={q}>{q.charAt(0).toUpperCase() + q.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="label">Price per kg (₹) *</label>
            <input
              type="number"
              name="pricePerKg"
              value={formData.pricePerKg}
              onChange={handleChange}
              placeholder="0.00"
              className="input"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="label">Available Quantity *</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="0"
              className="input"
              min="0"
              required
            />
          </div>

          <div>
            <label className="label">Unit</label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="input"
            >
              {units.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Harvest & Shelf Life */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Harvest Date *</label>
            <input
              type="date"
              name="harvestDate"
              value={formData.harvestDate}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Shelf Life (days)</label>
            <input
              type="number"
              name="shelfLife"
              value={formData.shelfLife}
              onChange={handleChange}
              className="input"
              min="1"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your crop, growing methods, etc."
            className="input min-h-[100px] resize-none"
            rows={4}
          />
        </div>

        {/* Organic Checkbox */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="isOrganic"
            checked={formData.isOrganic}
            onChange={handleChange}
            className="w-5 h-5 rounded border-gray-300 text-leaf-500 focus:ring-leaf-500"
          />
          <span className="text-gray-700">This is an organic product</span>
        </label>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/farmer/crops')}
            className="btn-ghost flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Sprout className="w-5 h-5" />
                Add Crop
              </>
            )}
          </button>
        </div>
      </motion.form>

      {/* AI Camera Scanner Modal */}
      <AnimatePresence>
        {showAIScanner && (
          <AICameraScan
            onCropDetected={handleAICropDetected}
            onClose={() => setShowAIScanner(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddCrop;
