import { validationResult } from 'express-validator';
import { Crop, Farmer } from '../models/index.js';
import { logger } from '../utils/logger.js';
import { uploadImage } from '../config/cloudinary.js';
import fs from 'fs';

// @desc    Create new crop listing
// @route   POST /api/v1/crops
// @access  Private (Farmer only)
export const createCrop = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Get user ID from token (handle both id and _id)
    const userId = req.user.id || req.user._id;
    
    let farmer = await Farmer.findOne({ userId: userId });
    
    // Auto-create farmer profile if not exists
    if (!farmer) {
      farmer = await Farmer.create({
        userId: userId,
        farmName: `${req.user.name}'s Farm`,
        location: {
          type: 'Point',
          coordinates: [0, 0]
        },
        address: 'Not provided',
        district: 'Not provided',
        state: 'Not provided',
        pincode: '000000',
        landSize: 0,
        landUnit: 'acres',
        primaryCrops: [],
        farmingType: 'conventional',
        kycStatus: 'pending',
        trustScore: 50,
        trustMetrics: {
          orderFulfillmentRate: 0,
          qualityRating: 0,
          deliveryPunctuality: 0,
          responseTime: 0,
          totalOrders: 0,
          completedOrders: 0,
          cancelledOrders: 0
        },
        rating: {
          average: 0,
          count: 0
        },
        isAvailable: true,
        workingHours: {
          start: '06:00',
          end: '18:00'
        }
      });
      logger.info(`Auto-created farmer profile for user ${userId}`);
    }

    // Parse dates and calculate expiryDate
    const harvestDate = new Date(req.body.harvestDate);
    const shelfLife = parseInt(req.body.shelfLife) || 7;
    const expiryDate = new Date(harvestDate);
    expiryDate.setDate(expiryDate.getDate() + shelfLife);

    // Handle image uploads to Cloudinary (with local fallback)
    let images = [];
    if (req.files && req.files.length > 0) {
      try {
        // Try to upload each image to Cloudinary
        const uploadPromises = req.files.map(async (file) => {
          try {
            const result = await uploadImage(file.path, 'mandi-connect/crops');
            // Delete local file after successful upload
            fs.unlinkSync(file.path);
            return {
              url: result.url,
              thumbnail: result.thumbnail,
              publicId: result.publicId,
              caption: ''
            };
          } catch (cloudinaryError) {
            // Fallback to local storage if Cloudinary fails
            logger.warn(`Cloudinary upload failed, using local storage: ${cloudinaryError.message}`);
            return {
              url: `/uploads/${file.filename}`,
              thumbnail: `/uploads/${file.filename}`,
              publicId: null,
              caption: ''
            };
          }
        });
        
        images = await Promise.all(uploadPromises);
        logger.info(`Uploaded ${images.length} images`);
      } catch (uploadError) {
        logger.error(`Image upload error: ${uploadError.message}`);
        // Clean up local files if upload fails
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        throw new Error('Failed to upload images');
      }
    }

    const cropData = {
      name: req.body.name,
      category: req.body.category,
      variety: req.body.variety || '',
      images: images,
      pricePerKg: parseFloat(req.body.pricePerKg),
      quantity: parseFloat(req.body.quantity),
      unit: req.body.unit || 'kg',
      minOrderQuantity: parseInt(req.body.minOrderQuantity) || 10,
      quality: req.body.quality || 'standard',
      qualityGrade: req.body.qualityGrade || 'grade1',
      harvestDate,
      expiryDate,
      shelfLife,
      description: req.body.description || '',
      isOrganic: req.body.isOrganic === 'true' || req.body.isOrganic === true,
      farmerId: farmer._id,
      location: farmer.location
    };

    const crop = await Crop.create(cropData);

    res.status(201).json({
      success: true,
      message: 'Crop listing created successfully',
      data: { crop }
    });
  } catch (error) {
    logger.error(`Create crop error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to create crop listing'
    });
  }
};

// @desc    Get all crops (marketplace)
// @route   GET /api/v1/crops
// @access  Public
export const getCrops = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      search,
      lat,
      lng,
      radius = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { isAvailable: true };

    // Category filter
    if (category) query.category = category;

    // Price range filter
    if (minPrice || maxPrice) {
      query.pricePerKg = {};
      if (minPrice) query.pricePerKg.$gte = parseFloat(minPrice);
      if (maxPrice) query.pricePerKg.$lte = parseFloat(maxPrice);
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Location-based filter
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius) * 1000 // Convert km to meters
        }
      };
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const crops = await Crop.find(query)
      .populate('farmerId', 'farmName trustScore rating district state')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Crop.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        crops,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error(`Get crops error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get crops'
    });
  }
};

