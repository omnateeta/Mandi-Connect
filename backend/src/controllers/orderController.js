import { validationResult } from 'express-validator';
import { Order, Crop, Farmer, Retailer, Notification } from '../models/index.js';
import { logger } from '../utils/logger.js';

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private (Retailer only)
export const createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const retailer = await Retailer.findOne({ userId: req.user.id });
    if (!retailer) {
      return res.status(404).json({
        success: false,
        message: 'Retailer profile not found'
      });
    }

    const { items, deliveryAddress, deliveryType, preferredDeliveryDate, specialInstructions } = req.body;

    // Validate crops and calculate totals
    let totalAmount = 0;
    const orderItems = [];
    let farmerId = null;

    for (const item of items) {
      const crop = await Crop.findById(item.cropId);
      if (!crop) {
        return res.status(404).json({
          success: false,
          message: `Crop ${item.cropId} not found`
        });
      }

      if (!crop.isAvailable || crop.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Crop ${crop.name} is not available in requested quantity`
        });
      }

      if (!farmerId) {
        farmerId = crop.farmerId;
      } else if (farmerId.toString() !== crop.farmerId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'All items must be from the same farmer'
        });
      }

      const itemTotal = crop.pricePerKg * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        cropId: crop._id,
        quantity: item.quantity,
        pricePerKg: crop.pricePerKg,
        total: itemTotal,
        quality: crop.quality
      });
    }

    const platformFee = totalAmount * 0.02; // 2% platform fee
    const finalAmount = totalAmount + platformFee;

    // Generate order number manually
    const date = new Date();
    const prefix = 'MC';
    const timestamp = date.getTime().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    const orderNumber = `${prefix}${timestamp}${random}`;

    // Set default delivery address if not provided
    const defaultDeliveryAddress = {
      fullAddress: deliveryAddress?.fullAddress || retailer.address || 'Not provided',
      landmark: deliveryAddress?.landmark || '',
      coordinates: deliveryAddress?.coordinates || { lat: 0, lng: 0 }
    };

    const order = await Order.create({
      orderNumber,
      retailerId: retailer._id,
      farmerId,
      items: orderItems,
      totalAmount,
      platformFee,
      finalAmount,
      deliveryAddress: defaultDeliveryAddress,
      deliveryType: deliveryType || 'farmer_delivery',
      preferredDeliveryDate: preferredDeliveryDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      specialInstructions: specialInstructions || ''
    });

    // Create notification for farmer
    await Notification.create({
      userId: farmerId,
      type: 'order_placed',
      title: 'New Order Received',
      message: `You have received a new order worth ₹${finalAmount}`,
      referenceId: order._id,
      referenceModel: 'Order',
      priority: 'high'
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });
  } catch (error) {
    logger.error(`Create order error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/v1/orders/:id
// @access  Private
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('farmerId', 'farmName phone location')
      .populate('retailerId', 'businessName phone location')
      .populate('items.cropId', 'name images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    const user = req.user;
    const farmer = await Farmer.findOne({ userId: user.id });
    const retailer = await Retailer.findOne({ userId: user.id });

    const isAuthorized = 
      (farmer && order.farmerId._id.toString() === farmer._id.toString()) ||
      (retailer && order.retailerId._id.toString() === retailer._id.toString()) ||
      user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    logger.error(`Get order error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get order'
    });
  }
};

// @desc    Update order status
// @route   PUT /api/v1/orders/:id/status
// @access  Private (Farmer & Retailer)
export const updateOrderStatus = async (req, res) => {
  try {
    console.log('=== UPDATE ORDER STATUS CALLED ===');
    console.log('Order ID:', req.params.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user);
    
    const { status, location, description, liveLocation, cropFieldInfo, driverInfo } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      console.log('Order not found!');
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    console.log('Order found:', order._id);

    // Check authorization based on status change
    const user = req.user;
    const farmer = await Farmer.findOne({ userId: user.id });
    const retailer = await Retailer.findOne({ userId: user.id });
    
    console.log('Farmer profile:', farmer?._id);
    console.log('Retailer profile:', retailer?._id);
    console.log('Order farmerId:', order.farmerId?.toString());
    console.log('Order retailerId:', order.retailerId?.toString());

    let isAuthorized = false;
    let notificationUserId = null;

    if (farmer && order.farmerId.toString() === farmer._id.toString()) {
      // Farmer can update orders they own
      console.log('User is the farmer - authorized');
      isAuthorized = true;
      notificationUserId = order.retailerId;
    } else if (retailer && order.retailerId.toString() === retailer._id.toString()) {
      // Retailer can: cancel (before acceptance), confirm delivery
      console.log('User is the retailer - checking permissions');
      isAuthorized = 
        (status === 'cancelled' && order.status === 'pending') ||
        (status === 'delivered' && ['out_for_delivery', 'in_transit'].includes(order.status));
      notificationUserId = order.farmerId;
    } else if (user.role === 'admin') {
      console.log('User is admin - authorized');
      isAuthorized = true;
    }
    
    console.log('Authorization result:', isAuthorized);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order status'
      });
    }

    // Use enhanced updateStatus with live location
    console.log('Updating order status:', { 
      orderId: req.params.id, 
      status: status || order.status,
      hasLiveLocation: !!liveLocation,
      hasCropFieldInfo: !!cropFieldInfo,
      hasDriverInfo: !!driverInfo
    });
    
    // Prepare all updates before saving
    const updateData = {};
    
    // Update crop field info if provided by farmer
    if (cropFieldInfo && farmer) {
      console.log('Preparing crop field info update...');
      // Transform field coordinates if present
      const transformedCropFieldInfo = { ...cropFieldInfo };
      if (transformedCropFieldInfo.fieldCoordinates) {
        // Keep as is
      } else if (cropFieldInfo.latitude && cropFieldInfo.longitude) {
        transformedCropFieldInfo.fieldCoordinates = {
          latitude: cropFieldInfo.latitude,
          longitude: cropFieldInfo.longitude
        };
      }
      
      updateData.cropFieldInfo = {
        ...order.cropFieldInfo,
        ...transformedCropFieldInfo
      };
    }

    // Update driver info if provided
    if (driverInfo && farmer) {
      console.log('Preparing driver info update...');
      updateData.currentDriver = {
        ...order.currentDriver,
        ...driverInfo
      };
    }
    
    // Call updateStatus which will save
    await order.updateStatus(
      status || order.status,
      user.id,
      location,
      description,
      liveLocation?.coordinates
    );
    
    console.log('Order status updated successfully');
    
    // Apply additional updates if any
    if (Object.keys(updateData).length > 0) {
      console.log('Applying additional updates...');
      Object.assign(order, updateData);
      await order.save();
      console.log('Additional updates applied');
    }

    // Create notification
    if (notificationUserId) {
      try {
        await Notification.create({
          userId: notificationUserId,
          type: `order_${status}`,
          title: `Order ${status.replace('_', ' ').toUpperCase()}`,
          message: `Order #${order.orderNumber} has been ${status}`,
          referenceId: order._id,
          referenceModel: 'Order'
        });
      } catch (notifError) {
        logger.error(`Failed to create notification: ${notifError.message}`);
        // Continue even if notification fails
      }
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    logger.error(`Update order status error: ${error.message}`);
    console.error('Full error:', error);
    res.status(500).json({
      success: false,
      message: `Failed to update order status: ${error.message}`
    });
  }
};

