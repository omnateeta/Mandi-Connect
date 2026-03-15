import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit2, Sprout, Calendar, Package, DollarSign, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ViewCrop = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCrop();
  }, [id]);

  const fetchCrop = async () => {
    try {
      const response = await api.get(`/crops/${id}`);
      setCrop(response.data.data.crop);
    } catch (error) {
      toast.error('Failed to fetch crop details');
      navigate('/farmer/crops');
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

  if (!crop) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Crop not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/farmer/crops')}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">{crop.name}</h1>
          <p className="text-gray-600 capitalize">{crop.category}</p>
        </div>
        <button
          onClick={() => navigate(`/farmer/crops/${id}/edit`)}
          className="btn-primary flex items-center gap-2"
        >
          <Edit2 className="w-5 h-5" />
          Edit Crop
        </button>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        {/* Image Gallery */}
        {crop.images?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-gray-50">
            {crop.images.map((image, index) => (
              <img
                key={index}
                src={image.url}
                alt={`${crop.name} ${index + 1}`}
                className="w-full h-48 object-cover rounded-xl"
              />
            ))}
          </div>
        ) : (
          <div className="h-64 bg-gray-100 flex items-center justify-center">
            <Sprout className="w-20 h-20 text-gray-300" />
          </div>
        )}

        {/* Details */}
        <div className="p-6 space-y-6">
          {/* Price & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-leaf-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-leaf-600 mb-1">
                <DollarSign className="w-5 h-5" />
                <span className="font-medium">Price</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">₹{crop.pricePerKg}/kg</p>
            </div>
            <div className="bg-sky-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-sky-600 mb-1">
                <Package className="w-5 h-5" />
                <span className="font-medium">Stock</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{crop.quantity} {crop.unit}</p>
            </div>
            <div className="bg-harvest-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-harvest-600 mb-1">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Harvest Date</span>
              </div>
              <p className="text-lg font-bold text-gray-800">
                {new Date(crop.harvestDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Quality & Grade</h3>
              <p className="text-gray-600 capitalize">{crop.quality} • {crop.qualityGrade}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Category</h3>
              <p className="text-gray-600 capitalize">{crop.category}</p>
            </div>
            {crop.variety && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Variety</h3>
                <p className="text-gray-600">{crop.variety}</p>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Shelf Life</h3>
              <p className="text-gray-600">{crop.shelfLife} days</p>
            </div>
          </div>

          {/* Description */}
          {crop.description && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-600">{crop.description}</p>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center gap-4 pt-4 border-t">
            <span className={`badge ${crop.isAvailable ? 'badge-success' : 'badge-error'}`}>
              {crop.isAvailable ? 'Available' : 'Unavailable'}
            </span>
            {crop.isOrganic && (
              <span className="badge badge-success">Organic</span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ViewCrop;