// @desc    Get single crop
// @route   GET /api/v1/crops/:id
// @access  Public
export const getCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id)
      .populate('farmerId', 'farmName trustScore rating location district state primaryCrops');

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    // Increment views
    crop.views += 1;
    await crop.save();

    res.status(200).json({
      success: true,
      data: { crop }
    });
  } catch (error) {
    logger.error(`Get crop error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get crop'
    });
  }
};

// @desc    Update crop
// @route   PUT /api/v1/crops/:id
// @access  Private (Farmer only)
export const updateCrop = async (req, res) => {
  try {
    // Get user ID from token (handle both id and _id)
    const userId = req.user.id || req.user._id;
    
    let farmer = await Farmer.findOne({ userId: userId });
    
    // Auto-create farmer profile if not exists
    if (!farmer) {
      farmer = await Farmer.create({
        userId: userId,
        farmName: `${req.user.name}'s Farm`,
        location: {
          type: 'Point',
          coordinates: [0, 0]
        },
        address: 'Not provided',
        district: 'Not provided',
        state: 'Not provided',
        pincode: '000000',
        landSize: 0,
        landUnit: 'acres',
        primaryCrops: [],
        farmingType: 'conventional',
        kycStatus: 'pending',
        trustScore: 50,
        trustMetrics: {
          orderFulfillmentRate: 0,
          qualityRating: 0,
          deliveryPunctuality: 0,
          responseTime: 0,
          totalOrders: 0,
          completedOrders: 0,
          cancelledOrders: 0
        },
        rating: {
          average: 0,
          count: 0
        },
        isAvailable: true,
        workingHours: {
          start: '06:00',
          end: '18:00'
        }
      });
      logger.info(`Auto-created farmer profile for user ${userId}`);
    }

    const crop = await Crop.findOne({
      _id: req.params.id,
      farmerId: farmer._id
    });

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found or unauthorized'
      });
    }

    const updates = req.body;
    delete updates.farmerId; // Prevent changing farmer

    const updatedCrop = await Crop.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Crop updated successfully',
      data: { crop: updatedCrop }
    });
  } catch (error) {
    logger.error(`Update crop error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to update crop'
    });
  }
};

// @desc    Delete crop
// @route   DELETE /api/v1/crops/:id
// @access  Private (Farmer only)
export const deleteCrop = async (req, res) => {
  try {
    // Get user ID from token (handle both id and _id)
    const userId = req.user.id || req.user._id;
    
    let farmer = await Farmer.findOne({ userId: userId });
    
    // Auto-create farmer profile if not exists
    if (!farmer) {
      farmer = await Farmer.create({
        userId: userId,
        farmName: `${req.user.name}'s Farm`,
        location: {
          type: 'Point',
          coordinates: [0, 0]
        },
        address: 'Not provided',
        district: 'Not provided',
        state: 'Not provided',
        pincode: '000000',
        landSize: 0,
        landUnit: 'acres',
        primaryCrops: [],
        farmingType: 'conventional',
        kycStatus: 'pending',
        trustScore: 50,
        trustMetrics: {
          orderFulfillmentRate: 0,
          qualityRating: 0,
          deliveryPunctuality: 0,
          responseTime: 0,
          totalOrders: 0,
          completedOrders: 0,
          cancelledOrders: 0
        },
        rating: {
          average: 0,
          count: 0
        },
        isAvailable: true,
        workingHours: {
          start: '06:00',
          end: '18:00'
        }
      });
      logger.info(`Auto-created farmer profile for user ${userId}`);
    }

    const crop = await Crop.findOne({
      _id: req.params.id,
      farmerId: farmer._id
    });

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found or unauthorized'
      });
    }

    // Hard delete - remove from database
    await Crop.deleteOne({ _id: crop._id });

    res.status(200).json({
      success: true,
      message: 'Crop deleted successfully'
    });
  } catch (error) {
    logger.error(`Delete crop error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to delete crop'
    });
  }
};

// @desc    Get AI price suggestion
// @route   GET /api/v1/crops/:id/price-suggestion
// @access  Private (Farmer only)
export const getPriceSuggestion = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    // Mock AI price suggestion (replace with actual ML model)
    const basePrice = crop.pricePerKg;
    const marketTrend = Math.random() > 0.5 ? 'rising' : 'stable';
    const suggestedPrice = basePrice * (1 + (Math.random() * 0.2 - 0.1));

    res.status(200).json({
      success: true,
      data: {
        currentPrice: basePrice,
        suggestedPrice: Math.round(suggestedPrice * 100) / 100,
        marketPrice: Math.round(suggestedPrice * 0.95 * 100) / 100,
        trend: marketTrend,
        confidence: Math.round(Math.random() * 30 + 70),
        factors: [
          'Seasonal demand',
          'Local market conditions',
          'Quality grade'
        ]
      }
    });
  } catch (error) {
    logger.error(`Get price suggestion error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get price suggestion'
    });
  }
};
