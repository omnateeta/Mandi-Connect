import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Warehouse, Thermometer, Factory, Tractor, Navigation, X, Phone, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import { useLanguage } from '../common/LanguageToggle';
import useGoogleTranslateRefresh from '../../hooks/useGoogleTranslateRefresh';

const locationTypes = {
  mandi: { 
    icon: MapPin, 
    color: 'text-primary-600', 
    bg: 'bg-primary-100',
    label: 'Mandi (Market)',
    translateKey: 'Mandi (Market)'
  },
  warehouse: { 
    icon: Warehouse, 
    color: 'text-blue-600', 
    bg: 'bg-blue-100',
    label: 'Warehouse',
    translateKey: 'Warehouse'
  },
  coldStorage: { 
    icon: Thermometer, 
    color: 'text-cyan-600', 
    bg: 'bg-cyan-100',
    label: 'Cold Storage',
    translateKey: 'Cold Storage'
  },
  processing: { 
    icon: Factory, 
    color: 'text-purple-600', 
    bg: 'bg-purple-100',
    label: 'Processing Center',
    translateKey: 'Processing Center'
  },
  equipment: { 
    icon: Tractor, 
    color: 'text-orange-600', 
    bg: 'bg-orange-100',
    label: 'Equipment Rental',
    translateKey: 'Equipment Rental'
  }
};

// Mock data - In production, this would come from an API
const mockLocations = [
  {
    id: 1,
    name: 'Krishi Utpadan Mandi Samiti',
    type: 'mandi',
    distance: '12 km',
    rating: 4.5,
    address: 'NH-7, 15 km from city center',
    timings: '6:00 AM - 6:00 PM',
    specialties: ['Wheat', 'Rice', 'Vegetables'],
    coordinates: { lat: 28.7041, lng: 77.1025 }
  },
  {
    id: 2,
    name: 'Central Warehousing Corporation',
    type: 'warehouse',
    distance: '8 km',
    rating: 4.3,
    address: 'Industrial Area, Phase 2',
    timings: '24/7',
    capacity: '5000 tons',
    coordinates: { lat: 28.7041, lng: 77.1025 }
  },
  {
    id: 3,
    name: 'Snowman Cold Storage',
    type: 'coldStorage',
    distance: '15 km',
    rating: 4.7,
    address: 'Village Ramnagar',
    timings: '24/7',
    temperature: '-2°C to 8°C',
    specialties: ['Potatoes', 'Onions', 'Fruits'],
    coordinates: { lat: 28.7041, lng: 77.1025 }
  },
  {
    id: 4,
    name: 'Agro Processing Hub',
    type: 'processing',
    distance: '20 km',
    rating: 4.4,
    address: 'Food Park, Sector 25',
    timings: '8:00 AM - 8:00 PM',
    services: ['Grinding', 'Packaging', 'Sorting'],
    coordinates: { lat: 28.7041, lng: 77.1025 }
  },
  {
    id: 5,
    name: 'Kisan Equipment Rentals',
    type: 'equipment',
    distance: '5 km',
    rating: 4.6,
    address: 'Main Market Road',
    timings: '7:00 AM - 9:00 PM',
    equipment: ['Tractors', 'Harvesters', 'Sprayers'],
    coordinates: { lat: 28.7041, lng: 77.1025 }
  },
  {
    id: 6,
    name: 'Modern Mandi Complex',
    type: 'mandi',
    distance: '18 km',
    rating: 4.8,
    address: 'Highway 44, Near Toll Plaza',
    timings: '5:00 AM - 8:00 PM',
    specialties: ['Organic Produce', 'Spices', 'Pulses'],
    coordinates: { lat: 28.7041, lng: 77.1025 }
  }
];

