import mongoose from 'mongoose';

const farmerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  farmName: {
    type: String,
    required: [true, 'Farm name is required'],
    trim: true,
    maxlength: [100, 'Farm name cannot exceed 100 characters']
  },
  profileImage: {
    type: String,
    default: null
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
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
  landSize: {
    type: Number,
    required: [true, 'Land size is required'],
    min: [0, 'Land size cannot be negative']
  },
  landUnit: {
    type: String,
    enum: ['acres', 'hectares', 'bigha', 'kanal'],
    default: 'acres'
  },
  primaryCrops: [{
    type: String,
    trim: true
  }],
  farmingType: {
    type: String,
    enum: ['organic', 'conventional', 'mixed'],
    default: 'conventional'
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'in_review', 'verified', 'rejected'],
    default: 'pending'
  },
  kycDocuments: [{
    type: {
      type: String,
      enum: ['aadhaar', 'pan', 'land_record', 'bank_passbook', 'photo']
    },
    url: String,
    verified: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now }
  }],
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    verified: { type: Boolean, default: false }
  },
  trustScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  trustMetrics: {
    orderFulfillmentRate: { type: Number, default: 0 },
    qualityRating: { type: Number, default: 0 },
    deliveryPunctuality: { type: Number, default: 0 },
    responseTime: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 },
    cancelledOrders: { type: Number, default: 0 }
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  badges: [{
    type: String,
    enum: ['verified', 'premium', 'fast_delivery', 'top_rated', 'organic']
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  workingHours: {
    start: { type: String, default: '06:00' },
    end: { type: String, default: '18:00' }
  },
  preferredDeliveryMethods: [{
    type: String,
    enum: ['self', 'mandi_transport', 'buyer_pickup']
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Geospatial index for location-based queries
farmerSchema.index({ location: '2dsphere' });
farmerSchema.index({ district: 1, state: 1 });
farmerSchema.index({ kycStatus: 1 });
farmerSchema.index({ trustScore: -1 });

// Virtual for active crops
farmerSchema.virtual('activeCrops', {
  ref: 'Crop',
  localField: '_id',
  foreignField: 'farmerId',
  match: { isAvailable: true }
});

// Method to calculate trust score
farmerSchema.methods.calculateTrustScore = function() {
  const metrics = this.trustMetrics;
  if (metrics.totalOrders === 0) return 50;
  
  const fulfillmentWeight = 0.3;
  const qualityWeight = 0.25;
  const punctualityWeight = 0.25;
  const responseWeight = 0.2;
  
  const score = (
    (metrics.orderFulfillmentRate * fulfillmentWeight) +
    (metrics.qualityRating * 20 * qualityWeight) +
    (metrics.deliveryPunctuality * punctualityWeight) +
    (Math.max(0, 100 - metrics.responseTime) * responseWeight)
  );
  
  return Math.min(100, Math.max(0, score));
};

export const Farmer = mongoose.model('Farmer', farmerSchema);
