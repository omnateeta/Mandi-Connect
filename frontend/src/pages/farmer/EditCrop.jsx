import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Sprout } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const categories = [
  'vegetables', 'fruits', 'grains', 'pulses', 'spices', 
  'oilseeds', 'fibers', 'flowers', 'dairy', 'other'
];

const qualities = ['A', 'B', 'C', 'premium', 'standard', 'economy'];
const units = ['kg', 'quintal', 'ton', 'dozen', 'piece'];

const EditCrop = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
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
    isAvailable: true,
  });

  useEffect(() => {
    fetchCrop();
  }, [id]);

  const fetchCrop = async () => {
    try {
      const response = await api.get(`/crops/${id}`);
      const crop = response.data.data.crop;
      setFormData({
        name: crop.name,
        category: crop.category,
        variety: crop.variety || '',
        pricePerKg: crop.pricePerKg,
        quantity: crop.quantity,
        unit: crop.unit,
        quality: crop.quality,
        harvestDate: crop.harvestDate?.split('T')[0] || '',
        shelfLife: crop.shelfLife,
        description: crop.description || '',
        minOrderQuantity: crop.minOrderQuantity,
        isOrganic: crop.isOrganic,
        isAvailable: crop.isAvailable,
      });
    } catch (error) {
      toast.error('Failed to fetch crop details');
      navigate('/farmer/crops');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.put(`/crops/${id}`, {
        ...formData,
        pricePerKg: parseFloat(formData.pricePerKg),
        quantity: parseFloat(formData.quantity),
      });
      
      toast.success('Crop updated successfully!');
      navigate('/farmer/crops');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update crop');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leaf-500"></div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-800">Edit Crop</h1>
          <p className="text-gray-600">Update your crop listing</p>
        </div>
      </div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="card p-6 space-y-6"
      >
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

        {/* Checkboxes */}
        <div className="flex flex-col gap-3">
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
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="w-5 h-5 rounded border-gray-300 text-leaf-500 focus:ring-leaf-500"
            />
            <span className="text-gray-700">Available for sale</span>
          </label>
        </div>

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
                Updating...
              </>
            ) : (
              <>
                <Sprout className="w-5 h-5" />
                Update Crop
              </>
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default EditCrop;
