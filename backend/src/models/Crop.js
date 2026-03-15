 import mongoose from 'mongoose';

const cropSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Crop name is required'],
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: [true, 'Crop category is required'],
    enum: [
      'vegetables', 'fruits', 'grains', 'pulses', 'spices', 'oilseeds', 'fibers', 'flowers', 'dairy', 'other'
    ]
  },
  variety: {
    type: String,
    trim: true
  },
  images: [{
    url: { type: String, required: true },
    thumbnail: String,
    publicId: String, // Cloudinary public ID for deletion
    caption: String
  }],
  pricePerKg: {
    type: Number,
    required: [true, 'Price per kg is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    default: null
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    enum: ['kg', 'quintal', 'ton', 'dozen', 'piece'],
    default: 'kg'
  },
  minOrderQuantity: {
    type: Number,
    default: 10,
    min: 1
  },
  quality: {
    type: String,
    enum: ['A', 'B', 'C', 'premium', 'standard', 'economy'],
    default: 'standard'
  },
  qualityGrade: {
    type: String,
    enum: ['export', 'grade1', 'grade2', 'local'],
    default: 'grade1'
  },
  harvestDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  shelfLife: {
    type: Number, // in days
    default: 7
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  specifications: {
    moisture: Number, // percentage
    size: String,
    color: String,
    packaging: String,
    certifications: [String]
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isOrganic: {
    type: Boolean,
    default: false
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
  deliveryOptions: [{
    type: String,
    enum: ['self_pickup', 'farmer_delivery', 'transport_service']
  }],
  deliveryRadius: {
    type: Number, // in km
    default: 50
  },
  views: {
    type: Number,
    default: 0
  },
  inquiries: {
    type: Number,
    default: 0
  },
  ordersCount: {
    type: Number,
    default: 0
  },
  aiPriceSuggestion: {
    suggestedPrice: Number,
    marketPrice: Number,
    confidence: Number,
    trend: String, // 'rising', 'falling', 'stable'
    lastUpdated: Date
  },
  demandPrediction: {
    predictedDemand: String, // 'high', 'medium', 'low'
    confidence: Number,
    factors: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
cropSchema.index({ location: '2dsphere' });
cropSchema.index({ name: 'text', description: 'text', category: 'text' });
cropSchema.index({ farmerId: 1, isAvailable: 1 });
cropSchema.index({ category: 1, isAvailable: 1 });
cropSchema.index({ pricePerKg: 1 });
cropSchema.index({ createdAt: -1 });
cropSchema.index({ expiryDate: 1 });

// Virtual for farmer details
cropSchema.virtual('farmer', {
  ref: 'Farmer',
  localField: 'farmerId',
  foreignField: '_id',
  justOne: true
});

// Method to check availability
cropSchema.methods.checkAvailability = function(requestedQuantity) {
  return this.isAvailable && this.quantity >= requestedQuantity;
};

// Method to reduce quantity
cropSchema.methods.reduceQuantity = function(amount) {
  if (this.quantity >= amount) {
    this.quantity -= amount;
    if (this.quantity === 0) {
      this.isAvailable = false;
    }
    return true;
  }
  return false;
};

// Pre-save middleware to set expiry based on shelf life
cropSchema.pre('save', function(next) {
  if (this.isModified('harvestDate') && !this.expiryDate) {
    this.expiryDate = new Date(this.harvestDate);
    this.expiryDate.setDate(this.expiryDate.getDate() + this.shelfLife);
  }
  next();
});

export const Crop = mongoose.model('Crop', cropSchema);
