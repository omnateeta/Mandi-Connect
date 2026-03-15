import express from 'express';
import { body } from 'express-validator';
import {
  createCrop,
  getCrops,
  getCrop,
  updateCrop,
  deleteCrop,
  getPriceSuggestion
} from '../controllers/cropController.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import upload, { handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getCrops);
router.get('/:id', optionalAuth, getCrop);

// Protected routes (Farmer only)
router.post('/', [
  authenticate,
  authorize('farmer'),
  upload.array('images', 5),
  handleUploadError,
  body('name').notEmpty().withMessage('Crop name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('pricePerKg').isNumeric().withMessage('Price must be a number'),
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('harvestDate').isISO8601().withMessage('Valid harvest date required')
], createCrop);

router.put('/:id', authenticate, authorize('farmer'), updateCrop);
router.delete('/:id', authenticate, authorize('farmer'), deleteCrop);

// AI price suggestion
router.get('/:id/price-suggestion', authenticate, authorize('farmer'), getPriceSuggestion);

export default router;
