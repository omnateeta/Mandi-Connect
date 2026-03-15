import { validationResult } from 'express-validator';
import { User, Farmer, Retailer } from '../models/index.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';
import { generateOTP, sendOTP, storeOTP, verifyOTP, resendOTP } from '../services/otpService.js';
import { logger } from '../utils/logger.js';

// @desc    Send OTP for login/registration
// @route   POST /api/v1/auth/send-otp
// @access  Public
export const sendLoginOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { phone } = req.body;

    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(phone, otp);

    // Send OTP
    await sendOTP(phone, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        phone,
        expiresIn: 600 // 10 minutes in seconds
      }
    });
  } catch (error) {
    logger.error(`Send OTP error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
};

// @desc    Verify OTP and login/register
// @route   POST /api/v1/auth/verify-otp
// @access  Public
export const verifyLoginOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { phone, otp, role, name } = req.body;
    logger.info(`Verify OTP called - Phone: ${phone}, Role: ${role}, Name: ${name}, HasOTP: ${!!otp}`);

    // Verify OTP
    const otpResult = verifyOTP(phone, otp);
    if (!otpResult.valid) {
      return res.status(400).json({
        success: false,
        message: otpResult.message,
        attemptsLeft: otpResult.attemptsLeft
      });
    }

    // Check if user exists
    let user = await User.findOne({ phone });
    let isNewUser = false;
    logger.info(`User lookup result: ${user ? 'EXISTING USER' : 'NEW USER'}, Existing role: ${user?.role}`);

    if (!user) {
      // Validate required fields for new user
      if (!role || !name) {
        return res.status(400).json({
          success: false,
          message: 'Role and name are required for new registration'
        });
      }

      // Create new user
      logger.info(`Creating new user with role: ${role}`);
      user = await User.create({
        phone,
        role,
        name,
        isVerified: true
      });
      isNewUser = true;
      logger.info(`New user created with ID: ${user._id}, Role: ${user.role}`);

      // Create corresponding profile (Farmer or Retailer)
      if (role === 'farmer') {
        await Farmer.create({
          userId: user._id,
          farmName: `${name}'s Farm`,
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
      } else if (role === 'retailer') {
        await Retailer.create({
          userId: user._id,
          businessName: name,
          businessType: 'grocery_store',
          location: {
            type: 'Point',
            coordinates: [0, 0]
          },
          address: 'Not provided',
          district: 'Not provided',
          state: 'Not provided',
          pincode: '000000',
          isVerified: false,
          verificationStatus: 'pending',
          rating: {
            average: 0,
            count: 0
          },
          orderStats: {
            totalOrders: 0,
            totalSpent: 0,
            averageOrderValue: 0
          },
          preferredPaymentMethod: 'upi'
        });
      }
    } else {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      
      // Check if profile exists, if not create it
      if (user.role === 'farmer') {
        const existingFarmer = await Farmer.findOne({ userId: user._id });
        if (!existingFarmer) {
          await Farmer.create({
            userId: user._id,
            farmName: `${user.name}'s Farm`,
            location: { type: 'Point', coordinates: [0, 0] },
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
            rating: { average: 0, count: 0 },
            isAvailable: true,
            workingHours: { start: '06:00', end: '18:00' }
          });
        }
      } else if (user.role === 'retailer') {
        const existingRetailer = await Retailer.findOne({ userId: user._id });
        if (!existingRetailer) {
          await Retailer.create({
            userId: user._id,
            businessName: user.name,
            businessType: 'grocery_store',
            location: { type: 'Point', coordinates: [0, 0] },
            address: 'Not provided',
            district: 'Not provided',
            state: 'Not provided',
            pincode: '000000',
            isVerified: false,
            verificationStatus: 'pending',
            rating: { average: 0, count: 0 },
            orderStats: { totalOrders: 0, totalSpent: 0, averageOrderValue: 0 },
            preferredPaymentMethod: 'upi'
          });
        }
      }
    }

    // Generate tokens
    const token = generateToken({
      id: user._id,
      role: user.role,
      phone: user.phone
    });

    const refreshToken = generateRefreshToken({
      id: user._id
    });

    res.status(200).json({
      success: true,
      message: isNewUser ? 'Registration successful' : 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
          isNewUser
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    logger.error(`Verify OTP error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/v1/auth/resend-otp
// @access  Public
export const resendLoginOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { phone } = req.body;

    await resendOTP(phone);

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      data: {
        phone,
        expiresIn: 600
      }
    });
  } catch (error) {
    logger.error(`Resend OTP error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP'
    });
  }
};

// @desc    Refresh token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    const newToken = generateToken({
      id: user._id,
      role: user.role,
      phone: user.phone
    });

    res.status(200).json({
      success: true,
      data: {
        token: newToken
      }
    });
  } catch (error) {
    logger.error(`Refresh token error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    let profile = null;
    if (user.role === 'farmer') {
      profile = await Farmer.findOne({ userId: user._id });
    } else if (user.role === 'retailer') {
      profile = await Retailer.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          email: user.email,
          avatar: user.avatar,
          isVerified: user.isVerified,
          preferredLanguage: user.preferredLanguage,
          createdAt: user.createdAt
        },
        profile
      }
    });
  } catch (error) {
    logger.error(`Get me error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get user details'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/update-profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, email, avatar, preferredLanguage } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        email,
        avatar,
        preferredLanguage
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          avatar: user.avatar,
          preferredLanguage: user.preferredLanguage
        }
      }
    });
  } catch (error) {
    logger.error(`Update profile error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    // In a more complex setup, you might want to blacklist the token
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

// @desc    Check if user exists
// @route   POST /api/v1/auth/check-user
// @access  Public
export const checkUser = async (req, res) => {
  try {
    const { phone } = req.body;
    logger.info(`Check user called with phone: ${phone}`);

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const user = await User.findOne({ phone });
    logger.info(`User found: ${user ? 'YES' : 'NO'}, Role: ${user?.role}`);

    if (user) {
      return res.status(200).json({
        success: true,
        exists: true,
        role: user.role,
        name: user.name
      });
    } else {
      return res.status(200).json({
        success: true,
        exists: false
      });
    }
  } catch (error) {
    logger.error(`Check user error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to check user'
    });
  }
};
