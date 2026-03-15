import express from 'express';
import { body } from 'express-validator';
import {
  createProfile,
  getProfile,
  updateProfile,
  getMarketplace,
  getMyOrders,
  getDashboard,
  uploadProfileImage
} from '../controllers/retailerController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication and retailer role
router.use(authenticate);
router.use(authorize('retailer'));

// Profile routes
router.post('/profile', [
  body('businessName').notEmpty().withMessage('Business name is required'),
  body('businessType').notEmpty().withMessage('Business type is required'),
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Valid coordinates required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('district').notEmpty().withMessage('District is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('pincode').matches(/^\d{6}$/).withMessage('Valid 6-digit pincode required')
], createProfile);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/image', upload.single('image'), uploadProfileImage);

// Dashboard
router.get('/dashboard', getDashboard);

// Marketplace
router.get('/marketplace', getMarketplace);

// Orders
router.get('/orders', getMyOrders);

export default router;
