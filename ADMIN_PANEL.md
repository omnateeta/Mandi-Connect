# 🛡️ Admin Panel - Mandi-Connect

## Overview
The Admin Panel provides complete control over the Mandi-Connect platform, allowing administrators to manage users, monitor transactions, detect fraud, and analyze platform performance.

## Features

### 🔐 Authentication
- **Separate Login**: Dedicated admin login page accessible via button on main login screen
- **Secure Access**: JWT-based authentication with role verification
- **Permission System**: Granular permission controls for different admin functions

### 📊 Dashboard Analytics

#### Overview Tab
- **Total Statistics**
  - Total Farmers registered
  - Total Retailers registered
  - Total Crops listed
  - Total Revenue generated
  
- **Top Performers**
  - Top 10 Farmers by revenue (with ranking badges)
  - Top 10 Retailers by order count
  - Recent orders activity

### 🚨 Fraud Detection System

Automatically detects and flags:

1. **Duplicate Accounts** (High Priority)
   - Users with multiple accounts using same phone number
   - Shows all associated accounts

2. **Unusual Order Values** (Medium Priority)
   - Orders exceeding 5x the average order value
   - Lists farmer and retailer details

3. **Low Trust Farmers** (High Priority)
   - Farmers with trust score below 30%
   - Includes contact information

4. **Disputed Orders** (Critical Priority)
   - All orders with disputed status
   - Full order details for review

5. **Rapid Signups** (Medium Priority)
   - More than 10 accounts created in 1 hour
   - Potential bot activity detection

### 👥 User Management
- **Farmers Tab**: View and manage all farmer accounts (Coming Soon)
- **Retailers Tab**: View and manage all retailer accounts (Coming Soon)

## Setup Instructions

### Step 1: Create Admin User

Run this command in your terminal from the backend directory:

```bash
cd backend
node scripts/createAdmin.js
```

This will create the default admin account:
- **Username**: `mandiadmin`
- **Password**: `mandiadmin@123456`

### Step 2: Start Backend Server

```bash
cd backend
npm start
```

The server will automatically restart if you're using nodemon.

### Step 3: Access Admin Panel

1. Open your browser and navigate to: `http://localhost:5173/login`
2. Click the **"Admin Login"** button at the bottom of the login form
3. Enter credentials:
   - Username: `mandiadmin`
   - Password: `mandiadmin@123456`
4. You'll be redirected to `/admin/dashboard`

## API Endpoints

### Authentication
- `POST /api/v1/admin/auth/login` - Admin login
- `GET /api/v1/admin/auth/me` - Get current admin info

### Dashboard
- `GET /api/v1/admin/dashboard` - Get dashboard analytics
- `GET /api/v1/admin/fraud-detection` - Get fraud detection data

## Security Features

1. **Separate Authentication**: Admin auth is completely separate from farmer/retailer auth
2. **Token Isolation**: Admin tokens stored in `adminToken` (not `token`)
3. **Role Verification**: Middleware checks for admin role specifically
4. **Permission System**: Different permission levels for different actions
5. **Inactive Account Check**: Automatically blocks deactivated admins

## File Structure

### Backend
```
backend/
├── src/
│   ├── models/
│   │   └── Admin.js                 # Admin user model
│   ├── controllers/
│   │   ├── adminAuthController.js   # Admin authentication
│   │   └── adminDashboardController.js # Dashboard & fraud detection
│   ├── middleware/
│   │   └── adminAuth.js             # Admin authentication middleware
│   ├── routes/
│   │   └── adminRoutes.js           # Admin API routes
│   └── app.js                       # Updated with admin routes
└── scripts/
    └── createAdmin.js               # Script to create initial admin
```

### Frontend
```
frontend/
├── src/
│   ├── pages/
│   │   └── admin/
│   │       ├── AdminLogin.jsx       # Admin login page
│   │       └── AdminDashboard.jsx   # Admin dashboard with tabs
│   └── App.jsx                      # Updated with admin routes
```

## Usage Guide

### Navigating the Dashboard

1. **Overview Tab**
   - View key metrics at a glance
   - See top performing farmers and retailers
   - Monitor total platform activity

2. **Fraud Detection Tab**
   - Check critical issues first (red badges)
   - Review high priority items (orange badges)
   - Investigate medium priority warnings (amber badges)
   - Click on each flag to see detailed information

3. **Farmers/Retailers Tabs**
   - Currently showing "Coming Soon" placeholder
   - Future updates will include full CRUD operations

### Understanding Fraud Flags

**Severity Levels:**
- 🔴 **Critical**: Immediate action required (disputed orders)
- 🟠 **High**: Should investigate soon (duplicate accounts, low trust)
- 🟡 **Medium**: Monitor closely (unusual values, rapid signups)

**Example Investigation Flow:**
1. See 3 critical flags in fraud detection
2. Click on "Disputed Orders" section
3. Review order details and parties involved
4. Take appropriate action (contact users, refund, etc.)

## Best Practices

1. **Regular Monitoring**: Check fraud detection daily
2. **Verify Before Acting**: Contact users before taking punitive action
3. **Document Actions**: Keep track of admin decisions
4. **Rotate Passwords**: Change admin password periodically
5. **Monitor Admin Activity**: Use lastLogin timestamp to track usage

## Troubleshooting

### Can't Login as Admin?

1. Verify admin was created:
```bash
cd backend
node scripts/createAdmin.js
```

2. Check MongoDB connection
3. Clear browser cache and localStorage
4. Verify backend server is running

### Dashboard Not Loading Data?

1. Check browser console for errors
2. Verify admin token in localStorage (`adminToken`)
3. Check network tab for API response
4. Ensure backend server is running

### Fraud Detection Empty?

- This is normal for new platforms with little activity
- Add some test data (crops, orders) to trigger detections
- Wait for natural platform growth

## Future Enhancements

- [ ] Real-time notifications for critical alerts
- [ ] Advanced analytics charts (revenue trends, user growth)
- [ ] Export reports to CSV/PDF
- [ ] Multi-admin support with role hierarchy
- [ ] Activity logs for admin actions
- [ ] Bulk user management operations
- [ ] Advanced search and filtering
- [ ] Mobile-responsive improvements

## Support

For issues or questions about the admin panel, refer to the main Mandi-Connect documentation or contact the development team.

---

**Remember**: With great power comes great responsibility! Use the admin panel wisely to maintain a fair and thriving marketplace. 🌾
