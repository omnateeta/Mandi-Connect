import { verifyToken } from '../utils/jwt.js';
import { Admin } from '../models/Admin.js';
import { logger } from '../utils/logger.js';

export const authenticateAdmin = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = verifyToken(token);
    
    if (!decoded || decoded.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found or inactive'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    logger.error(`Admin auth error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};
