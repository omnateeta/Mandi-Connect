import { Payment } from '../models/Payment.js';
import { Order } from '../models/Order.js';
import { Farmer } from '../models/Farmer.js';
import { Retailer } from '../models/Retailer.js';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';
import qrcode from 'qrcode';

// Generate UPI QR Code for payment
export const generateQRCode = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Find order
    const order = await Order.findById(orderId)
      .populate('farmerId')
      .populate('retailerId');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    console.log('Order details:', { 
      orderId: order._id, 
      totalAmount: order.totalAmount, 
      finalAmount: order.finalAmount,
      status: order.status 
    });
    
    // Check if already paid
    const existingPayment = await Payment.findOne({ 
      orderId, 
      paymentStatus: 'completed' 
    });
    
    if (existingPayment) {
      return res.status(200).json({
        success: true,
        message: 'Order already paid',
        data: existingPayment
      });
    }
    
    // Get farmer's UPI details (you can store this in Farmer model or fetch from user)
    const farmer = await Farmer.findById(order.farmerId).populate('userId');
    
    // Use REAL UPI details - Update these based on farmer's registered UPI
    // For now, using the provided UPI: 9964655985-2@ybl (Yes Bank)
    const upiAddress = '9964655985-2@ybl'; // Real Yes Bank UPI
    const farmerName = farmer.farmName || farmer.userId?.name || 'Farmer';
    const bankName = 'Yes Bank'; // Real bank name
    
    console.log('Farmer details:', { 
      upiAddress, 
      farmerName, 
      bankName,
      farmerId: order.farmerId 
    });
    
    // Generate UPI URL (using UPI deep link format)
    // Format: upi://pay?pa=ADDRESS&pn=NAME&am=AMOUNT&cu=CURRENCY
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    
    // Use finalAmount which includes platform fee and delivery fee
    const paymentAmount = order.finalAmount || order.totalAmount;
    const upiURL = `upi://pay?pa=${upiAddress}&pn=${encodeURIComponent(farmerName)}&am=${paymentAmount}&cu=INR&tn=${transactionId}`;
    
    // Generate QR Code as base64 image
    const qrCodeDataUrl = await qrcode.toDataURL(upiURL, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    
    // Create payment record
    const payment = await Payment.create({
      transactionId,
      orderId,
      retailerId: order.retailerId,
      farmerId: order.farmerId,
      amount: paymentAmount,
      paymentMethod: 'qr_code',
      paymentStatus: 'pending',
      qrCodeData: qrCodeDataUrl,
      upiDetails: {
        vpa: upiAddress,
        name: farmerName,
        mobile: '9964655985', // From UPI ID
        bank: bankName
      }
    });
    
    logger.info(`QR Code generated for order ${orderId}, Amount: ₹${paymentAmount}`);
    
    res.status(200).json({
      success: true,
      message: 'QR Code generated successfully',
      data: {
        payment: {
          id: payment._id,
          transactionId: payment.transactionId,
          amount: payment.amount,
          upiDetails: payment.upiDetails
        },
        qrCode: qrCodeDataUrl,
        upiURL: upiURL,
        instructions: [
          'Open any UPI app (Google Pay, PhonePe, Paytm, etc.)',
          'Scan the QR code or enter UPI ID manually',
          'Verify the amount and farmer name',
          'Complete the payment using your UPI PIN',
          'Payment confirmation will be automatic'
        ]
      }
    });
  } catch (error) {
    logger.error(`Generate QR error: ${error.message}`);
    console.error('QR Generation Error Details:', error);
    res.status(500).json({
      success: false,
      message: `Failed to generate QR code: ${error.message}`
    });
  }
};

// Verify payment after scanning
export const verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status, referenceId } = req.body;
    
    const payment = await Payment.findById(paymentId)
      .populate('orderId');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }
    
    // Update payment status based on verification
    if (status === 'completed' || status === 'success') {
      payment.paymentStatus = 'completed';
      payment.paidAt = new Date();
      payment.gatewayResponse = {
        referenceId,
        verifiedAt: new Date(),
        method: 'manual_verification'
      };
      
      // Update order payment status
      const order = await Order.findById(payment.orderId);
      if (order) {
        order.paymentStatus = 'paid';
        await order.save();
      }
      
      await payment.save();
      
      logger.info(`Payment verified: ${payment.transactionId}`);
      
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: payment
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'Payment status updated',
        data: payment
      });
    }
  } catch (error) {
    logger.error(`Verify payment error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
};

// Get payment history for retailer
export const getRetailerPayments = async (req, res) => {
  try {
    const retailer = await Retailer.findOne({ userId: req.user.id });
    
    if (!retailer) {
      return res.status(404).json({
        success: false,
        message: 'Retailer profile not found'
      });
    }
    
    const payments = await Payment.find({ 
      retailerId: retailer._id 
    })
    .populate('orderId')
    .populate('farmerId', 'farmName')
    .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: {
        payments,
        total: payments.length,
        completed: payments.filter(p => p.paymentStatus === 'completed').length,
        pending: payments.filter(p => p.paymentStatus === 'pending').length
      }
    });
  } catch (error) {
    logger.error(`Get retailer payments error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments'
    });
  }
};

// Get payment history for farmer
export const getFarmerPayments = async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ userId: req.user.id });
    
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found'
      });
    }
    
    const payments = await Payment.find({ 
      farmerId: farmer._id 
    })
    .populate('orderId')
    .populate('retailerId', 'businessName')
    .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: {
        payments,
        total: payments.length,
        completed: payments.filter(p => p.paymentStatus === 'completed').length,
        pending: payments.filter(p => p.paymentStatus === 'pending').length,
        totalReceived: payments
          .filter(p => p.paymentStatus === 'completed')
          .reduce((sum, p) => sum + p.amount, 0)
      }
    });
  } catch (error) {
    logger.error(`Get farmer payments error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments'
    });
  }
};

// Manual payment confirmation (for when auto-verification fails)
export const confirmPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { transactionRef, screenshot } = req.body;
    
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }
    
    // Mark as completed with manual reference
    payment.paymentStatus = 'completed';
    payment.paidAt = new Date();
    payment.gatewayResponse = {
      transactionRef,
      screenshot,
      verifiedManually: true,
      verifiedAt: new Date()
    };
    
    // Update order
    const order = await Order.findById(payment.orderId);
    if (order) {
      order.paymentStatus = 'paid';
      await order.save();
    }
    
    await payment.save();
    
    logger.info(`Payment manually confirmed: ${payment.transactionId}`);
    
    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      data: payment
    });
  } catch (error) {
    logger.error(`Confirm payment error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment'
    });
  }
};
