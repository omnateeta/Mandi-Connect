import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  cropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  pricePerKg: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  quality: String
});

const trackingEventSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  location: String,
  description: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
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
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  platformFee: {
    type: Number,
    default: 0
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: [
      'pending',           // Order placed, waiting for farmer acceptance
      'accepted',          // Farmer accepted
      'rejected',          // Farmer rejected
      'preparing',         // Farmer preparing order
      'ready_for_pickup',  // Order ready
      'picked_up',         // Picked up by logistics
      'in_transit',        // In transit
      'out_for_delivery',  // Near delivery
      'delivered',         // Successfully delivered
      'cancelled',         // Cancelled by either party
      'disputed'           // Under dispute
    ],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'failed', 'refunded', 'held'],
    default: 'pending'
  },
  deliveryAddress: {
    fullAddress: { type: String, required: true },
    landmark: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  deliveryType: {
    type: String,
    enum: ['farmer_delivery', 'buyer_pickup', 'third_party'],
    required: true
  },
  // Live tracking fields
  liveLocation: {
    coordinates: [Number], // [longitude, latitude]
    address: String
  },
  lastLocationUpdate: {
    type: Date
  },
  cropFieldInfo: {
    farmName: String,
    farmerName: String,
    fieldAddress: String,
    fieldCoordinates: {
      latitude: Number,
      longitude: Number
    },
    fieldImages: [String],
    cropDetails: String,
    farmingMethod: String,
    harvestDate: Date,
    soilType: String,
    irrigationMethod: String,
    certifications: [String]
  },
  estimatedArrival: {
    type: Date
  },
  currentDriver: {
    name: String,
    phone: String,
    vehicleNumber: String,
    licensePlate: String
  },
  preferredDeliveryDate: {
    type: Date
  },
  expectedDeliveryDate: {
    type: Date
  },
  actualDeliveryDate: {
    type: Date
  },
  logisticsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Logistics'
  },
  trackingNumber: {
    type: String
  },
  trackingHistory: [trackingEventSchema],
  specialInstructions: {
    type: String,
    maxlength: 500
  },
  rejectionReason: {
    type: String
  },
  cancellationReason: {
    type: String
  },
  disputeDetails: {
    reason: String,
    description: String,
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    raisedAt: Date,
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved', 'closed']
    },
    resolution: String
  },
  ratings: {
    farmer: {
      rating: Number,
      comment: String,
      ratedAt: Date
    },
    retailer: {
      rating: Number,
      comment: String,
      ratedAt: Date
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ farmerId: 1, status: 1 });
orderSchema.index({ retailerId: 1, status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, paymentStatus: 1 });

// Virtuals
orderSchema.virtual('farmer', {
  ref: 'Farmer',
  localField: 'farmerId',
  foreignField: '_id',
  justOne: true
});

orderSchema.virtual('retailer', {
  ref: 'Retailer',
  localField: 'retailerId',
  foreignField: '_id',
  justOne: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const prefix = 'MC';
    const timestamp = date.getTime().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.orderNumber = `${prefix}${timestamp}${random}`;
  }
  next();
});

// Method to update status with enhanced tracking
orderSchema.methods.updateStatus = async function(newStatus, updatedBy, location, description, liveCoords) {
  const oldStatus = this.status;
  this.status = newStatus;
  
  // Add to tracking history
  this.trackingHistory.push({
    status: newStatus,
    location,
    description,
    updatedBy,
    timestamp: new Date()
  });
  
  // Update live location if provided
  if (liveCoords && Array.isArray(liveCoords) && liveCoords.length === 2) {
    this.liveLocation = {
      type: 'Point',
      coordinates: liveCoords
    };
    this.lastLocationUpdate = new Date();
  }
  
  // Set timestamps based on status
  if (newStatus === 'delivered') {
    this.actualDeliveryDate = new Date();
  } else if (['picked_up', 'in_transit', 'out_for_delivery'].includes(newStatus)) {
    // Calculate estimated arrival (mock - 2 hours from now)
    this.estimatedArrival = new Date(Date.now() + 2 * 60 * 60 * 1000);
  }
  
  await this.save();
};

// Method to get tracking info
orderSchema.methods.getTrackingInfo = function() {
  return {
    orderId: this._id,
    orderNumber: this.orderNumber,
    currentStatus: this.status,
    liveLocation: this.liveLocation,
    lastLocationUpdate: this.lastLocationUpdate,
    estimatedArrival: this.estimatedArrival,
    cropFieldInfo: this.cropFieldInfo,
    currentDriver: this.currentDriver,
    trackingHistory: this.trackingHistory.sort((a, b) => b.timestamp - a.timestamp),
    deliveryAddress: this.deliveryAddress
  };
};

// Method to calculate totals
orderSchema.methods.calculateTotals = function() {
  const itemsTotal = this.items.reduce((sum, item) => sum + item.total, 0);
  this.totalAmount = itemsTotal;
  this.finalAmount = itemsTotal + this.platformFee + this.deliveryFee;
};

export const Order = mongoose.model('Order', orderSchema);
