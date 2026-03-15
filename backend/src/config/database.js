import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes for geospatial queries
    await createIndexes();
    
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    
    // Geospatial index for location-based queries
    await db.collection('farmers').createIndex({ location: '2dsphere' });
    await db.collection('retailers').createIndex({ location: '2dsphere' });
    await db.collection('crops').createIndex({ location: '2dsphere' });
    
    // Text index for search
    await db.collection('crops').createIndex({ 
      name: 'text', 
      description: 'text',
      category: 'text'
    });
    
    // Regular indexes
    await db.collection('users').createIndex({ phone: 1 }, { unique: true });
    await db.collection('orders').createIndex({ orderNumber: 1 }, { unique: true });
    await db.collection('orders').createIndex({ farmerId: 1, status: 1 });
    await db.collection('orders').createIndex({ retailerId: 1, status: 1 });
    await db.collection('crops').createIndex({ farmerId: 1, isAvailable: 1 });
    await db.collection('messages').createIndex({ senderId: 1, receiverId: 1 });
    await db.collection('notifications').createIndex({ userId: 1, isRead: 1 });
    
    logger.info('Database indexes created successfully');
  } catch (error) {
    logger.error(`Index creation error: ${error.message}`);
  }
};

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected. Attempting to reconnect...');
});
