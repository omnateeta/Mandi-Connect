// Create default admin user
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mandi-connect');

async function createAdmin() {
  try {
    const { Admin } = await import('../src/models/Admin.js');
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'mandiadmin' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      process.exit(0);
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('mandiadmin@123456', salt);
    
    // Create admin
    const admin = await Admin.create({
      username: 'mandiadmin',
      password: hashedPassword,
      role: 'super-admin',
      permissions: [
        'manage_users',
        'manage_crops',
        'manage_orders',
        'view_analytics',
        'manage_admins',
        'fraud_detection'
      ],
      isActive: true
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('   Username: mandiadmin');
    console.log('   Password: mandiadmin@123456');
    console.log('\n📝 You can now login at /admin/login');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdmin();
