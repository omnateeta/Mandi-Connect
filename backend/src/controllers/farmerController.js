import { validationResult } from 'express-validator';
import { Farmer, Crop, Order } from '../models/index.js';
import { logger } from '../utils/logger.js';
import { uploadImage } from '../config/cloudinary.js';
import fs from 'fs';

// @desc    Create farmer profile
// @route   POST /api/v1/farmers/profile
// @access  Private (Farmer only)
export const createProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      farmName,
      location,
      address,
      district,
      state,
      pincode,
      landSize,
      landUnit,
      primaryCrops,
      farmingType
    } = req.body;

    // Check if profile already exists
    const existingProfile = await Farmer.findOne({ userId: req.user.id });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Farmer profile already exists'
      });
    }

    const farmer = await Farmer.create({
      userId: req.user.id,
      farmName,
      location: {
        type: 'Point',
        coordinates: location.coordinates
      },
      address,
      district,
      state,
      pincode,
      landSize,
      landUnit,
      primaryCrops,
      farmingType
    });

    res.status(201).json({
      success: true,
      message: 'Farmer profile created successfully',
      data: { farmer }
    });
  } catch (error) {
    logger.error(`Create farmer profile error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to create farmer profile'
    });
  }
};

// @desc    Get farmer profile
// @route   GET /api/v1/farmers/profile
// @access  Private (Farmer only)
export const getProfile = async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ userId: req.user.id })
      .populate('userId', 'name phone email avatar');

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { farmer }
    });
  } catch (error) {
    logger.error(`Get farmer profile error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get farmer profile'
    });
  }
};

// @desc    Update farmer profile
// @route   PUT /api/v1/farmers/profile
// @access  Private (Farmer only)
export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.userId; // Prevent changing userId
    delete updates.trustScore; // Prevent manual trust score update

    const farmer = await Farmer.findOneAndUpdate(
      { userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { farmer }
    });
  } catch (error) {
    logger.error(`Update farmer profile error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// @desc    Get farmer's crops
// @route   GET /api/v1/farmers/crops
// @access  Private (Farmer only)
export const getMyCrops = async (req, res) => {
  try {
    const { page = 1, limit = 10, isAvailable } = req.query;
    
    const farmer = await Farmer.findOne({ userId: req.user.id });
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found'
      });
    }

    const query = { 
      farmerId: farmer._id,
      isAvailable: true // Only show available crops by default
    };
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }

    const crops = await Crop.find(query)
      .sort({ createdAt: -1 })
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
    logger.error(`Get farmer crops error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get crops'
    });
  }
};

// @desc    Get farmer's orders
// @route   GET /api/v1/farmers/orders
// @access  Private (Farmer only)
export const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const farmer = await Farmer.findOne({ userId: req.user.id });
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found'
      });
    }

    const query = { farmerId: farmer._id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('retailerId', 'businessName')
      .populate('items.cropId', 'name images')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error(`Get farmer orders error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders'
    });
  }
};

// @desc    Get farmer dashboard stats
// @route   GET /api/v1/farmers/dashboard
// @access  Private (Farmer only)
export const getDashboard = async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ userId: req.user.id });
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found. Please create your profile first.'
      });
    }

    // Get stats
    const totalCrops = await Crop.countDocuments({ farmerId: farmer._id });
    const activeCrops = await Crop.countDocuments({ 
      farmerId: farmer._id, 
      isAvailable: true 
    });

    const orders = await Order.find({ farmerId: farmer._id });
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'paid').length;

    const totalRevenue = orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Get recent orders
    const recentOrders = await Order.find({ farmerId: farmer._id })
      .populate('retailerId', 'businessName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalCrops,
          activeCrops,
          totalOrders,
          pendingOrders,
          completedOrders,
          totalRevenue,
          trustScore: farmer.trustScore || 0,
          rating: farmer.rating || 0
        },
        recentOrders
      }
    });
  } catch (error) {
    logger.error(`Get farmer dashboard error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data'
    });
  }
};

// @desc    Upload profile image
// @route   POST /api/v1/farmers/profile/image
// @access  Private (Farmer only)
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const farmer = await Farmer.findOne({ userId: req.user.id });
    if (!farmer) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found'
      });
    }

    // Upload to Cloudinary
    let imageUrl;
    try {
      const result = await uploadImage(req.file.path, 'mandi-connect/profiles');
      imageUrl = result.url;
      fs.unlinkSync(req.file.path);
    } catch (uploadError) {
      // Fallback to local storage
      logger.warn(`Cloudinary upload failed, using local storage: ${uploadError.message}`);
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Update farmer profile with image URL
    farmer.profileImage = imageUrl;
    await farmer.save();

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: { imageUrl }
    });
  } catch (error) {
    logger.error(`Upload profile image error: ${error.message}`);
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile image'
    });
  }
};

// @desc    Upload KYC documents
// @route   POST /api/v1/farmers/kyc
// @access  Private (Farmer only)
export const uploadKYC = async (req, res) => {
  try {
    const { documentType, documentUrl } = req.body;

    const farmer = await Farmer.findOne({ userId: req.user.id });
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found'
      });
    }

    farmer.kycDocuments.push({
      type: documentType,
      url: documentUrl,
      verified: false
    });

    if (farmer.kycStatus === 'pending') {
      farmer.kycStatus = 'in_review';
    }

    await farmer.save();

    res.status(200).json({
      success: true,
      message: 'KYC document uploaded successfully',
      data: { farmer }
    });
  } catch (error) {
    logger.error(`Upload KYC error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to upload KYC document'
    });
  }
};
