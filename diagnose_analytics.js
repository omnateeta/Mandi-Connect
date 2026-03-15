// Quick Diagnostic Script for Crop Analytics Issue
// Run this in your browser console (F12 → Console tab)

console.group('🔍 CROP ANALYTICS DIAGNOSTIC');

// 1. Check Token
const token = localStorage.getItem('token');
console.log('\n1️⃣ Authentication Status:');
console.log('   Token exists:', !!token);

if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('   User ID:', payload.id);
    console.log('   User Name:', payload.name);
    console.log('   User Role:', payload.role);
    console.log('   Token Expires:', new Date(payload.exp * 1000).toLocaleString());
  } catch (e) {
    console.error('   ❌ Invalid token format');
  }
} else {
  console.error('   ❌ No token found - Please login first!');
}

// 2. Test API Endpoint
console.log('\n2️⃣ Testing Analytics API...');

fetch('/api/v1/analytics/crop-demand', {
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('   Response Status:', response.status, response.ok ? '✅' : '❌');
  return response.json();
})
.then(data => {
  console.group('   📊 Analytics Response:');
  
  // Check crops
  const cropCount = data.cropDemand?.length || 0;
  console.log('   Crops Found:', cropCount);
  
  if (cropCount === 0) {
    console.warn('   ⚠️  ZERO CROPS RETURNED!');
    console.log('   This means either:');
    console.log('      a) Backend hasn\'t been restarted (most likely)');
    console.log('      b) You\'re logged in as wrong user');
    console.log('      c) No crops exist for this farmer');
  } else {
    console.log('   ✅ Crops retrieved successfully!');
    data.cropDemand.forEach((crop, i) => {
      console.log(`      ${i+1}. ${crop.name} (${crop.category}): ${crop.supply}kg`);
    });
  }
  
  // Check summary
  console.log('   Summary Stats:');
  console.log('      - High Demand Crops:', data.summary?.highDemandCount || 0);
  console.log('      - Total Orders:', data.summary?.totalOrders || 0);
  console.log('      - Active Listings:', data.summary?.activeListings || 0);
  console.log('      - Avg Price/kg: ₹', data.summary?.avgPrice || 0);
  
  // Check recommendations
  const recCount = data.recommendations?.length || 0;
  console.log('   Recommendations:', recCount);
  if (recCount > 0) {
    data.recommendations.forEach((rec, i) => {
      console.log(`      ${i+1}. ${rec.title}`);
    });
  }
  
  console.groupEnd();
  
  // 3. Final Verdict
  console.log('\n3️⃣ DIAGNOSIS:');
  if (cropCount === 0) {
    console.error('   ❌ ISSUE CONFIRMED: Backend returning 0 crops');
    console.error('   📋 ACTION REQUIRED:');
    console.error('      1. Stop backend server (Ctrl+C)');
    console.error('      2. Restart: npm start or npm run dev');
    console.error('      3. Refresh analytics page');
    console.error('      4. Check backend terminal for debug logs');
  } else {
    console.log('   ✅ EVERYTHING LOOKS GOOD!');
    console.log('   If charts still not showing, check frontend code');
  }
  
  console.groupEnd();
})
.catch(error => {
  console.error('\n❌ API Error:', error.message);
  console.error('   Possible issues:');
  console.error('      - Backend server not running');
  console.error('      - Wrong API endpoint');
  console.error('      - Network connectivity issue');
});

console.log('\nℹ️  Remember to check your backend terminal for detailed logs!');
console.log('   Look for messages starting with 📊 and 🌾');
