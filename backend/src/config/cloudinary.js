import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';

// Load env vars (in case this module is imported before app.js)
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

logger.info(`Cloudinary config check: cloud_name=${process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET'}, api_key=${process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET'}`);

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return process.env.CLOUDINARY_CLOUD_NAME && 
         process.env.CLOUDINARY_API_KEY && 
         process.env.CLOUDINARY_API_SECRET &&
         process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';
};

// Upload image to Cloudinary
export const uploadImage = async (filePath, folder = 'mandi-connect/crops') => {
  try {
    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env file');
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' }, // Max dimension
        { quality: 'auto:good' }, // Auto optimize quality
        { fetch_format: 'auto' } // Auto format (webp if supported)
      ]
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      thumbnail: cloudinary.url(result.public_id, {
        width: 300,
        height: 300,
        crop: 'fill',
        quality: 'auto'
      })
    };
  } catch (error) {
    logger.error(`Cloudinary upload error: ${JSON.stringify(error)}`);
    throw new Error(error.message || 'Cloudinary upload failed');
  }
};

// Delete image from Cloudinary
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    logger.error(`Cloudinary delete error: ${error.message}`);
    throw error;
  }
};

export default cloudinary;
