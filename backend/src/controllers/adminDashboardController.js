import { User, Farmer, Retailer, Crop, Order } from '../models/index.js';
import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

// @desc    Get admin dashboard analytics
// @route   GET /api/v1/admin/dashboard
// @access  Private (Admin only)
export const getAdminDashboard = async (req, res) => {
  try {
    // Overall statistics
    const totalUsers = await User.countDocuments();
    const totalFarmers = await Farmer.countDocuments();
    const totalRetailers = await Retailer.countDocuments();
    const totalCrops = await Crop.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    // Active users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeFarmers = await Farmer.countDocuments({
      updatedAt: { $gte: thirtyDaysAgo }
    });
    const activeRetailers = await Retailer.countDocuments({
      updatedAt: { $gte: thirtyDaysAgo }
    });

    // Revenue calculation (total order value)
    const orders = await Order.find().select('totalAmount paymentStatus');
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const paidRevenue = orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Top farmers by crops sold
    const topFarmers = await Order.aggregate([
      {
        $group: {
          _id: '$farmerId',
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'farmers',
          localField: '_id',
          foreignField: '_id',
          as: 'farmer'
        }
      },
      { $unwind: '$farmer' },
      {
        $project: {
          farmerId: '$_id',
          farmerName: '$farmer.farmName',
          totalOrders: 1,
          totalRevenue: 1
        }
      }
    ]);

    // Top retailers by orders
    const topRetailers = await Order.aggregate([
      {
        $group: {
          _id: '$retailerId',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' }
        }
      },
      { $sort: { totalOrders: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'retailers',
          localField: '_id',
          foreignField: '_id',
          as: 'retailer'
        }
      },
      { $unwind: '$retailer' },
      {
        $project: {
          retailerId: '$_id',
          businessName: '$retailer.businessName',
          totalOrders: 1,
          totalSpent: 1
        }
      }
    ]);

    // Top crops by quantity sold
    const topCrops = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.cropId',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'crops',
          localField: '_id',
          foreignField: '_id',
          as: 'crop'
        }
      },
      { $unwind: '$crop' },
      {
        $project: {
          cropId: '$_id',
          cropName: '$crop.name',
          category: '$crop.category',
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1
        }
      }
    ]);

    // Recent activity
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('farmerId', 'farmName')
      .populate('retailerId', 'businessName');

    // Growth metrics (this month vs last month)
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);
    
    const lastMonthStart = new Date(thisMonthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: thisMonthStart }
    });
    const newUsersLastMonth = await User.countDocuments({
      createdAt: { $gte: lastMonthStart, $lt: thisMonthStart }
    });
    
    const userGrowth = lastMonthStart > 0 
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalFarmers,
          totalRetailers,
          totalCrops,
          totalOrders,
          activeFarmers,
          activeRetailers,
          totalRevenue,
          paidRevenue
        },
        topFarmers,
        topRetailers,
        topCrops,
        recentOrders,
        growth: {
          newUsersThisMonth,
          newUsersLastMonth,
          growthPercentage: userGrowth.toFixed(2)
        }
      }
    });
  } catch (error) {
    logger.error(`Get admin dashboard error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard data'
    });
  }
};

// @desc    Detect potential fraud
// @route   GET /api/v1/admin/fraud-detection
// @access  Private (Admin only)
export const getFraudDetection = async (req, res) => {
  try {
    const flags = [];

    // 1. Users with multiple accounts (same phone, different names)
    const duplicatePhones = await User.aggregate([
      {
        $group: {
          _id: '$phone',
          count: { $sum: 1 },
          users: { $push: { id: '$_id', name: '$name', role: '$role' } }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]);

    if (duplicatePhones.length > 0) {
      flags.push({
        type: 'duplicate_accounts',
        severity: 'high',
        count: duplicatePhones.length,
        details: duplicatePhones
      });
    }

    // 2. Unusual order patterns (very high value orders)
    const avgOrderValue = await Order.aggregate([
      { $group: { _id: null, avg: { $avg: '$totalAmount' } } }
    ]);
    
    const highValueOrders = await Order.find({
      totalAmount: { $gt: (avgOrderValue[0]?.avg || 0) * 5 }
    })
    .limit(20)
    .populate('farmerId', 'farmName')
    .populate('retailerId', 'businessName');

    if (highValueOrders.length > 0) {
      flags.push({
        type: 'unusual_order_value',
        severity: 'medium',
        count: highValueOrders.length,
        details: highValueOrders.map(o => ({
          orderId: o.orderNumber,
          amount: o.totalAmount,
          farmer: o.farmerId?.farmName,
          retailer: o.retailerId?.businessName
        }))
      });
    }

    // 3. Farmers with very low trust scores
    const lowTrustFarmers = await Farmer.find({
      trustScore: { $lt: 30 }
    })
    .limit(20)
    .populate('userId', 'name phone');

    if (lowTrustFarmers.length > 0) {
      flags.push({
        type: 'low_trust_farmers',
        severity: 'high',
        count: lowTrustFarmers.length,
        details: lowTrustFarmers.map(f => ({
          farmerId: f._id,
          farmName: f.farmName,
          trustScore: f.trustScore,
          phone: f.userId?.phone
        }))
      });
    }

    // 4. Orders with disputed status
    const disputedOrders = await Order.find({
      status: 'disputed'
    })
    .limit(20)
    .populate('farmerId', 'farmName')
    .populate('retailerId', 'businessName');

    if (disputedOrders.length > 0) {
      flags.push({
        type: 'disputed_orders',
        severity: 'critical',
        count: disputedOrders.length,
        details: disputedOrders
      });
    }

    // 5. Rapid account creation (potential bot activity)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    const rapidSignups = await User.countDocuments({
      createdAt: { $gte: oneHourAgo }
    });

    if (rapidSignups > 10) {
      flags.push({
        type: 'rapid_signups',
        severity: 'medium',
        count: rapidSignups,
        message: `${rapidSignups} accounts created in the last hour`
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalFlags: flags.reduce((sum, flag) => sum + flag.count, 0),
        flags,
        summary: {
          critical: flags.filter(f => f.severity === 'critical').length,
          high: flags.filter(f => f.severity === 'high').length,
          medium: flags.filter(f => f.severity === 'medium').length
        }
      }
    });
  } catch (error) {
    logger.error(`Fraud detection error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error during fraud detection'
    });
  }
};

