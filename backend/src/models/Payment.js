import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Retailer',
    required: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['qr_code', 'upi', 'card', 'netbanking', 'wallet'],
    default: 'qr_code'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  qrCodeData: {
    type: String, // UPI QR string or image URL
    required: true
  },
  upiDetails: {
    vpa: String, // Virtual Payment Address (e.g., farmer@oksbi)
    name: String,
    mobile: String,
    bank: String
  },
  gatewayResponse: {
    type: Object,
    default: {}
  },
  paidAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ retailerId: 1, paymentStatus: 1 });
paymentSchema.index({ farmerId: 1, paymentStatus: 1 });

export const Payment = mongoose.model('Payment', paymentSchema);
