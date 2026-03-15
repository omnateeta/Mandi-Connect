# 📊 Crop Analytics Dashboard - Farmer Feature

## Overview
A comprehensive analytics dashboard that helps farmers understand crop demand, order trends, and make data-driven decisions about what to plant next.

## Features

### 📈 **Multiple Chart Views**

1. **Demand Analysis**
   - Bar chart comparing demand vs supply for each crop type
   - Area chart showing demand-supply gaps
   - Identifies which crops are in high demand

2. **Order Trends**
   - Line chart showing order history over last 6 months
   - Pie chart displaying orders by category
   - Tracks order volume and value trends

3. **Revenue Analytics**
   - Monthly revenue and profit trends
   - Area charts with gradient fills
   - Financial performance overview

4. **Top Crops**
   - Bar chart of best-performing crops
   - Colorful visualization by crop type
   - Ranked by order quantity

### 💡 **Smart Recommendations**

The system analyzes your data and provides actionable insights:
- **Increase Production**: Suggests crops where demand > supply
- **Reduce Overproduction**: Warns about crops with low demand
- **Growing Market**: Alerts when order trends are positive

### 📊 **Summary Statistics**

Quick stats cards showing:
- High Demand Crops count
- Total Orders received
- Active Listings
- Average Price per kg

## How to Use

### 1. Seed Sample Data (Optional)
To test the analytics with sample data:

```bash
cd backend
node scripts/seedAnalytics.js
```

This will create:
- 6 different crops (Wheat, Rice, Corn, Soybean, Cotton, Sugarcane)
- 30 sample orders over 6 months
- Realistic demand/supply patterns

### 2. Access the Dashboard

1. Login as a farmer
2. Navigate to `/farmer/analytics` OR click "Crop Analytics" in the dashboard
3. Explore different views using the tabs

### 3. Backend Route

The analytics endpoint is at:
```
GET /api/v1/analytics/crop-demand
```

Headers:
```
Authorization: Bearer <your_token>
```

## Technical Details

### Frontend Components

**File**: `frontend/src/components/farmer/CropAnalytics.jsx`

Uses:
- **Recharts** - Beautiful, responsive charts
- **Tailwind CSS** - Modern styling
- **React Hooks** - State management

Charts included:
- BarChart (Demand vs Supply)
- AreaChart (Trends)
- LineChart (Order history)
- PieChart (Category distribution)

### Backend Logic

**File**: `backend/src/routes/analytics.js`

Aggregates data to provide:
- Demand calculation from orders
- Supply from crop inventory
- Monthly trends (last 6 months)
- Top performing crops
- Revenue projections
- Smart recommendations

## Dependencies

Frontend:
```bash
npm install recharts
```

Backend:
- MongoDB aggregation pipelines
- Mongoose models

## Visual Design

- **Color Palette**: 
  - Emerald green for demand/growth
  - Blue for supply/stability
  - Amber for warnings
  - Purple for premium features

- **Responsive**: Works on desktop, tablet, and mobile
- **Interactive**: Hover tooltips on all charts
- **Accessible**: Clear labels and legends

## Example Insights

Farmers can discover:
- "Wheat has 3x more demand than my current supply!"
- "Rice orders are declining, maybe I should plant less"
- "My revenue is growing 15% month-over-month"
- "Soybean is my most profitable crop this season"

## Future Enhancements

Potential improvements:
- [ ] Weather data integration
- [ ] Market price predictions
- [ ] Seasonal trend analysis
- [ ] Competitor analysis
- [ ] Export to PDF/Excel
- [ ] Custom date range selection
- [ ] Comparison with regional averages

---

**Created for Mandi-Connect Platform**
Helping farmers make data-driven decisions 🌾
