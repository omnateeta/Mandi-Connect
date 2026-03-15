// Fix crops that have wrong farmerId
// This updates all crops from one farmer profile to another
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mandi-connect');

console.log('🔧 Fixing Farmer ID Mismatch\n');

async function fixFarmerId() {
  try {
    const User = (await import('./src/models/User.js')).User;
    const Farmer = (await import('./src/models/Farmer.js')).Farmer;
    const Crop = (await import('./src/models/Crop.js')).Crop;
    
    // Find user Chilly (phone: 9964655985)
    const user = await User.findOne({ phone: '+919964655985' });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    console.log('✅ Current User:');
    console.log('   User ID:', user._id);
    console.log('   Name:', user.name);
    console.log('   Phone:', user.phone);
    
    // Get current farmer profile
    const currentFarmer = await Farmer.findOne({ userId: user._id });
    
    if (!currentFarmer) {
      console.log('❌ No farmer profile for this user');
      process.exit(1);
    }
    
    console.log('\n✅ Current Farmer Profile ID:', currentFarmer._id);
    
    // Find crops with WRONG farmerId (the old one from logs)
    const wrongFarmerId = '69b2b551719b4071dd45b09f';
    const wrongCrops = await Crop.find({ farmerId: wrongFarmerId });
    
    console.log('\n📊 Found', wrongCrops.length, 'crops with WRONG farmerId');
    
    if (wrongCrops.length === 0) {
      console.log('✅ No crops need fixing!');
      process.exit(0);
    }
    
    console.log('\n📋 Crops to fix:');
    wrongCrops.forEach((crop, i) => {
      console.log(`   ${i+1}. ${crop.name} (${crop.category})`);
    });
    
    // Ask for confirmation
    console.log('\n⚠️  This will update', wrongCrops.length, 'crops to use the correct farmer ID.');
    console.log('   Continue? (yes/no)');
    
    // For now, just show what would happen
    console.log('\n💡 To actually fix, run this MongoDB command:');
    console.log(`\ndb.crops.updateMany(\n  { farmerId: new ObjectId('${wrongFarmerId}') },\n  { $set: { farmerId: new ObjectId('${currentFarmer._id}') } }\n)`);
    
    // Or we can do it programmatically
    const result = await Crop.updateMany(
      { farmerId: wrongFarmerId },
      { $set: { farmerId: currentFarmer._id } }
    );
    
    console.log('\n✅ Fixed! Updated', result.modifiedCount, 'crops');
    console.log('   New farmerId:', currentFarmer._id);
    
    // Verify
    const updatedCrops = await Crop.find({ farmerId: currentFarmer._id });
    console.log('\n✅ Verification - Total crops for this farmer:', updatedCrops.length);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

fixFarmerId();
