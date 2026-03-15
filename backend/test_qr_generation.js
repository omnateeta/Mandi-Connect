// Test QR Code Generation API
import axios from 'axios';

const API_URL = 'http://localhost:5002/api/v1';

async function testQRGeneration() {
  try {
    console.log('=== Testing QR Code Generation ===\n');
    
    // Step 1: Login as retailer to get token
    console.log('Step 1: Logging in as retailer...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      phone: '9876543210', // Replace with actual retailer phone
      password: 'password123' // Replace with actual password
    });
    
    if (!loginResponse.data.success) {
      console.error('Login failed:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('✓ Login successful, token received\n');
    
    // Step 2: Get retailer's orders
    console.log('Step 2: Fetching retailer orders...');
    const ordersResponse = await axios.get(`${API_URL}/orders/retailer/my-orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!ordersResponse.data.success || ordersResponse.data.data.orders.length === 0) {
      console.log('No orders found. Please create an order first.');
      return;
    }
    
    const orders = ordersResponse.data.data.orders;
    console.log(`✓ Found ${orders.length} order(s)\n`);
    
    // Step 3: Test QR generation for each order
    for (const order of orders) {
      console.log(`\n--- Testing Order: ${order.orderNumber} ---`);
      console.log(`Order ID: ${order._id}`);
      console.log(`Total Amount: ₹${order.totalAmount}`);
      console.log(`Final Amount: ₹${order.finalAmount}`);
      console.log(`Payment Status: ${order.paymentStatus}`);
      
      if (order.paymentStatus === 'paid') {
        console.log('⊘ Order already paid, skipping...\n');
        continue;
      }
      
      try {
        console.log('\nGenerating QR Code...');
        const qrResponse = await axios.post(
          `${API_URL}/payments/generate-qr/${order._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (qrResponse.data.success) {
          console.log('✓ QR Code generated successfully!');
          console.log(`Payment Amount: ₹${qrResponse.data.data.payment.amount}`);
          console.log(`Transaction ID: ${qrResponse.data.data.payment.transactionId}`);
          console.log(`UPI Address: ${qrResponse.data.data.upiDetails.vpa}`);
          console.log(`Farmer Name: ${qrResponse.data.data.upiDetails.name}`);
          console.log(`QR Code Size: ${qrResponse.data.data.qrCode.length} bytes`);
          
          // Verify the amount matches order final amount
          if (qrResponse.data.data.payment.amount === order.finalAmount) {
            console.log('✓ Payment amount matches order final amount!');
          } else {
            console.log('⚠ WARNING: Payment amount does NOT match order final amount!');
          }
        } else {
          console.error('✗ QR generation failed:', qrResponse.data.message);
        }
      } catch (error) {
        console.error('✗ Error generating QR:', error.response?.data?.message || error.message);
      }
      
      console.log('----------------------------------------\n');
    }
    
    console.log('\n=== Test Complete ===\n');
  } catch (error) {
    console.error('\n=== Test Failed ===');
    console.error('Error:', error.response?.data?.message || error.message);
    if (error.response?.status === 401) {
      console.log('Authentication failed. Please check your credentials.');
    }
  }
}

// Run the test
testQRGeneration();
