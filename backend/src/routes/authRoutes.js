import express from 'express';
import { body } from 'express-validator';
import {
  sendLoginOTP,
  verifyLoginOTP,
  resendLoginOTP,
  refreshToken,
  getMe,
  updateProfile,
  logout,
  checkUser
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const phoneValidation = body('phone')
  .notEmpty().withMessage('Phone number is required')
  .matches(/^\+?[1-9]\d{9,14}$/).withMessage('Please enter a valid phone number');

const otpValidation = body('otp')
  .notEmpty().withMessage('OTP is required')
  .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
  .isNumeric().withMessage('OTP must contain only numbers');

// Routes
router.post('/send-otp', phoneValidation, sendLoginOTP);
router.post('/verify-otp', [
  phoneValidation,
  otpValidation
], verifyLoginOTP);
router.post('/resend-otp', phoneValidation, resendLoginOTP);
router.post('/refresh-token', refreshToken);
router.get('/me', authenticate, getMe);
router.put('/update-profile', authenticate, updateProfile);
router.post('/logout', authenticate, logout);
router.post('/check-user', phoneValidation, checkUser);

export default router;
