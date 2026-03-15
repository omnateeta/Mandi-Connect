import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Sprout, Edit2, Trash2, Eye } from 'lucide-react';
import api from '../../services/api';
import { useLanguage } from '../../components/common/LanguageToggle';

const Crops = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      const response = await api.get('/farmers/crops');
      setCrops(response.data.data.crops);
    } catch (error) {
      console.error('Failed to fetch crops:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('Are you sure you want to delete this crop?'))) return;
    
    try {
      await api.delete(`/crops/${id}`);
      setCrops(crops.filter(c => c._id !== id));
    } catch (error) {
      console.error('Failed to delete crop:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('My Crops')}</h1>
          <p className="text-gray-600 mt-1">{t('Manage your crop listings')}</p>
        </div>
        <Link to="/farmer/crops/add" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-5 h-5" />
          {t('Add Crop')}
        </Link>
      </div>

      {/* Crops Grid */}
      {crops.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sprout className="w-10 h-10 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('No crops yet')}</h3>
          <p className="text-gray-500 mb-6">{t('Start by adding your first crop listing')}</p>
          <Link to="/farmer/crops/add" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t('Add Your First Crop')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.map((crop) => (
            <motion.div
              key={crop._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card overflow-hidden"
            >
              {/* Image */}
              <div className="h-48 bg-gray-100 relative">
                {crop.images?.[0] ? (
                  <img
                    src={crop.images[0].url}
                    alt={crop.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Sprout className="w-16 h-16 text-gray-300" />
                  </div>
                )}
                <span className={`absolute top-3 right-3 badge ${
                  crop.isAvailable ? 'badge-success' : 'badge-error'
                }`}>
                  {crop.isAvailable ? t('Available') : t('Unavailable')}
                </span>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">{crop.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{crop.category}</p>
                  </div>
                  <p className="text-lg font-bold text-leaf-600">₹{crop.pricePerKg}/kg</p>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span>{t('Stock')}: {crop.quantity} {crop.unit}</span>
                  <span>•</span>
                  <span>{t('Quality')}: {crop.quality}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigate(`/farmer/crops/${crop._id}`)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    {t('View')}
                  </button>
                  <button 
                    onClick={() => navigate(`/farmer/crops/${crop._id}/edit`)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-leaf-100 text-leaf-700 hover:bg-leaf-200 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    {t('Edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(crop._id)}
                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Crops;
