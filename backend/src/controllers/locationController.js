import { logger } from '../utils/logger.js';

// Mock database of agriculture locations across India (clustered around major cities)
const agricultureLocations = [
  // Delhi NCR Locations
  {
    _id: '1',
    name: 'Krishi Utpadan Mandi Samiti',
    type: 'mandi',
    coordinates: { lat: 28.7041, lng: 77.1025 },
    address: 'NH-7, Delhi',
    timings: '6:00 AM - 6:00 PM',
    rating: 4.5,
    specialties: ['Wheat', 'Rice', 'Vegetables'],
    phone: '+91-11-23456789'
  },
  {
    _id: '9',
    name: 'Azadpur Vegetable Mandi',
    type: 'mandi',
    coordinates: { lat: 28.7233, lng: 77.1394 },
    address: 'Azadpur, Delhi',
    timings: '5:00 AM - 7:00 PM',
    rating: 4.7,
    specialties: ['Vegetables', 'Fruits'],
    phone: '+91-11-27456123'
  },
  {
    _id: '10',
    name: 'Narela Agro Warehouse',
    type: 'warehouse',
    coordinates: { lat: 28.8519, lng: 77.0922 },
    address: 'Narela Industrial Area, Delhi',
    timings: '24/7',
    rating: 4.2,
    capacity: '3000 tons',
    phone: '+91-11-27891234'
  },
  
  // Mumbai Locations
  {
    _id: '2',
    name: 'Vashi Agricultural Market',
    type: 'mandi',
    coordinates: { lat: 19.0760, lng: 72.8777 },
    address: 'Vashi, Navi Mumbai',
    timings: '6:00 AM - 8:00 PM',
    rating: 4.4,
    specialties: ['Vegetables', 'Spices'],
    phone: '+91-22-27891234'
  },
  {
    _id: '11',
    name: 'Thane Cold Storage',
    type: 'coldStorage',
    coordinates: { lat: 19.2183, lng: 72.9781 },
    address: 'Thane, Maharashtra',
    timings: '24/7',
    rating: 4.6,
    temperature: '2°C to 8°C',
    specialties: ['Dairy', 'Vegetables'],
    phone: '+91-22-25123456'
  },
  
  // Bangalore Locations
  {
    _id: '3',
    name: 'Yeshwantpur APMC Market',
    type: 'mandi',
    coordinates: { lat: 12.9716, lng: 77.5946 },
    address: 'Yeshwantpur, Bangalore',
    timings: '6:00 AM - 6:00 PM',
    rating: 4.5,
    specialties: ['Vegetables', 'Fruits', 'Flowers'],
    phone: '+91-80-23456789'
  },
  {
    _id: '12',
    name: 'Whitefield Warehousing',
    type: 'warehouse',
    coordinates: { lat: 12.9698, lng: 77.7499 },
    address: 'Whitefield, Bangalore',
    timings: '24/7',
    rating: 4.3,
    capacity: '2500 tons',
    phone: '+91-80-28123456'
  },
  
  // Hyderabad Locations
  {
    _id: '4',
    name: 'Gudimalkapur Market Yard',
    type: 'mandi',
    coordinates: { lat: 17.3850, lng: 78.4867 },
    address: 'Gudimalkapur, Hyderabad',
    timings: '5:00 AM - 7:00 PM',
    rating: 4.6,
    specialties: ['Chillies', 'Cotton', 'Paddy'],
    phone: '+91-40-24123456'
  },
  
  // Chennai Locations
  {
    _id: '13',
    name: 'Koyambedu Market',
    type: 'mandi',
    coordinates: { lat: 13.0827, lng: 80.2707 },
    address: 'Koyambedu, Chennai',
    timings: '5:00 AM - 8:00 PM',
    rating: 4.7,
    specialties: ['Vegetables', 'Fruits'],
    phone: '+91-44-23456789'
  },
  {
    _id: '14',
    name: 'Ambattur Cold Chain',
    type: 'coldStorage',
    coordinates: { lat: 13.1143, lng: 80.1548 },
    address: 'Ambattur, Chennai',
    timings: '24/7',
    rating: 4.4,
    temperature: '0°C to 5°C',
    specialties: ['Fish', 'Meat'],
    phone: '+91-44-26123456'
  },
  
  // Kolkata Locations
  {
    _id: '15',
    name: 'Sealdah Market',
    type: 'mandi',
    coordinates: { lat: 22.5726, lng: 88.3639 },
    address: 'Sealdah, Kolkata',
    timings: '5:00 AM - 9:00 PM',
    rating: 4.5,
    specialties: ['Vegetables', 'Fruits'],
    phone: '+91-33-22123456'
  },
  
  // Pune Locations
  {
    _id: '16',
    name: 'Pune APMC Market',
    type: 'mandi',
    coordinates: { lat: 18.5204, lng: 73.8567 },
    address: 'Pune-Solapur Road, Pune',
    timings: '6:00 AM - 7:00 PM',
    rating: 4.6,
    specialties: ['Vegetables', 'Fruits', 'Grains'],
    phone: '+91-20-26123456'
  },
  {
    _id: '17',
    name: 'Hinjewadi Cold Storage',
    type: 'coldStorage',
    coordinates: { lat: 18.5912, lng: 73.7389 },
    address: 'Hinjewadi, Pune',
    timings: '24/7',
    rating: 4.5,
    temperature: '-2°C to 10°C',
    specialties: ['Potatoes', 'Onions'],
    phone: '+91-20-27123456'
  },
  
  // Ahmedabad Locations
  {
    _id: '5',
    name: 'Ahmedabad Market Yard',
    type: 'mandi',
    coordinates: { lat: 23.0225, lng: 72.5714 },
    address: 'Kalupur, Ahmedabad',
    timings: '6:00 AM - 8:00 PM',
    rating: 4.5,
    specialties: ['Cotton', 'Groundnut', 'Spices'],
    phone: '+91-79-25123456'
  },
  
  // Jaipur Locations
  {
    _id: '6',
    name: 'Jaipur Krishi Mandi',
    type: 'mandi',
    coordinates: { lat: 26.9124, lng: 75.7873 },
    address: 'Tonk Road, Jaipur',
    timings: '6:00 AM - 7:00 PM',
    rating: 4.6,
    specialties: ['Mustard', 'Wheat', 'Gram'],
    phone: '+91-141-2345678'
  }
];

