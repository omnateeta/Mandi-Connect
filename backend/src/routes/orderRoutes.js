import express from 'express';
import { body } from 'express-validator';
import {
  createOrder,
  getOrder,
  updateOrderStatus,
  getOrderTracking,
  updateOrderLocation
} from '../controllers/orderController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Create order (Retailer only)
router.post('/', [
  authorize('retailer'),
  body('items').isArray({ min: 1 }).withMessage('At least one item required'),
  body('items.*.cropId').notEmpty().withMessage('Crop ID required'),
  body('items.*.quantity').isNumeric().withMessage('Quantity must be a number'),
  body('deliveryAddress').notEmpty().withMessage('Delivery address required'),
  body('deliveryType').isIn(['farmer_delivery', 'buyer_pickup', 'third_party']).withMessage('Valid delivery type required')
], createOrder);

// Get order (Farmer or Retailer)
router.get('/:id', getOrder);

// Update order status
router.put('/:id/status', updateOrderStatus);

// Update order location (live tracking)
router.put('/:id/location', updateOrderLocation);

// Get order tracking
router.get('/:id/tracking', getOrderTracking);

export default router;
