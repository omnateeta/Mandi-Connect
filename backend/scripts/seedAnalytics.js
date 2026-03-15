const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mandi-connect', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

console.log('🌱 Seeding analytics data...');

async function seedAnalytics() {
  try {
    // Import models
    const Crop = require('./src/models/Crop');
    const Order = require('./src/models/Order');
    const User = require('./src/models/User');

    // Find a farmer user
    const farmer = await User.findOne({ role: 'farmer' });
    
    if (!farmer) {
      console.log('❌ No farmer found. Please create a farmer account first.');
      process.exit(1);
    }

    console.log(`Found farmer: ${farmer.name}`);

    // Create sample crops
    const sampleCrops = [
      { category: 'vegetables', name: 'Chilli', variety: 'G4', quantity: 500, pricePerKg: 22 },
      { category: 'grains', name: 'Wheat', variety: 'HD-2967', quantity: 300, pricePerKg: 45 },
      { category: 'grains', name: 'Corn', variety: 'Hybrid', quantity: 400, pricePerKg: 18 },
      { category: 'oilseeds', name: 'Soybean', variety: 'JS-335', quantity: 250, pricePerKg: 35 },
      { category: 'fibers', name: 'Cotton', variety: 'Bt Cotton', quantity: 150, pricePerKg: 65 },
      { category: 'grains', name: 'Rice', variety: 'Basmati', quantity: 600, pricePerKg: 12 },
    ];

    // Delete existing crops for this farmer
    await Crop.deleteMany({ farmerId: farmer._id });
    console.log('Deleted existing crops');

    // Create new crops
    const createdCrops = [];
    for (const cropData of sampleCrops) {
      const crop = await Crop.create({
        ...cropData,
        farmerId: farmer._id,
        location: {
          type: 'Point',
          coordinates: [74.384, 16.436] // Kolhapur coordinates
        },
        harvestDate: new Date(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        images: []
      });
      createdCrops.push(crop);
      console.log(`✅ Created crop: ${crop.name} (${crop.quantity} kg @ ₹${crop.pricePerKg}/kg)`);
    }

    // Find retailers (need Retailer model)
    const Retailer = require('./src/models/Retailer');
    const retailers = await Retailer.find({}).populate('userId');
    
    if (retailers.length === 0) {
      console.log('⚠️  No retailers found. Creating sample orders with mock data.');
    }

    // Create sample orders for last 6 months
    const orderStatuses = ['pending', 'accepted', 'delivered'];
    const now = new Date();
    
    for (let i = 0; i < 30; i++) {
      const randomCrop = createdCrops[Math.floor(Math.random() * createdCrops.length)];
      const randomRetailer = retailers.length > 0 
        ? retailers[Math.floor(Math.random() * retailers.length)]
        : null;
      
      // If no retailer exists, skip creating this order or create a minimal one
      if (!randomRetailer) {
        console.log('⚠️  Skipping order - no retailers available');
        continue;
      }
      
      const orderDate = new Date(now);
      orderDate.setMonth(orderDate.getMonth() - Math.floor(i / 5));
      
      const quantity = Math.floor(Math.random() * 100) + 20;
      const totalPrice = quantity * randomCrop.pricePerKg;
      
      await Order.create({
        orderNumber: `ORD-${Date.now()}-${i}`,
        retailerId: randomRetailer._id,
        farmerId: farmer._id,
        items: [{
          cropId: randomCrop._id,
          quantity: quantity,
          pricePerKg: randomCrop.pricePerKg,
          total: totalPrice
        }],
        totalAmount: totalPrice,
        finalAmount: totalPrice,
        status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
        paymentStatus: 'paid',
        deliveryAddress: {
          fullAddress: 'Sample Address, Kolhapur',
          landmark: 'Near Market Yard',
          city: 'Kolhapur',
          state: 'Maharashtra',
          pincode: '416001'
        }
      });
      
      if (i % 5 === 0) {
        console.log(`✅ Created order ${i + 1}/30 for ${randomCrop.name}`);
      }
    }

    console.log('\n✅ Analytics data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Crops created: ${createdCrops.length}`);
    console.log(`- Orders created: 30`);
    console.log(`- Time range: Last 6 months`);
    console.log('\nNow you can view the analytics dashboard at: http://localhost:5174/farmer/analytics');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seedAnalytics();