// @desc    Get nearby agriculture locations
// @route   GET /api/v1/locations/nearby
// @access  Public
export const getNearbyLocations = async (req, res) => {
  try {
    const { lat, lng, radius = 25, type } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const searchRadius = parseFloat(radius);

    logger.info(`Searching for locations within ${searchRadius}km of (${userLat}, ${userLng})`);

    // Filter locations within radius using Haversine formula
    const nearbyLocations = agricultureLocations.filter(location => {
      // Type filter
      if (type && location.type !== type) return false;

      // Calculate distance
      const distance = calculateDistance(
        userLat,
        userLng,
        location.coordinates.lat,
        location.coordinates.lng
      );

      // Add distance to location object
      location.distance = `${distance.toFixed(1)} km`;
      
      // Only return if within search radius
      return distance <= searchRadius;
    });

    // Sort by distance (nearest first)
    nearbyLocations.sort((a, b) => {
      const distA = parseFloat(a.distance);
      const distB = parseFloat(b.distance);
      return distA - distB;
    });

    logger.info(`Found ${nearbyLocations.length} locations within ${searchRadius}km`);

    res.status(200).json({
      success: true,
      count: nearbyLocations.length,
      data: nearbyLocations
    });
  } catch (error) {
    logger.error(`Get nearby locations error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby locations'
    });
  }
};

// Helper function to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};
