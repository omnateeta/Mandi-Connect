// Diagnostic script to check crops for farmer with phone 9964655985
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mandi-connect');

console.log('🔍 Checking crops for farmer phone: +919964655985\n');

async function diagnose() {
  try {
    const User = (await import('./src/models/User.js')).User;
    const Farmer = (await import('./src/models/Farmer.js')).Farmer;
    const Crop = (await import('./src/models/Crop.js')).Crop;
    
    // Find user by phone
    const user = await User.findOne({ phone: '+919964655985' });
    
    if (!user) {
      console.log('❌ No user found with phone +919964655985');
      process.exit(1);
    }
    
    console.log('✅ User Found:');
    console.log('   ID:', user._id);
    console.log('   Name:', user.name);
    console.log('   Phone:', user.phone);
    console.log('   Role:', user.role);
    console.log('');
    
    // Find farmer profile
    const farmer = await Farmer.findOne({ userId: user._id });
    
    if (!farmer) {
      console.log('⚠️  No farmer profile found for this user');
    } else {
      console.log('✅ Farmer Profile Found:');
      console.log('   Farmer ID:', farmer._id);
      console.log('   Farm Name:', farmer.farmName);
      console.log('');
    }
    
    // Find crops
    const crops = await Crop.find({ farmerId: user._id });
    
    console.log(`📊 Crops Found: ${crops.length}`);
    if (crops.length > 0) {
      console.log('\nCrop Details:');
      crops.forEach((crop, idx) => {
        console.log(`   ${idx + 1}. ${crop.name} (${crop.category})`);
        console.log(`      Quantity: ${crop.quantity}kg`);
        console.log(`      Price: ₹${crop.pricePerKg}/kg`);
        console.log(`      Available: ${crop.isAvailable ? 'YES' : 'NO'}`);
        console.log('');
      });
    } else {
      console.log('   ⚠️  NO CROPS FOUND for this farmer!');
      console.log('\n💡 Possible Issues:');
      console.log('   1. Crops might be saved with wrong farmerId');
      console.log('   2. Crops might be under a different user account');
      console.log('   3. Database mismatch (wrong connection)');
      
      // Check total crops in DB
      const totalCrops = await Crop.countDocuments();
      console.log(`\n📈 Total crops in database: ${totalCrops}`);
      
      if (totalCrops > 0) {
        console.log('\n📋 Sample crops from other farmers:');
        const sampleCrops = await Crop.find().limit(5).select('farmerId name category quantity');
        sampleCrops.forEach(crop => {
          console.log(`   - ${crop.name}: farmerId=${crop.farmerId}`);
        });
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

diagnose();