// @desc    Get order tracking with live location & field info
// @route   PUT /api/v1/orders/:id/location
// @desc    Update order live location only
// @access  Private (Farmer)
export const updateOrderLocation = async (req, res) => {
  try {
    const { liveLocation } = req.body;

    if (!liveLocation || !liveLocation.coordinates) {
      return res.status(400).json({
        success: false,
        message: 'Live location coordinates are required'
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only farmer can update location
    const farmer = await Farmer.findOne({ userId: req.user.id });
    if (!farmer || order.farmerId.toString() !== farmer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update location'
      });
    }

    // Update location
    order.liveLocation = liveLocation;
    order.lastLocationUpdate = Date.now();
    
    await order.save();

    logger.info(`Order ${order._id} location updated by farmer ${farmer._id}`);

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: {
        liveLocation: order.liveLocation,
        lastLocationUpdate: order.lastLocationUpdate
      }
    });
  } catch (error) {
    logger.error(`Update order location error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to update location'
    });
  }
};

// @route   GET /api/v1/orders/:id/tracking
// @access  Private (Farmer & Retailer)
export const getOrderTracking = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('farmerId', 'farmName phone location primaryCrops')
      .populate('retailerId', 'businessName phone deliveryAddresses');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    const user = req.user;
    const farmer = await Farmer.findOne({ userId: user.id });
    const retailer = await Retailer.findOne({ userId: user.id });

    const isAuthorized = 
      (farmer && order.farmerId._id.toString() === farmer._id.toString()) ||
      (retailer && order.retailerId._id.toString() === retailer._id.toString()) ||
      user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    // Get enhanced tracking info
    const trackingInfo = order.getTrackingInfo();

    res.status(200).json({
      success: true,
      data: {
        ...trackingInfo,
        items: order.items,
        totalAmount: order.totalAmount,
        deliveryType: order.deliveryType,
        farmer: order.farmerId,
        retailer: order.retailerId
      }
    });
  } catch (error) {
    logger.error(`Get order tracking error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get order tracking'
    });
  }
};
