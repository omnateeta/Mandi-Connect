# 🧪 Testing Crop Analytics Dashboard - Real-Time Verification

## ✅ Pre-Flight Checklist

Before testing, ensure:
1. Backend server is running on `http://localhost:5002`
2. Frontend is running on `http://localhost:5173`
3. MongoDB is connected and accessible
4. You have at least one farmer account with crops

---

## 🔍 Test 1: Verify Backend Route is Working

### Step 1: Login as Farmer
1. Open your browser DevTools (F12)
2. Go to Network tab
3. Login as a farmer (Chilli's Farm account)
4. Find the login request and copy the **token** from response

### Step 2: Test Analytics API Directly
Open browser console and run:

```javascript
const token = localStorage.getItem('token'); // or paste your token here
fetch('http://localhost:5002/api/v1/analytics/crop-demand', {
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Analytics Response:', JSON.stringify(data, null, 2));
  console.log('📊 Crop Demand:', data.cropDemand);
  console.log('📈 Order Trends:', data.orderTrends);
  console.log('⭐ Top Crops:', data.topCrops);
  console.log('💰 Monthly Revenue:', data.monthlyRevenue);
  console.log('💡 Recommendations:', data.recommendations);
})
.catch(e => console.error('❌ Error:', e));
```

### Expected Output:
You should see console logs showing:
- ✅ **Backend logs** (in terminal where backend is running):
  ```
  📊 Analytics Request for Farmer ID: xxx
  🌾 Found X crops:
     1. vegetables - Chilli: 500kg @ ₹22/kg
     2. grains - Wheat: 300kg @ ₹45/kg
  📦 Found X orders containing farmer's crops
  ✅ Analytics response sent successfully
     - Crop Demand Items: X
     - Order Trend Months: X
     - Top Crops: X
     - Recommendations: X
  ```

- ✅ **Browser console logs** showing analytics data with:
  - `cropDemand`: Array of crops with demand/supply data
  - `orderTrends`: Array of monthly order data
  - `topCrops`: Array of top performing crops
  - `recommendations`: Array of smart recommendations

---

## 🎨 Test 2: Verify Frontend Display

### Step 1: Navigate to Analytics Page
1. Login as farmer
2. Go to Dashboard → Click "Crop Analytics" OR navigate to `/farmer/analytics`

### Step 2: Check Browser Console
You should see:
```
📊 Fetching analytics data...
✅ Analytics data received: {cropDemand: [...], orderTrends: [...], ...}
Crop Demand: [...]
Order Trends: [...]
Top Crops: [...]
```

### Step 3: Verify UI Elements

#### If NO crops exist:
✅ Should show amber-colored empty state:
- Large sprout icon
- "No Crops Added Yet!" message
- "Add Your First Crop" button linking to `/farmer/crops`

#### If crops exist (e.g., Chilli's Farm has crops):
✅ Should show:

**Header Section:**
- 📊 Crop Analytics Dashboard title
- "Track demand, orders, and make informed decisions" subtitle

**Summary Cards (4 cards):**
1. High Demand Crops - shows count
2. Total Orders - shows order count
3. Active Listings - shows active crops count
4. Avg. Price/kg - shows average price in ₹

**View Tabs:**
- 📈 Demand Analysis (default active)
- 🛒 Order Trends
- 💰 Revenue
- ⭐ Top Crops

**Charts (based on selected view):**

##### Demand Analysis Tab:
- Left Chart: Bar chart comparing Demand vs Supply for each crop category
- Right Chart: Area chart showing Demand-Supply gap trends

##### Order Trends Tab:
- Left Chart: Line chart showing orders over last 6 months
- Right Chart: Pie chart showing orders by category distribution

##### Revenue Tab:
- Full-width Area chart showing Monthly Revenue & Profit trends

##### Top Crops Tab:
- Full-width Bar chart showing top performing crops by order quantity

**Recommendations Section:**
- 💡 Smart Recommendations with actionable insights
- Example: "Increase Production - Consider growing more vegetables..."

---

## 📊 Test 3: Real-Time Data Updates

### Test Dynamic Updates:

1. **Initial State**: View analytics with current crops
2. **Add New Crop**: 
   - Go to "My Crops" → Add Crop
   - Add a new crop (e.g., "Tomato" - vegetables - 200kg - ₹15/kg)
3. **Return to Analytics**: Refresh the analytics page
4. **Verify**: 
   - New crop appears in charts
   - Summary cards update
   - Recommendations may update based on new data

### Expected Behavior:
✅ Charts should immediately reflect the new crop data
✅ Supply quantities should update
✅ Average price should recalculate

---

## 🐛 Common Issues & Solutions

### Issue 1: "No Crops Added Yet!" shows even though crops exist

**Check:**
1. Backend console logs - look for crop count
2. Browser console for errors
3. Verify token is valid

**Solution:**
- Make sure you're logged in as the SAME farmer who owns the crops
- Check that crops have `farmerId` field matching your user ID
- Restart backend server to reload routes

### Issue 2: Charts show but no data/empty arrays

**Possible causes:**
- No orders yet (normal - will show zero demand)
- Wrong status filters in query
- Crop IDs not matching order items

**Check backend logs:**
```
📦 Found 0 orders containing farmer's crops
```

**Solution:**
- This is OK if you truly have no orders
- To test with orders, use seed script or create test orders

### Issue 3: Blank page / Infinite loading

**Check:**
- Network tab for failed API calls
- Console for JavaScript errors
- Backend terminal for server errors

**Common fixes:**
- Restart both frontend and backend
- Clear browser cache
- Check MongoDB connection
- Verify all dependencies installed

---

## 🚀 Test 4: Using Seed Script (Optional)

If you want sample data for testing:

```bash
cd backend
node scripts/seedAnalytics.js
```

**Expected output:**
```
🌱 Seeding analytics data...
Found farmer: Chilli's Farm
Deleted existing crops
✅ Created crop: Chilli (500 kg @ ₹22/kg)
✅ Created crop: Wheat (300 kg @ ₹45/kg)
✅ Created crop: Corn (400 kg @ ₹18/kg)
✅ Created crop: Soybean (250 kg @ ₹35/kg)
✅ Created crop: Cotton (150 kg @ ₹65/kg)
✅ Created crop: Rice (600 kg @ ₹12/kg)
✅ Created order 1/30 for Wheat
✅ Created order 6/30 for Corn
✅ Created order 11/30 for Soybean
✅ Created order 16/30 for Cotton
✅ Created order 21/30 for Rice
✅ Analytics data seeded successfully!

📊 Summary:
- Crops created: 6
- Orders created: 30
- Time range: Last 6 months
```

Then refresh analytics page to see full data!

---

## ✅ Success Criteria

Your Crop Analytics Dashboard is working correctly if:

1. ✅ Page loads without errors
2. ✅ Correctly shows crops when they exist
3. ✅ Shows empty state when no crops
4. ✅ All 4 summary cards display correct data
5. ✅ All chart tabs render properly
6. ✅ Charts are interactive (hover tooltips work)
7. ✅ Recommendations section provides insights
8. ✅ Real-time updates when crops are added/changed
9. ✅ No console errors (except maybe warnings)
10. ✅ Backend logs show successful data retrieval

---

## 📝 Debugging Checklist

When something goes wrong, check these in order:

1. **Frontend Console** (F12 → Console tab)
   - Look for red errors
   - Check API response data
   
2. **Network Tab** (F12 → Network tab)
   - Check if `/analytics/crop-demand` request succeeds
   - Verify HTTP status is 200
   - Check response body

3. **Backend Terminal**
   - Look for 📊 Analytics Request logs
   - Check crop count matches expectation
   - Look for any error messages

4. **Database** (MongoDB Compass or similar)
   - Verify crops exist with correct `farmerId`
   - Check orders have proper structure with `items.cropId`
   - Ensure user token matches farmer account

---

## 🎯 Next Steps After Successful Test

Once verified working:

1. **Test with Real Data**: Add actual crops and get real orders
2. **Mobile Responsiveness**: Test on different screen sizes
3. **Performance**: Check load times with large datasets
4. **Edge Cases**: Test with various scenarios:
   - Farmer with 0 crops
   - Farmer with many crops (50+)
   - Orders with multiple items
   - Different order statuses

---

**Created for Mandi-Connect Platform**
Helping farmers make data-driven decisions 🌾
