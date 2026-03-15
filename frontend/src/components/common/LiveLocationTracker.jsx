import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Navigation, MapPin, Clock } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const LiveLocationTracker = ({ orderId, onClose }) => {
  const [location, setLocation] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [intervalId, setIntervalId] = useState(null);

  const startTracking = () => {
    if (navigator.geolocation) {
      setTracking(true);
      
      // Get initial location
      getCurrentLocation();
      
      // Set up continuous tracking
      const id = setInterval(getCurrentLocation, 10000); // Update every 10 seconds
      setIntervalId(id);
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const stopTracking = () => {
    setTracking(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        
        setLocation(coords);
        setLastUpdate(new Date());
        
        // Send location to backend using dedicated location endpoint
        try {
          await api.put(`/orders/${orderId}/location`, {
            liveLocation: {
              coordinates: [coords.longitude, coords.latitude]
            }
          });
          console.log('Location sent to server');
        } catch (error) {
          console.error('Failed to send location:', error);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Unable to get current location');
        setTracking(false);
      }
    );
  };

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 right-4 bg-white rounded-2xl shadow-2xl z-50 max-w-sm w-full border border-gray-200"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${tracking ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <h3 className="font-semibold text-text-700">Live Location Tracker</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-text-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-600">Status:</span>
            <span className={`text-sm font-medium ${tracking ? 'text-green-600' : 'text-gray-500'}`}>
              {tracking ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Last Update */}
          {lastUpdate && (
            <div className="flex items-center gap-2 text-sm text-text-600">
              <Clock className="w-4 h-4" />
              <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
            </div>
          )}

          {/* Coordinates */}
          {location && (
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary-600" />
                <span className="text-text-700 font-mono">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </span>
              </div>
              {location.accuracy && (
                <p className="text-xs text-text-500">
                  Accuracy: ±{Math.round(location.accuracy)}m
                </p>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
            {!tracking ? (
              <button
                onClick={startTracking}
                className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-2"
              >
                <Navigation className="w-4 h-4" />
                Start Tracking
              </button>
            ) : (
              <button
                onClick={stopTracking}
                className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm py-2"
              >
                Stop Tracking
              </button>
            )}
          </div>

          {/* Info */}
          <p className="text-xs text-text-500 text-center">
            Location updates every 10 seconds when active
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LiveLocationTracker;
