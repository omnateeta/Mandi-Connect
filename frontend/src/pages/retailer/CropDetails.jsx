import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Star, Sprout, Minus, Plus, ShoppingCart, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import api from '../../services/api';

const CropDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(10);

  useEffect(() => {
    fetchCropDetails();
  }, [id]);

  const fetchCropDetails = async () => {
    try {
      const response = await api.get(`/crops/${id}`);
      setCrop(response.data.data.crop);
    } catch (error) {
      console.error('Failed to fetch crop:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    dispatch(addToCart({
      cropId: id,
      name: crop.name,
      price: crop.pricePerKg,
      image: crop.images?.[0]?.url || null,
      farmName: crop.farmerId?.farmName || 'Unknown Farm',
      quantity
    }));
    toast.success(`Added ${quantity}kg of ${crop.name} to cart!`);
  };

  const handleOrderNow = async () => {
    try {
      await api.post('/orders', {
        items: [{ cropId: id, quantity }],
        deliveryAddress: 'Delivery address will be collected at checkout',
        deliveryType: 'farmer_delivery'
      });
      toast.success('Order placed successfully!');
      navigate('/retailer/orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
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
        <Sprout className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">Crop not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/retailer/marketplace')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Marketplace
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card overflow-hidden"
        >
          <div className="h-96 bg-gray-100">
            {crop.images?.[0] ? (
              <img
                src={crop.images[0].url}
                alt={crop.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Sprout className="w-24 h-24 text-gray-300" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{crop.name}</h1>
                <p className="text-gray-500 capitalize mt-1">{crop.category}</p>
              </div>
              <button className="p-2 rounded-xl hover:bg-gray-100">
                <Heart className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-harvest-500 fill-current" />
                <span className="font-medium">{crop.farmerId?.trustScore || 0}</span>
                <span className="text-gray-400">Trust Score</span>
              </div>
              {crop.isOrganic && (
                <span className="badge badge-success">Organic</span>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-leaf-600">₹{crop.pricePerKg}</span>
            <span className="text-gray-500">/ kg</span>
          </div>

          {/* Farmer Info */}
          <div className="card p-4 bg-gray-50">
            <p className="text-sm text-gray-500 mb-2">Sold by</p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-leaf-100 rounded-full flex items-center justify-center">
                <Sprout className="w-6 h-6 text-leaf-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{crop.farmerId?.farmName}</p>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  {crop.farmerId?.district}, {crop.farmerId?.state}
                </div>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div>
            <label className="label">Quantity (kg)</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(crop.minOrderQuantity, quantity - 5))}
                className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="text-2xl font-bold w-16 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(crop.quantity, quantity + 5))}
                className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Minimum order: {crop.minOrderQuantity}kg • Available: {crop.quantity}kg
            </p>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between py-4 border-t border-gray-100">
            <span className="text-gray-600">Total Amount</span>
            <span className="text-2xl font-bold text-gray-800">₹{crop.pricePerKg * quantity}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              className="btn-outline flex-1 gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
            <button
              onClick={handleOrderNow}
              className="btn-primary flex-1"
            >
              Order Now
            </button>
          </div>

          {/* Description */}
          {crop.description && (
            <div className="pt-6 border-t border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-600">{crop.description}</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CropDetails;