// @desc    Get detailed farmer analytics
// @route   GET /api/v1/admin/farmers/analytics
// @access  Private (Admin only)
export const getFarmerAnalytics = async (req, res) => {
  try {
    // Get all farmers with their stats
    const farmers = await Farmer.find()
      .populate('userId', 'name phone email')
      .sort({ trustScore: -1 });

    // Calculate analytics for each farmer
    const farmerAnalytics = await Promise.all(
      farmers.map(async (farmer) => {
        // Get crops count
        const cropsCount = await Crop.countDocuments({ farmerId: farmer._id });
        
        // Get orders count and revenue
        const orders = await Order.find({ farmerId: farmer._id })
          .select('totalAmount status createdAt');
        
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        // Get monthly revenue (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const monthlyData = await Order.aggregate([
          {
            $match: {
              farmerId: farmer._id,
              createdAt: { $gte: sixMonthsAgo },
              status: { $in: ['delivered', 'picked_up', 'paid'] }
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              revenue: { $sum: '$totalAmount' },
              orders: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Get top crops by quantity sold
        const topCrops = await Order.aggregate([
          { $match: { farmerId: farmer._id } },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.cropId',
              totalQuantity: { $sum: '$items.quantity' },
              totalRevenue: { $sum: '$items.total' },
              orderCount: { $sum: 1 }
            }
          },
          { $sort: { totalQuantity: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'crops',
              localField: '_id',
              foreignField: '_id',
              as: 'crop'
            }
          },
          { $unwind: '$crop' },
          {
            $project: {
              cropName: '$crop.name',
              category: '$crop.category',
              totalQuantity: 1,
              totalRevenue: 1,
              orderCount: 1
            }
          }
        ]);

        return {
          farmerId: farmer._id,
          farmName: farmer.farmName,
          ownerName: farmer.userId?.name,
          phone: farmer.userId?.phone,
          email: farmer.userId?.email,
          location: farmer.location,
          trustScore: farmer.trustScore,
          joinDate: farmer.createdAt,
          stats: {
            totalCrops: cropsCount,
            totalOrders,
            totalRevenue,
            avgOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0
          },
          monthlyRevenue: monthlyData,
          topCrops
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        farmers: farmerAnalytics,
        summary: {
          totalFarmers: farmerAnalytics.length,
          avgTrustScore: (farmerAnalytics.reduce((sum, f) => sum + f.trustScore, 0) / farmerAnalytics.length).toFixed(2),
          totalRevenue: farmerAnalytics.reduce((sum, f) => sum + f.stats.totalRevenue, 0)
        }
      }
    });
  } catch (error) {
    logger.error(`Get farmer analytics error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error fetching farmer analytics'
    });
  }
};

// @desc    Get detailed retailer analytics
// @route   GET /api/v1/admin/retailers/analytics
// @access  Private (Admin only)
export const getRetailerAnalytics = async (req, res) => {
  try {
    // Get all retailers with their stats
    const retailers = await Retailer.find()
      .populate('userId', 'name phone email')
      .sort({ trustScore: -1 });

    // Calculate analytics for each retailer
    const retailerAnalytics = await Promise.all(
      retailers.map(async (retailer) => {
        // Get orders count and spending
        const orders = await Order.find({ retailerId: retailer._id })
          .select('totalAmount status createdAt');
        
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        // Get monthly data (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const monthlyData = await Order.aggregate([
          {
            $match: {
              retailerId: retailer._id,
              createdAt: { $gte: sixMonthsAgo }
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              spent: { $sum: '$totalAmount' },
              orders: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Get most ordered crops
        const topCrops = await Order.aggregate([
          { $match: { retailerId: retailer._id } },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.cropId',
              totalQuantity: { $sum: '$items.quantity' },
              totalSpent: { $sum: '$items.total' },
              orderCount: { $sum: 1 }
            }
          },
          { $sort: { orderCount: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'crops',
              localField: '_id',
              foreignField: '_id',
              as: 'crop'
            }
          },
          { $unwind: '$crop' },
          {
            $project: {
              cropName: '$crop.name',
              category: '$crop.category',
              totalQuantity: 1,
              totalSpent: 1,
              orderCount: 1
            }
          }
        ]);

        // Get preferred farmers (most ordered from)
        const topFarmers = await Order.aggregate([
          { $match: { retailerId: retailer._id } },
          {
            $group: {
              _id: '$farmerId',
              orderCount: { $sum: 1 },
              totalSpent: { $sum: '$totalAmount' }
            }
          },
          { $sort: { orderCount: -1 } },
          { $limit: 3 },
          {
            $lookup: {
              from: 'farmers',
              localField: '_id',
              foreignField: '_id',
              as: 'farmer'
            }
          },
          { $unwind: '$farmer' },
          {
            $project: {
              farmerName: '$farmer.farmName',
              orderCount: 1,
              totalSpent: 1
            }
          }
        ]);

        return {
          retailerId: retailer._id,
          businessName: retailer.businessName,
          ownerName: retailer.userId?.name,
          phone: retailer.userId?.phone,
          email: retailer.userId?.email,
          location: retailer.location,
          trustScore: retailer.trustScore,
          joinDate: retailer.createdAt,
          stats: {
            totalOrders,
            totalSpent,
            avgOrderValue: totalOrders > 0 ? (totalSpent / totalOrders).toFixed(2) : 0
          },
          monthlyData,
          topCrops,
          topFarmers
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        retailers: retailerAnalytics,
        summary: {
          totalRetailers: retailerAnalytics.length,
          avgTrustScore: (retailerAnalytics.reduce((sum, r) => sum + r.trustScore, 0) / retailerAnalytics.length).toFixed(2),
          totalSpent: retailerAnalytics.reduce((sum, r) => sum + r.stats.totalSpent, 0)
        }
      }
    });
  } catch (error) {
    logger.error(`Get retailer analytics error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error fetching retailer analytics'
    });
  }
};
