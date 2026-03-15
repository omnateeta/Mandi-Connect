import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { 
  generateQRCode, 
  verifyPayment, 
  getRetailerPayments, 
  getFarmerPayments,
  confirmPayment 
} from '../controllers/paymentController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Retailer routes
router.post('/generate-qr/:orderId', generateQRCode);
router.post('/verify/:paymentId', verifyPayment);
router.get('/retailer/my-payments', getRetailerPayments);
router.post('/confirm/:paymentId', confirmPayment);

// Farmer routes  
router.get('/farmer/my-payments', getFarmerPayments);

export default router;
