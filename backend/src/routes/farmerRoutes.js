import express from 'express';
import { body } from 'express-validator';
import {
  createProfile,
  getProfile,
  updateProfile,
  getMyCrops,
  getMyOrders,
  getDashboard,
  uploadKYC,
  uploadProfileImage
} from '../controllers/farmerController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication and farmer role
router.use(authenticate);
router.use(authorize('farmer'));

// Profile routes
router.post('/profile', [
  body('farmName').notEmpty().withMessage('Farm name is required'),
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Valid coordinates required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('district').notEmpty().withMessage('District is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('pincode').matches(/^\d{6}$/).withMessage('Valid 6-digit pincode required'),
  body('landSize').isNumeric().withMessage('Land size must be a number')
], createProfile);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/image', upload.single('image'), uploadProfileImage);

// Dashboard
router.get('/dashboard', getDashboard);

// Crops
router.get('/crops', getMyCrops);

// Orders
router.get('/orders', getMyOrders);

// KYC
router.post('/kyc', uploadKYC);

export default router;
