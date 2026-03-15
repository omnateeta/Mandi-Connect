import express from 'express';
import { body } from 'express-validator';
import { adminLogin, getAdminMe } from '../controllers/adminAuthController.js';
import { getAdminDashboard, getFraudDetection, getFarmerAnalytics, getRetailerAnalytics } from '../controllers/adminDashboardController.js';
import { authenticateAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// Validation middleware
const loginValidation = body('username')
  .notEmpty().withMessage('Username is required')
  .trim()
  .isLength({ min: 3 }).withMessage('Username must be at least 3 characters');

const passwordValidation = body('password')
  .notEmpty().withMessage('Password is required')
  .isLength({ min: 6 }).withMessage('Password must be at least 6 characters');

// Public routes
router.post('/auth/login', 
  loginValidation, 
  passwordValidation, 
  adminLogin
);

// Protected routes
router.get('/auth/me', authenticateAdmin, getAdminMe);
router.get('/dashboard', authenticateAdmin, getAdminDashboard);
router.get('/fraud-detection', authenticateAdmin, getFraudDetection);
router.get('/farmers/analytics', authenticateAdmin, getFarmerAnalytics);
router.get('/retailers/analytics', authenticateAdmin, getRetailerAnalytics);

export default router;
