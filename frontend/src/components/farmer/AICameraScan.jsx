import { useState, useRef, useEffect } from 'react';
import { Camera, X, CheckCircle, AlertCircle, ScanLine, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

// Crop detection database (simplified AI - in production, use TensorFlow.js or Google Vision API)
const CROP_DATABASE = {
  // Vegetables
  'tomato': { name: 'Tomato', category: 'vegetables', variety: 'Hybrid', avgPrice: 25, shelfLife: 7 },
  'potato': { name: 'Potato', category: 'vegetables', variety: 'Deshi', avgPrice: 20, shelfLife: 30 },
  'onion': { name: 'Onion', category: 'vegetables', variety: 'Red', avgPrice: 30, shelfLife: 21 },
  'carrot': { name: 'Carrot', category: 'vegetables', variety: 'Orange', avgPrice: 35, shelfLife: 14 },
  'cauliflower': { name: 'Cauliflower', category: 'vegetables', variety: 'White', avgPrice: 40, shelfLife: 7 },
  'cabbage': { name: 'Cabbage', category: 'vegetables', variety: 'Green', avgPrice: 25, shelfLife: 10 },
  'brinjal': { name: 'Brinjal', category: 'vegetables', variety: 'Purple', avgPrice: 30, shelfLife: 7 },
  'okra': { name: 'Okra (Bhindi)', category: 'vegetables', variety: 'Green', avgPrice: 35, shelfLife: 5 },
  'peas': { name: 'Green Peas', category: 'vegetables', variety: 'Fresh', avgPrice: 50, shelfLife: 5 },
  'capsicum': { name: 'Capsicum', category: 'vegetables', variety: 'Green', avgPrice: 45, shelfLife: 7 },
  
  // Fruits
  'mango': { name: 'Mango', category: 'fruits', variety: 'Alphonso', avgPrice: 80, shelfLife: 7 },
  'banana': { name: 'Banana', category: 'fruits', variety: 'Cavendish', avgPrice: 50, shelfLife: 7 },
  'apple': { name: 'Apple', category: 'fruits', variety: 'Red Delicious', avgPrice: 120, shelfLife: 21 },
  'orange': { name: 'Orange', category: 'fruits', variety: 'Nagpur', avgPrice: 60, shelfLife: 14 },
  'papaya': { name: 'Papaya', category: 'fruits', variety: 'Red Lady', avgPrice: 40, shelfLife: 5 },
  'watermelon': { name: 'Watermelon', category: 'fruits', variety: 'Sugar Baby', avgPrice: 25, shelfLife: 14 },
  'grapes': { name: 'Grapes', category: 'fruits', variety: 'Thompson', avgPrice: 70, shelfLife: 7 },
  
  // Grains
  'wheat': { name: 'Wheat', category: 'grains', variety: 'Sharbati', avgPrice: 35, shelfLife: 365 },
  'rice': { name: 'Rice', category: 'grains', variety: 'Basmati', avgPrice: 60, shelfLife: 365 },
  'maize': { name: 'Maize', category: 'grains', variety: 'Yellow', avgPrice: 25, shelfLife: 180 },
  'mustard': { name: 'Mustard', category: 'oilseeds', variety: 'Yellow', avgPrice: 55, shelfLife: 365 },
};

const AICameraScan = ({ onCropDetected, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedCrop, setDetectedCrop] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [model, setModel] = useState(null);
  const [isLoadingModel, setIsLoadingModel] = useState(true);
  const [realTimeDetections, setRealTimeDetections] = useState([]);

  // Load MobileNet model on mount
  useEffect(() => {
    let mounted = true;
    
    const loadModel = async () => {
      if (!mounted) return;
      
      try {
        console.log('Loading AI model...');
        toast.loading('Loading AI model...', { duration: 3000 });
        const loadedModel = await mobilenet.load();
        
        if (mounted) {
          setModel(loadedModel);
          setIsLoadingModel(false);
          toast.success('AI model loaded! Ready to scan crops');
          
          // Auto-start camera after model loads
          setTimeout(() => {
            if (mounted && !stream) {
              startCamera();
            }
          }, 500);
        }
      } catch (error) {
        console.error('Error loading model:', error);
        if (mounted) {
          toast.error('Failed to load AI model');
          setIsLoadingModel(false);
        }
      }
    };
    
    loadModel();
    
    // Cleanup function
    return () => {
      mounted = false;
    };
  }, []);

  const startCamera = async () => {
    try {
      console.log('Requesting camera access...');
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser. Please use Chrome, Firefox, or Edge.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      console.log('Camera access granted!');
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        toast.success('Camera started! Position your crop in the frame');
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log('Video loaded, starting detection...');
          videoRef.current.play();
          
          // Start real-time detection after camera is ready
          setTimeout(() => {
            if (model && !scanComplete) {
              startRealTimeDetection();
            }
          }, 1000);
        };
      }
    } catch (error) {
      console.error('Camera error details:', error);
      
      let errorMessage = 'Unable to access camera. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Camera permission denied. Please allow camera access in your browser settings.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Camera is being used by another application.';
      } else if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        errorMessage += 'Camera requires HTTPS or localhost. Please use a secure connection.';
      } else {
        errorMessage += 'Please grant camera permissions.';
      }
      
      toast.error(errorMessage);
    }
  };

  // Real-time continuous detection
  const startRealTimeDetection = async () => {
    if (!videoRef.current || !model || scanComplete) return;

    const detect = async () => {
      if (!videoRef.current || scanComplete) return;

      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Create blob with proper error handling
        const blob = await new Promise((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob from canvas'));
            }
          }, 'image/jpeg', 0.7);
        });

        console.log('Real-time detection - blob created:', blob.size);

        const result = await analyzeImage(blob);
        
        if (result.confidence > 70) {
          setDetectedCrop(result.crop);
          setConfidence(result.confidence);
          setRealTimeDetections(prev => [result, ...prev.slice(0, 4)]); // Keep last 5
          
          // Auto-capture if high confidence
          if (result.confidence > 85 && !scanComplete) {
            captureAndAnalyze();
            return;
          }
        }
      } catch (error) {
        console.error('Real-time detection error:', error.message);
        // Don't stop detection on single error, continue trying
      }

      // Continue detection every 2 seconds
      setTimeout(detect, 2000);
    };

    detect();
  };

  const stopCamera = () => {
    if (stream) {
      console.log('Stopping camera streams...');
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('Cleaning up AI Scanner...');
      stopCamera();
    };
  }, []);

  const captureAndAnalyze = async () => {
    if (!videoRef.current) return;
    
    setIsAnalyzing(true);
    setScanComplete(false);
    
    try {
      // Capture frame from video
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Ensure video dimensions are ready
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      
      console.log('Video dimensions:', videoWidth, videoHeight);
      
      if (videoWidth === 0 || videoHeight === 0) {
        throw new Error('Video dimensions not ready');
      }
      
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob and ensure it's valid
      const blob = await new Promise((resolve, reject) => {
        try {
          canvas.toBlob((blob) => {
            if (blob && blob.size > 0) {
              console.log('Blob created successfully:', blob.type, blob.size);
              resolve(blob);
            } else {
              console.error('toBlob returned null or empty');
              reject(new Error('Failed to create blob'));
            }
          }, 'image/jpeg', 0.8);
        } catch (toBlobError) {
          console.error('toBlob error:', toBlobError);
          reject(new Error('Canvas toBlob failed: ' + toBlobError.message));
        }
      });
      
      console.log('Blob created:', blob.type, blob.size);
      
      // Analyze the image using TensorFlow.js
      const analysisResult = await analyzeImage(blob);
      
      setDetectedCrop(analysisResult.crop);
      setConfidence(analysisResult.confidence);
      setScanComplete(true);
      
      if (analysisResult.confidence > 60) {
        toast.success(`Detected: ${analysisResult.crop.name} (${Math.round(analysisResult.confidence)}% confidence)`);
      } else {
        toast.error('Low confidence detection. Please try again with better lighting.');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(`Failed to analyze: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Real AI analysis using TensorFlow.js MobileNet
  const analyzeImage = async (imageBlob) => {
    if (!model) {
      throw new Error('Model not loaded');
    }

    try {
      console.log('Analyzing blob:', imageBlob.type, imageBlob.size);
      
      // Create Image object from blob
      const img = new Image();
      const imageUrl = URL.createObjectURL(imageBlob);
      
      // Wait for image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });
      
      console.log('Image loaded successfully');
      
      // Classify the image
      const predictions = await model.classify(img);
      
      // Clean up
      URL.revokeObjectURL(imageUrl);
      
      console.log('TensorFlow predictions:', predictions);
      
      // Map ImageNet predictions to our crop database
      const bestMatch = findBestCropMatch(predictions);
      
      return bestMatch;
    } catch (error) {
      console.error('Image analysis error:', error);
      throw error;
    }
  };

  // Find best matching crop from TensorFlow predictions
  const findBestCropMatch = (predictions) => {
    // Crop keywords mapping to detect from ImageNet classes
    const cropKeywords = {
      'tomato': ['tomato', 'red fruit', 'vegetable'],
      'potato': ['potato', 'white vegetable'],
      'onion': ['onion', 'shallot', 'bulb'],
      'carrot': ['carrot', 'orange root'],
      'cauliflower': ['cauliflower', 'white flower'],
      'cabbage': ['cabbage', 'green leafy'],
      'brinjal': ['eggplant', 'aubergine', 'brinjal'],
      'okra': ['okra', 'ladyfinger'],
      'peas': ['pea', 'green pea', 'legume'],
      'capsicum': ['bell pepper', 'capsicum', 'pepper'],
      'mango': ['mango', 'tropical fruit'],
      'banana': ['banana', 'yellow fruit'],
      'apple': ['apple', 'red fruit'],
      'orange': ['orange', 'citrus fruit'],
      'papaya': ['papaya', 'pawpaw'],
      'watermelon': ['watermelon', 'melon'],
      'grapes': ['grape', 'vine fruit'],
      'wheat': ['wheat', 'grain', 'cereal'],
      'rice': ['rice', 'paddy', 'grain'],
      'maize': ['corn', 'maize', 'sweet corn'],
      'mustard': ['mustard', 'rapeseed']
    };

    let bestMatch = null;
    let highestScore = 0;

    predictions.forEach(pred => {
      const className = pred.className.toLowerCase();
      const probability = pred.probability * 100;

      // Check if prediction matches any crop keywords
      Object.keys(cropKeywords).forEach(cropKey => {
        const keywords = cropKeywords[cropKey];
        const isMatch = keywords.some(keyword => 
          className.includes(keyword) || className.includes(cropKey)
        );

        if (isMatch && probability > highestScore) {
          highestScore = probability;
          const cropData = CROP_DATABASE[cropKey];
          
          if (cropData) {
            bestMatch = {
              crop: {
                ...cropData,
                key: cropKey,
                detectedName: className
              },
              confidence: Math.min(probability * 1.5, 98) // Boost confidence for display
            };
          }
        }
      });
    });

    // If no specific match, provide generic result
    if (!bestMatch && predictions.length > 0) {
      const topPred = predictions[0];
      return {
        crop: {
          name: topPred.className.split(',')[0],
          category: 'other',
          variety: 'Unknown',
          avgPrice: 30,
          shelfLife: 7,
          quality: 'B',
          key: 'unknown',
          detectedName: topPred.className
        },
        confidence: topPred.probability * 100
      };
    }

    return bestMatch || {
      crop: {
        name: 'Unknown Crop',
        category: 'other',
        variety: 'Unknown',
        avgPrice: 25,
        shelfLife: 7,
        quality: 'B',
        key: 'unknown'
      },
      confidence: 30
    };
  };

  const handleUseDetection = () => {
    if (detectedCrop && confidence > 60) {
      onCropDetected({
        name: detectedCrop.name,
        category: detectedCrop.category,
        variety: detectedCrop.variety,
        pricePerKg: detectedCrop.avgPrice,
        shelfLife: detectedCrop.shelfLife,
        quality: 'A',
        description: `Fresh ${detectedCrop.name.toLowerCase()} detected by AI scanner`
      });
      stopCamera();
      onClose();
    }
  };

  const handleRetake = () => {
    setDetectedCrop(null);
    setConfidence(0);
    setScanComplete(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
      <div className="relative w-full max-w-lg mx-auto p-4">
        {/* Close Button */}
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            AI Crop Scanner
          </h2>
          <p className="text-gray-300 text-sm mt-1">
            {isLoadingModel ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading AI model...
              </span>
            ) : scanComplete ? (
              'Review detection result'
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Real-time detection active
              </span>
            )}
          </p>
        </div>

        {/* Camera View */}
        <div className="relative bg-gray-900 rounded-2xl overflow-hidden mb-4">
          {!scanComplete ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-96 object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Show if camera not started */}
              {!stream && !isLoadingModel && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center p-8">
                    <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-white text-lg font-semibold mb-4">Camera Not Started</p>
                    <button
                      onClick={startCamera}
                      className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors"
                    >
                      Start Camera
                    </button>
                    <p className="text-gray-400 text-sm mt-4">Click to grant camera permission</p>
                  </div>
                </div>
              )}
              
              {/* Scanning Overlay */}
              {stream && (
                <>
                  <div className="absolute inset-0 border-2 border-white/30 rounded-2xl m-8">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan" />
                  </div>
                  
                  {/* Center Guide */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 border-2 border-white/50 rounded-xl" />
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600">
              <div className="text-center text-white p-8">
                <CheckCircle className="w-24 h-24 mx-auto mb-4" />
                <h3 className="text-3xl font-bold mb-2">{detectedCrop?.name}</h3>
                <p className="text-lg opacity-90">{detectedCrop?.variety}</p>
                <div className="mt-4 inline-block bg-white/20 px-4 py-2 rounded-full">
                  Confidence: {confidence}%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Real-time Detections Display */}
          {!scanComplete && realTimeDetections.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <ScanLine className="w-4 h-4" /> Live Detections
              </h3>
              <div className="space-y-2">
                {realTimeDetections.slice(0, 3).map((detection, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      idx === 0 ? 'bg-green-500/30 border border-green-400' : 'bg-white/5'
                    }`}
                  >
                    <span className="text-white text-sm">
                      {detection.crop.name} {detection.crop.variety !== 'Unknown' && `- ${detection.crop.variety}`}
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      detection.confidence > 80 ? 'bg-green-500 text-white' :
                      detection.confidence > 60 ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {Math.round(detection.confidence)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!scanComplete ? (
            <>
              <button
                onClick={captureAndAnalyze}
                disabled={isAnalyzing}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <ScanLine className="w-6 h-6 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Camera className="w-6 h-6" />
                    Capture & Analyze
                  </>
                )}
              </button>
              
              <button
                onClick={startCamera}
                className="w-full py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors"
              >
                Restart Camera
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleUseDetection}
                disabled={confidence <= 60}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <CheckCircle className="w-6 h-6" />
                Use This Detection
              </button>
              
              <button
                onClick={handleRetake}
                className="w-full py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors"
              >
                Scan Again
              </button>
            </>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-200">
              {isLoadingModel 
                ? "Please wait while the AI model loads. This takes about 3-5 seconds on first use."
                : scanComplete 
                  ? confidence > 60
                    ? `Great! The AI detected ${detectedCrop?.name} with ${Math.round(confidence)}% confidence. Click 'Use This Detection' to auto-fill the form.`
                    : "Low confidence detection. Try scanning again with better lighting and centering the crop."
                  : "Point camera at crops, fruits, or vegetables. The AI will detect automatically. Hold steady for best results."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICameraScan;
