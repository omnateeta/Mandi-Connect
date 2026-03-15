import { validationResult } from 'express-validator';
import { Retailer, Order, Crop } from '../models/index.js';
import { logger } from '../utils/logger.js';
import { uploadImage } from '../config/cloudinary.js';
import fs from 'fs';

// @desc    Create retailer profile
// @route   POST /api/v1/retailers/profile
// @access  Private (Retailer only)
export const createProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const existingProfile = await Retailer.findOne({ userId: req.user.id });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Retailer profile already exists'
      });
    }

    const retailer = await Retailer.create({
      userId: req.user.id,
      ...req.body,
      location: {
        type: 'Point',
        coordinates: req.body.location.coordinates
      }
    });

    res.status(201).json({
      success: true,
      message: 'Retailer profile created successfully',
      data: { retailer }
    });
  } catch (error) {
    logger.error(`Create retailer profile error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to create retailer profile'
    });
  }
};

// @desc    Get retailer profile
// @route   GET /api/v1/retailers/profile
// @access  Private (Retailer only)
export const getProfile = async (req, res) => {
  try {
    const retailer = await Retailer.findOne({ userId: req.user.id })
      .populate('userId', 'name phone email avatar');

    if (!retailer) {
      return res.status(404).json({
        success: false,
        message: 'Retailer profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { retailer }
    });
  } catch (error) {
    logger.error(`Get retailer profile error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get retailer profile'
    });
  }
};

// @desc    Update retailer profile
// @route   PUT /api/v1/retailers/profile
// @access  Private (Retailer only)
export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.userId;
    
    logger.info(`Update retailer profile - User ID: ${req.user.id}, Updates: ${JSON.stringify(updates)}`);

    const retailer = await Retailer.findOneAndUpdate(
      { userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!retailer) {
      logger.error(`Retailer profile not found for user ID: ${req.user.id}`);
      return res.status(404).json({
        success: false,
        message: 'Retailer profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { retailer }
    });
  } catch (error) {
    logger.error(`Update retailer profile error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// @desc    Get marketplace crops
// @route   GET /api/v1/retailers/marketplace
// @access  Private (Retailer only)
export const getMarketplace = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt'
    } = req.query;

    const retailer = await Retailer.findOne({ userId: req.user.id });
    if (!retailer) {
      return res.status(404).json({
        success: false,
        message: 'Retailer profile not found'
      });
    }

    const query = { isAvailable: true };

    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.pricePerKg = {};
      if (minPrice) query.pricePerKg.$gte = parseFloat(minPrice);
      if (maxPrice) query.pricePerKg.$lte = parseFloat(maxPrice);
    }
    if (search) query.$text = { $search: search };

    const sortOptions = {};
    sortOptions[sortBy] = sortBy === 'pricePerKg' ? 1 : -1;

    const crops = await Crop.find(query)
      .populate('farmerId', 'farmName trustScore rating district')
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
    logger.error(`Get marketplace error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get marketplace'
    });
  }
};

// @desc    Get retailer's orders
// @route   GET /api/v1/retailers/orders
// @access  Private (Retailer only)
export const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const retailer = await Retailer.findOne({ userId: req.user.id });
    if (!retailer) {
      return res.status(404).json({
        success: false,
        message: 'Retailer profile not found'
      });
    }

    const query = { retailerId: retailer._id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('farmerId', 'farmName')
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
    logger.error(`Get retailer orders error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders'
    });
  }
};

// @desc    Get retailer dashboard
// @route   GET /api/v1/retailers/dashboard
// @access  Private (Retailer only)
export const getDashboard = async (req, res) => {
  try {
    const retailer = await Retailer.findOne({ userId: req.user.id });
    if (!retailer) {
      return res.status(404).json({
        success: false,
        message: 'Retailer profile not found'
      });
    }

    const orders = await Order.find({ retailerId: retailer._id });
    
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => ['pending', 'accepted', 'preparing'].includes(o.status)).length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const totalSpent = orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const recentOrders = await Order.find({ retailerId: retailer._id })
      .populate('farmerId', 'farmName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalOrders,
          pendingOrders,
          completedOrders,
          totalSpent,
          rating: retailer.rating
        },
        recentOrders
      }
    });
  } catch (error) {
    logger.error(`Get retailer dashboard error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard'
    });
  }
};

// @desc    Upload profile image
// @route   POST /api/v1/retailers/profile/image
// @access  Private (Retailer only)
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const retailer = await Retailer.findOne({ userId: req.user.id });
    if (!retailer) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Retailer profile not found'
      });
    }

    // Upload to Cloudinary
    let imageUrl;
    try {
      const result = await uploadImage(req.file.path, 'mandi-connect/profiles');
      imageUrl = result.url;
      fs.unlinkSync(req.file.path);
    } catch (uploadError) {
      logger.warn(`Cloudinary upload failed, using local storage: ${uploadError.message}`);
      imageUrl = `/uploads/${req.file.filename}`;
    }

    retailer.profileImage = imageUrl;
    await retailer.save();

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: { imageUrl }
    });
  } catch (error) {
    logger.error(`Upload profile image error: ${error.message}`);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile image'
    });
  }
};
