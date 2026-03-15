import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  role: {
    type: String,
    enum: ['farmer', 'retailer', 'admin'],
    required: [true, 'User role is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  avatar: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  preferredLanguage: {
    type: String,
    enum: ['en', 'hi', 'mr', 'te', 'ta', 'kn', 'gu', 'bn', 'pa'],
    default: 'en'
  },
  notificationSettings: {
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    email: { type: Boolean, default: false }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for farmer/retailer details
userSchema.virtual('farmerProfile', {
  ref: 'Farmer',
  localField: '_id',
  foreignField: 'userId',
  justOne: true
});

userSchema.virtual('retailerProfile', {
  ref: 'Retailer',
  localField: '_id',
  foreignField: 'userId',
  justOne: true
});

// Index for faster queries
userSchema.index({ phone: 1 });
userSchema.index({ role: 1, isVerified: 1 });

export const User = mongoose.model('User', userSchema);
