# Crop Analytics Diagnostic Script for Windows PowerShell
# Run this in PowerShell to diagnose the "No Crops" issue

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🔍 CROP ANALYTICS DIAGNOSTIC TOOL" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Check if backend server is running
Write-Host "1️⃣ Checking Backend Server Status..." -ForegroundColor Yellow
$backendPort = 5002
$backendProcess = Get-NetTCPConnection -LocalPort $backendPort -ErrorAction SilentlyContinue

if ($backendProcess) {
    Write-Host "   ✅ Backend server is RUNNING on port $backendPort" -ForegroundColor Green
    Write-Host "   Process ID: $($backendProcess.OwningProcess)" -ForegroundColor Gray
} else {
    Write-Host "   ❌ Backend server is NOT RUNNING on port $backendPort" -ForegroundColor Red
    Write-Host "   📋 ACTION: Start the backend server first!" -ForegroundColor Yellow
    Write-Host "   Command: cd backend; npm start`n" -ForegroundColor Gray
    exit 1
}

# 2. Test Analytics API
Write-Host "`n2️⃣ Testing Analytics API Endpoint..." -ForegroundColor Yellow

try {
    # Try to get token from browser storage (this requires user to paste it)
    Write-Host "   ℹ️  You'll need to provide your auth token" -ForegroundColor Cyan
    Write-Host "   How to get token:" -ForegroundColor Gray
    Write-Host "   1. Open browser DevTools (F12)" -ForegroundColor Gray
    Write-Host "   2. Go to Application → Local Storage" -ForegroundColor Gray
    Write-Host "   3. Copy the 'token' value" -ForegroundColor Gray
    Write-Host "   4. Paste it below:`n" -ForegroundColor Gray
    
    $token = Read-Host "   Enter your auth token"
    
    if ([string]::IsNullOrWhiteSpace($token)) {
        Write-Host "   ❌ No token provided. Cannot test API." -ForegroundColor Red
        exit 1
    }
    
    # Test the API
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    Write-Host "   📡 Sending request to http://localhost:$backendPort/api/v1/analytics/crop-demand..." -ForegroundColor Cyan
    
    $response = Invoke-RestMethod -Uri "http://localhost:$backendPort/api/v1/analytics/crop-demand" -Headers $headers -Method GET
    
    Write-Host "   ✅ API Response Received!" -ForegroundColor Green
    Write-Host "`n   📊 Analytics Data:" -ForegroundColor Cyan
    Write-Host "      - Crop Demand Items: $($response.cropDemand.Count)" -ForegroundColor $(if ($response.cropDemand.Count -gt 0) {"Green"} else {"Red"})
    Write-Host "      - Order Trend Months: $($response.orderTrends.Count)" -ForegroundColor $(if ($response.orderTrends.Count -gt 0) {"Green"} else {"Yellow"})
    Write-Host "      - Top Crops: $($response.topCrops.Count)" -ForegroundColor $(if ($response.topCrops.Count -gt 0) {"Green"} else {"Yellow"})
    Write-Host "      - Recommendations: $($response.recommendations.Count)" -ForegroundColor $(if ($response.recommendations.Count -gt 0) {"Green"} else {"Yellow"})
    
    if ($response.cropDemand.Count -eq 0) {
        Write-Host "`n   ⚠️  WARNING: ZERO CROPS RETURNED!" -ForegroundColor Red
        Write-Host "   This confirms the issue. Possible causes:" -ForegroundColor Yellow
        Write-Host "      1. Backend code hasn't been restarted (MOST LIKELY)" -ForegroundColor Red
        Write-Host "      2. You're logged in as wrong user" -ForegroundColor Yellow
        Write-Host "      3. No crops exist for this farmer account" -ForegroundColor Yellow
        
        Write-Host "`n   📋 SOLUTION:" -ForegroundColor Cyan
        Write-Host "      1. Stop backend server (Ctrl+C in terminal)" -ForegroundColor White
        Write-Host "      2. Restart: npm start or npm run dev" -ForegroundColor White
        Write-Host "      3. Wait for server to fully start" -ForegroundColor White
        Write-Host "      4. Refresh analytics page in browser" -ForegroundColor White
        Write-Host "      5. Run this diagnostic again" -ForegroundColor White
    } else {
        Write-Host "`n   ✅ SUCCESS! Crops are being retrieved!" -ForegroundColor Green
        Write-Host "   Sample crops:" -ForegroundColor Cyan
        foreach ($crop in $response.cropDemand | Select-Object -First 3) {
            Write-Host "      • $($crop.name) ($($crop.category)): $($crop.supply)kg" -ForegroundColor Green
        }
        
        if ($response.summary) {
            Write-Host "`n   📈 Summary Stats:" -ForegroundColor Cyan
            Write-Host "      - High Demand Crops: $($response.summary.highDemandCount)" -ForegroundColor Gray
            Write-Host "      - Total Orders: $($response.summary.totalOrders)" -ForegroundColor Gray
            Write-Host "      - Active Listings: $($response.summary.activeListings)" -ForegroundColor Gray
            Write-Host "      - Avg Price/kg: ₹$($response.summary.avgPrice)" -ForegroundColor Gray
        }
    }
    
} catch {
    Write-Host "   ❌ API Request Failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "   ⚠️  Token is invalid or expired" -ForegroundColor Yellow
        Write-Host "   Solution: Logout and login again to get fresh token" -ForegroundColor Gray
    } elseif ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "   ⚠️  Analytics endpoint not found (404)" -ForegroundColor Yellow
        Write-Host "   Solution: Check that backend has analytics routes configured" -ForegroundColor Gray
    } else {
        Write-Host "   ⚠️  Server might not be responding correctly" -ForegroundColor Yellow
        Write-Host "   Solution: Check backend terminal for errors" -ForegroundColor Gray
    }
}

# 3. Summary and Next Steps
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "📋 DIAGNOSIS & NEXT STEPS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

if ($response.cropDemand.Count -eq 0) {
    Write-Host "❌ ISSUE CONFIRMED: Backend returning 0 crops" -ForegroundColor Red
    Write-Host "`n🔧 REQUIRED ACTION:" -ForegroundColor Yellow
    Write-Host "   1. Find your backend terminal window" -ForegroundColor White
    Write-Host "   2. Press Ctrl+C to STOP the server" -ForegroundColor White
    Write-Host "   3. Run: npm start (or npm run dev)" -ForegroundColor White
    Write-Host "   4. Wait for 'Server running on port 5002' message" -ForegroundColor White
    Write-Host "   5. Refresh your analytics page in browser" -ForegroundColor White
    Write-Host "   6. Check backend terminal for debug logs like:" -ForegroundColor White
    Write-Host "      📊 Analytics Request for Farmer ID: ..." -ForegroundColor Gray
    Write-Host "      🌾 Found X crops: ..." -ForegroundColor Gray
} else {
    Write-Host "✅ ANALYTICS IS WORKING CORRECTLY!" -ForegroundColor Green
    Write-Host "`nIf UI still shows 'No Crops', check:" -ForegroundColor Yellow
    Write-Host "   1. Browser console for JavaScript errors (F12)" -ForegroundColor White
    Write-Host "   2. Network tab to see if API call succeeded" -ForegroundColor White
    Write-Host "   3. Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor White
    Write-Host "   4. Try hard refresh (Ctrl+F5)" -ForegroundColor White
}

Write-Host "`n💡 TIP: After ANY backend code change, ALWAYS restart the server!" -ForegroundColor Cyan
Write-Host "   Modified files don't load until server restarts`n" -ForegroundColor Gray
