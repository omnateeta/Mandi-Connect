import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Star, Sprout, SlidersHorizontal } from 'lucide-react';
import api from '../../services/api';

const categories = [
  { id: 'all', name: 'All', icon: '🌾' },
  { id: 'vegetables', name: 'Vegetables', icon: '🥬' },
  { id: 'fruits', name: 'Fruits', icon: '🍎' },
  { id: 'grains', name: 'Grains', icon: '🌾' },
  { id: 'pulses', name: 'Pulses', icon: '🫘' },
  { id: 'spices', name: 'Spices', icon: '🌶️' },
];

const Marketplace = () => {
  const [searchParams] = useSearchParams();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCrops();
  }, [selectedCategory]);

  // Update search query when URL parameter changes
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  const fetchCrops = async () => {
    try {
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      
      const response = await api.get('/crops', { params });
      setCrops(response.data.data.crops);
    } catch (error) {
      console.error('Failed to fetch crops:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCrops = crops.filter(crop =>
    crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crop.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Marketplace</h1>
        <p className="text-gray-600 mt-1">Fresh produce directly from farmers</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crops, vegetables, fruits..."
            className="input pl-12 w-full"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-outline flex items-center gap-2"
        >
          <SlidersHorizontal className="w-5 h-5" />
          Filters
        </button>
      </div>

      {/* Categories */}
      <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-leaf-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>{cat.icon}</span>
            <span className="font-medium">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Crops Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leaf-500"></div>
        </div>
      ) : filteredCrops.length === 0 ? (
        <div className="card p-12 text-center">
          <Sprout className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No crops found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCrops.map((crop) => (
            <motion.div
              key={crop._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="card overflow-hidden group cursor-pointer"
            >
              <Link to={`/retailer/crop/${crop._id}`}>
                {/* Image */}
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  {crop.images?.[0] ? (
                    <img
                      src={crop.images[0].url}
                      alt={crop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Sprout className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  {crop.isOrganic && (
                    <span className="absolute top-3 left-3 badge badge-success">
                      Organic
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800 group-hover:text-leaf-600 transition-colors">
                        {crop.name}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">{crop.category}</p>
                    </div>
                    <p className="text-lg font-bold text-leaf-600">₹{crop.pricePerKg}</p>
                  </div>

                  {/* Farmer Info */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{crop.farmerId?.district}</span>
                  </div>

                  {/* Rating & Stock */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-harvest-500 fill-current" />
                      <span className="text-sm font-medium text-gray-700">
                        {crop.farmerId?.trustScore || 0}
                      </span>
                      <span className="text-xs text-gray-400">Trust</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {crop.quantity} {crop.unit} available
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