const NearbyLocations = () => {
  const { t } = useLanguage();
  const [locations, setLocations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentCity, setCurrentCity] = useState('Your Location');

  // Force Google Translate to refresh when locations load
  useGoogleTranslateRefresh([locations, filter]);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userLoc);
          
          // Get city name from coordinates (reverse geocoding approximation)
          const cityName = getCityNameFromCoordinates(userLoc);
          setCurrentCity(cityName);
          
          await fetchNearbyLocations(userLoc);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use default location (Delhi) as fallback
          const defaultLoc = { lat: 28.7041, lng: 77.1025 };
          setUserLocation(defaultLoc);
          setCurrentCity('Delhi Area');
          fetchNearbyLocations(defaultLoc);
        }
      );
    } else {
      const defaultLoc = { lat: 28.7041, lng: 77.1025 };
      setUserLocation(defaultLoc);
      setCurrentCity('Delhi Area');
      fetchNearbyLocations(defaultLoc);
    }
  };

  const getCityNameFromCoordinates = (loc) => {
    // Approximate city names based on coordinates
    const cities = [
      { name: 'Delhi', lat: 28.7041, lng: 77.1025, range: 1.0 },
      { name: 'Mumbai', lat: 19.0760, lng: 72.8777, range: 1.0 },
      { name: 'Bangalore', lat: 12.9716, lng: 77.5946, range: 1.0 },
      { name: 'Chennai', lat: 13.0827, lng: 80.2707, range: 1.0 },
      { name: 'Kolkata', lat: 22.5726, lng: 88.3639, range: 1.0 },
      { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, range: 1.0 },
      { name: 'Pune', lat: 18.5204, lng: 73.8567, range: 1.0 },
      { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, range: 1.0 },
      { name: 'Jaipur', lat: 26.9124, lng: 75.7873, range: 1.0 }
    ];
    
    for (const city of cities) {
      const dist = calculateDistance(loc, { lat: city.lat, lng: city.lng });
      if (dist < city.range) {
        return `${city.name} Area`;
      }
    }
    
    // If no major city found, show coordinates
    return `Lat: ${loc.lat.toFixed(2)}, Lng: ${loc.lng.toFixed(2)}`;
  };

  const fetchNearbyLocations = async (location) => {
    try {
      setLoading(true);
      // Try to fetch from backend API with smaller radius (25km instead of 50km)
      try {
        const response = await api.get(`/locations/nearby?lat=${location.lat}&lng=${location.lng}&radius=25`);
        // Filter out anything beyond 25km
        const filteredData = (response.data.data || []).filter(loc => {
          const dist = parseFloat(loc.distance);
          return dist <= 25;
        });
        setLocations(filteredData);
      } catch (apiError) {
        // If API fails, use mock data with calculated distances
        const locationsWithDistance = mockLocations.map(loc => ({
          ...loc,
          distance: calculateDistance(location, loc.coordinates)
        })).filter(loc => {
          const dist = parseFloat(loc.distance);
          return dist <= 25; // Only show within 25km
        }).sort((a, b) => a.distance - b.distance);
        setLocations(locationsWithDistance);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      setLoading(false);
    }
  };

  const calculateDistance = (userLoc, locationLoc) => {
    // Haversine formula to calculate distance between two coordinates
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(locationLoc.lat - userLoc.lat);
    const dLng = deg2rad(locationLoc.lng - userLoc.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(userLoc.lat)) * Math.cos(deg2rad(locationLoc.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return `${distance.toFixed(1)} km`;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const handleViewMap = () => {
    if (userLocation) {
      setShowMapModal(true);
    } else {
      toast.info('Getting your location...');
      getUserLocation();
    }
  };

  const handleGetDirections = (location) => {
    setSelectedLocation(location);
    // Open Google Maps with directions
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.lat},${location.coordinates.lng}`;
    window.open(mapsUrl, '_blank');
  };

  const filteredLocations = filter === 'all' 
    ? locations 
    : locations.filter(loc => loc.type === filter);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-700">{t('Nearby Agriculture Locations')}</h2>
            <p className="text-sm text-text-600 mt-1">Discover mandis, warehouses & more near you</p>
          </div>
          <button className="btn-primary text-sm flex items-center gap-2" onClick={handleViewMap}>
            <Navigation className="w-4 h-4" />
            View Map
          </button>
        </div>
        
        {/* Location Badge */}
        {userLocation && (
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border-l-4 border-primary-500 px-4 py-3 rounded-lg">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-text-700">Showing locations near: {currentCity}</h3>
                <div className="flex items-center gap-4 mt-1 text-xs text-text-600">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Your coordinates: {userLocation.lat.toFixed(3)}, {userLocation.lng.toFixed(3)}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                    Search radius: 25 km
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'all'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-text-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {Object.entries(locationTypes).map(([type, config]) => {
          const Icon = config.icon;
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                filter === type
                  ? `${config.bg} ${config.color}`
                  : 'bg-gray-100 text-text-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t(config.label)}
            </button>
          );
        })}
      </div>

      {/* Locations Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredLocations.length === 0 ? (
        <div className="card p-12 text-center">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-text-700 mb-2">No locations found</h3>
          <p className="text-text-600">Try selecting a different category or expand your search radius</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Group by type */}
          {Object.entries(locationTypes).map(([type, config]) => {
            const typeLocations = filteredLocations.filter(loc => loc.type === type);
            if (typeLocations.length === 0) return null;
            
            const Icon = config.icon;
            return (
              <div key={type} className="space-y-3">
                {/* Category Header */}
                <div className="flex items-center gap-3 pb-2 border-b-2 border-primary-200">
                  <div className={`w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-text-700">{t(config.label)}</h3>
                    <p className="text-xs text-text-500">{typeLocations.length} location{typeLocations.length !== 1 ? 's' : ''} nearby</p>
                  </div>
                </div>
                
                {/* Location Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {typeLocations.map((location, index) => (
                    <motion.div
                      key={location.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="card p-4 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleGetDirections(location)}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-12 h-12 ${config.bg} rounded-xl flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 ${config.color}`} />
                        </div>
                        <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
                          <span className="text-green-600 text-sm font-semibold">★</span>
                          <span className="text-sm font-medium text-text-700">{location.rating}</span>
                        </div>
                      </div>

                      {/* Name & Distance */}
                      <h3 className="font-semibold text-text-700 mb-2">{location.name}</h3>
                      
                      <div className="flex items-center gap-2 text-sm text-text-600 mb-3">
                        <MapPin className="w-4 h-4 text-primary-500" />
                        <span className="font-medium text-primary-600">{location.distance}</span>
                        <span>•</span>
                        <span className="line-clamp-1">{location.address}</span>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-sm text-text-600">
                        <p className="text-xs">🕐 {location.timings}</p>
                        
                        {/* Specialties/Capacity */}
                        {(location.specialties || location.capacity || location.equipment || location.services) && (
                          <div className="pt-2 border-t border-gray-100">
                            {location.specialties && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {location.specialties.slice(0, 3).map((spec, idx) => (
                                  <span key={idx} className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded">
                                    {spec}
                                  </span>
                                ))}
                              </div>
                            )}
                            {location.capacity && (
                              <p className="text-xs">📦 Capacity: {location.capacity}</p>
                            )}
                            {location.equipment && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {location.equipment.slice(0, 2).map((eq, idx) => (
                                  <span key={idx} className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded">
                                    {eq}
                                  </span>
                                ))}
                              </div>
                            )}
                            {location.services && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {location.services.slice(0, 2).map((svc, idx) => (
                                  <span key={idx} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                                    {svc}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <button 
                        className="btn-outline w-full mt-4 text-sm py-2 hover:bg-primary-50 hover:border-primary-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGetDirections(location);
                        }}
                      >
                        Get Directions
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredLocations.length === 0 && (
        <div className="card p-12 text-center">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-text-700 mb-2">No locations found</h3>
          <p className="text-text-600">Try selecting a different category</p>
        </div>
      )}

      {/* Map Modal */}
      <AnimatePresence>
        {showMapModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowMapModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-xl font-bold text-text-700">Nearby Locations Map</h2>
                <button
                  onClick={() => setShowMapModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-text-600" />
                </button>
              </div>

              {/* Map Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {userLocation ? (
                  <div className="space-y-4">
                    {/* Your Location */}
                    <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl border border-primary-200">
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-text-700">Your Location</h3>
                        <p className="text-sm text-text-600">
                          {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>

                    {/* Nearby Locations List */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-text-700 mb-3">Nearby Agriculture Locations</h3>
                      {filteredLocations.slice(0, 5).map((location, idx) => (
                        <div
                          key={location.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => handleGetDirections(location)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 ${locationTypes[location.type].bg} rounded-lg flex items-center justify-center`}>
                              {(() => {
                                const Icon = locationTypes[location.type].icon;
                                return <Icon className={`w-4 h-4 ${locationTypes[location.type].color}`} />;
                              })()}
                            </div>
                            <div>
                              <p className="font-medium text-text-700 text-sm">{location.name}</p>
                              <p className="text-xs text-text-500">{location.distance} • {location.address}</p>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-text-400" />
                        </div>
                      ))}
                    </div>

                    {/* Open in Google Maps */}
                    <a
                      href={`https://www.google.com/maps/search/agriculture+locations/@${userLocation.lat},${userLocation.lng},12z`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Full Map in Google Maps
                    </a>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-text-600">Getting your location...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NearbyLocations;
