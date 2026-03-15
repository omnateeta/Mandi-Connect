import mongoose from 'mongoose';

const retailerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [100, 'Business name cannot exceed 100 characters']
  },
  profileImage: {
    type: String,
    default: null
  },
  businessType: {
    type: String,
    enum: ['grocery_store', 'supermarket', 'restaurant', 'hotel', 'wholesaler', 'exporter', 'processor', 'other'],
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    match: /^\d{6}$/
  },
  gstNumber: {
    type: String,
    trim: true,
    sparse: true
  },
  licenseNumber: {
    type: String,
    trim: true
  },
  businessDocuments: [{
    type: {
      type: String,
      enum: ['gst_certificate', 'trade_license', 'shop_photo', 'id_proof']
    },
    url: String,
    verified: { type: Boolean, default: false }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'in_review', 'verified', 'rejected'],
    default: 'pending'
  },
  preferredCategories: [{
    type: String,
    trim: true
  }],
  monthlyRequirement: {
    type: Number,
    default: 0
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  orderStats: {
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 }
  },
  paymentMethods: [{
    type: String,
    enum: ['upi', 'bank_transfer', 'cash', 'wallet']
  }],
  preferredPaymentMethod: {
    type: String,
    enum: ['upi', 'bank_transfer', 'cash', 'wallet'],
    default: 'upi'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Geospatial index
retailerSchema.index({ location: '2dsphere' });
retailerSchema.index({ district: 1, state: 1 });
retailerSchema.index({ businessType: 1 });
retailerSchema.index({ verificationStatus: 1 });

// Virtual for orders
retailerSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'retailerId'
});

export const Retailer = mongoose.model('Retailer', retailerSchema);
