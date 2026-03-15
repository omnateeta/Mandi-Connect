import express from 'express';
import mongoose from 'mongoose';
import { Crop } from '../models/Crop.js';
import { Order } from '../models/Order.js';
import { Farmer } from '../models/Farmer.js';
import { authenticate as auth } from '../middleware/auth.js';

const router = express.Router();

// Get crop demand analytics
router.get('/crop-demand', auth, async (req, res) => {
  try {
    const user = req.user;
    
    // Get farmer profile first
    const farmer = await Farmer.findOne({ userId: user.id });
    
    if (!farmer) {
      console.log('⚠️ No farmer profile found for user:', user.id);
      return res.json({
        cropDemand: [],
        orderTrends: [],
        topCrops: [],
        monthlyRevenue: [],
        recommendations: [],
        summary: {
          highDemandCount: 0,
          totalOrders: 0,
          activeListings: 0,
          avgPrice: 0
        }
      });
    }
    
    console.log('🔍 Debug Info:');
    console.log('   User ID from token:', user.id);
    console.log('   User Name:', user.name);
    console.log('   User Role:', user.role);
    console.log('   Farmer Profile ID:', farmer._id);
    
    // Get all crops from this farmer using FARMER ID (not user ID)
    const farmerCrops = await Crop.find({ farmerId: farmer._id }).sort({ createdAt: -1 });
    
    console.log(`📊 Analytics Request for Farmer ID: ${farmer._id}`);
    console.log(`🌾 Found ${farmerCrops.length} crops:`);
    
    if (farmerCrops.length === 0) {
      console.log('⚠️  WARNING: No crops found for this farmer!');
      console.log('   This means crops were added under a DIFFERENT farmer profile.');
      console.log('   Check if you logged in with the same account used to add crops.');
      
      // Check if there are ANY crops for this user
      const cropsWithUserFarmerId = await Crop.find({ farmerId: user.id });
      if (cropsWithUserFarmerId.length > 0) {
        console.log('✅ FOUND CROPS with user.farmerId instead of farmer._id!');
        console.log('   Count:', cropsWithUserFarmerId.length);
        // Use these crops instead
        farmerCrops.push(...cropsWithUserFarmerId);
      }
      
      console.log('\n💡 SOLUTION: You need to re-add crops while logged in as THIS user,');
      console.log('   OR we need to fix the farmerId in existing crops.');
    }
    
    farmerCrops.forEach((crop, idx) => {
      console.log(`   ${idx + 1}. ${crop.category} - ${crop.name}: ${crop.quantity}kg @ ₹${crop.pricePerKg}/kg`);
    });
    
    // Get all orders for these crops
    const cropIds = farmerCrops.map(crop => crop._id);
    const orders = await Order.find({ 
      farmerId: farmer._id,
      'items.cropId': { $in: cropIds },
      status: { $in: ['pending', 'accepted', 'preparing', 'ready_for_pickup', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'] }
    }).populate('items.cropId');
    
    console.log(`📦 Found ${orders.length} orders containing farmer's crops`);

    // Calculate demand vs supply for each crop type
    const cropTypes = {};
    
    farmerCrops.forEach(crop => {
      if (!cropTypes[crop.category]) {
        cropTypes[crop.category] = {
          name: crop.category,
          demand: 0,
          supply: crop.quantity || 0,
          orders: 0,
          revenue: 0
        };
      } else {
        cropTypes[crop.category].supply += crop.quantity || 0;
      }
    });

    // Process orders - extract crop data from items array
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.cropId) {
          const cropType = item.cropId.category;
          if (cropTypes[cropType]) {
            cropTypes[cropType].demand += item.quantity;
            cropTypes[cropType].orders += 1;
            cropTypes[cropType].revenue += item.total;
          }
        }
      });
    });

    // Convert to array and calculate gap
    const cropDemand = Object.values(cropTypes).map(crop => ({
      ...crop,
      gap: crop.demand - crop.supply,
      trend: crop.demand > crop.supply ? 'high' : crop.demand === crop.supply ? 'balanced' : 'low'
    }));

    // Monthly order trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          farmerId: new mongoose.Types.ObjectId(user.id),
          status: { $in: ['pending', 'accepted', 'preparing', 'ready_for_pickup', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'] }
        }
      },
      { $unwind: '$items' },
      {
        $match: {
          'items.cropId': { $in: cropIds.map(id => new mongoose.Types.ObjectId(id)) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          orders: { $sum: 1 },
          totalValue: { $sum: '$items.total' },
          totalQuantity: { $sum: '$items.quantity' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const orderTrends = monthlyOrders.map(data => ({
      month: `${monthNames[data._id.month - 1]} ${data._id.year}`,
      orders: data.orders,
      value: Math.round(data.totalValue / 1000), // In thousands
      quantity: Math.round(data.totalQuantity)
    }));

    // Top crops by orders
    const topCropsData = await Order.aggregate([
      {
        $match: {
          farmerId: new mongoose.Types.ObjectId(user.id),
          status: { $in: ['pending', 'accepted', 'preparing', 'ready_for_pickup', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'] }
        }
      },
      { $unwind: '$items' },
      {
        $match: {
          'items.cropId': { $in: cropIds.map(id => new mongoose.Types.ObjectId(id)) }
        }
      },
      {
        $lookup: {
          from: 'crops',
          localField: 'items.cropId',
          foreignField: '_id',
          as: 'cropInfo'
        }
      },
      { $unwind: '$cropInfo' },
      {
        $group: {
          _id: '$cropInfo.category',
          value: { $sum: '$items.quantity' },
          orders: { $sum: 1 },
          revenue: { $sum: '$items.total' }
        }
      },
      { $sort: { value: -1 } },
      { $limit: 8 }
    ]);

    const topCrops = topCropsData.map(crop => ({
      name: crop._id,
      value: Math.round(crop.value),
      orders: crop.orders,
      revenue: Math.round(crop.revenue)
    }));

    // Monthly revenue (last 6 months)
    const monthlyRevenue = monthlyOrders.map(data => ({
      month: `${monthNames[data._id.month - 1]} ${data._id.year}`,
      revenue: Math.round(data.totalValue / 1000),
      profit: Math.round(data.totalValue * 0.3 / 1000), // Assuming 30% profit margin
      orders: data.orders
    }));

    // Generate recommendations
    const recommendations = [];
    
    const highDemandCrops = cropDemand.filter(c => c.demand > c.supply);
    if (highDemandCrops.length > 0) {
      recommendations.push({
        title: 'Increase Production',
        description: `Consider growing more ${highDemandCrops.map(c => c.name).join(', ')} - demand exceeds supply!`
      });
    }

    const lowDemandCrops = cropDemand.filter(c => c.supply > c.demand && c.supply > 0);
    if (lowDemandCrops.length > 0) {
      recommendations.push({
        title: 'Reduce Overproduction',
        description: `${lowDemandCrops.map(c => c.name).join(', ')} have lower demand. Consider diversifying.`
      });
    }

    if (orderTrends.length > 0 && orderTrends[orderTrends.length - 1].orders > orderTrends[0].orders) {
      recommendations.push({
        title: 'Growing Market',
        description: 'Your orders are trending upward! Prepare for increased demand.'
      });
    }

    // Summary statistics
    const summary = {
      highDemandCount: highDemandCrops.length,
      totalOrders: orders.length,
      activeListings: farmerCrops.filter(c => c.availableQuantity > 0).length,
      avgPrice: farmerCrops.length > 0 
        ? Math.round(farmerCrops.reduce((sum, c) => sum + (c.price || 0), 0) / farmerCrops.length)
        : 0
    };

    res.json({
      cropDemand,
      orderTrends,
      topCrops,
      monthlyRevenue,
      recommendations,
      summary
    });
    
    console.log('✅ Analytics response sent successfully');
    console.log(`   - Crop Demand Items: ${cropDemand.length}`);
    console.log(`   - Order Trend Months: ${orderTrends.length}`);
    console.log(`   - Top Crops: ${topCrops.length}`);
    console.log(`   - Recommendations: ${recommendations.length}`);

  } catch (error) {
    console.error('❌ Analytics error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error fetching analytics', error: error.message });
  }
});

export default router;
