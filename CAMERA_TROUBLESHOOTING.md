# 📷 Camera Access Troubleshooting Guide

## Issue: Camera Not Starting

If the AI Camera Scanner is not accessing your camera, follow these steps:

---

## ✅ Quick Fixes

### 1. **Check Browser Permissions**

**Chrome/Edge:**
1. Click the 🔒 lock icon in the address bar
2. Find "Camera" permission
3. Toggle it ON or select "Allow"
4. Refresh the page

**Firefox:**
1. Click the 🔒 lock icon
2. Click "Connection Secure"
3. Find Camera permission
4. Select "Allow"

**Safari (iOS):**
1. Go to Settings → Safari
2. Scroll to "Camera"
3. Enable "Allow"

---

### 2. **Grant Permission Manually**

When you first open the scanner, you'll see:

```
┌─────────────────────────────┐
│  📷 Camera Not Started      │
│                             │
│   [Start Camera Button]     │
│                             │
│  Click to grant permission  │
└─────────────────────────────┘
```

**Click the "Start Camera" button** and allow camera access when prompted.

---

### 3. **Check HTTPS/Localhost**

The camera API requires a secure context:

✅ **Works on:**
- `http://localhost:5173` (development)
- `https://yourdomain.com` (production)

❌ **Won't work on:**
- `http://192.168.x.x` (IP address without HTTPS)
- `http://yourdomain.com` (HTTP without SSL)

**Fix for production:**
- Install SSL certificate (Let's Encrypt is free)
- Use HTTPS URL

---

### 4. **Browser Compatibility**

**Supported Browsers:**
- ✅ Chrome/Chromium (Recommended)
- ✅ Microsoft Edge
- ✅ Firefox
- ✅ Safari (iOS 11+)

**Not Supported:**
- ❌ Internet Explorer
- ❌ Old browsers (pre-2017)

**Update your browser to the latest version!**

---

## 🔍 Common Error Messages

### "Camera API not supported"
**Cause:** Using unsupported browser

**Solution:**
```
✓ Switch to Chrome, Firefox, or Edge
✓ Update browser to latest version
```

---

### "Camera permission denied"
**Cause:** Previously blocked camera access

**Solution:**
```
Chrome:
1. Click ⋮ (three dots) → Settings
2. Privacy and Security → Site Settings
3. Camera → Find mandiconnect.com
4. Change from "Block" to "Allow"
5. Refresh page

Firefox:
1. Click ☰ → Settings
2. Privacy & Security → Permissions
3. Camera → Settings
4. Find mandiconnect.com → Allow

Safari:
1. Safari → Preferences
2. Websites → Camera
3. Find mandiconnect.com → Allow
```

---

### "No camera found on this device"
**Cause:** Device has no camera or camera is disabled

**Solution:**
```
✓ Check if device has built-in camera
✓ Connect external USB webcam
✓ Enable camera in BIOS/UEFI settings
✓ Check Device Manager (Windows) for camera
```

---

### "Camera is being used by another application"
**Cause:** Another app is using the camera

**Solution:**
```
✓ Close Zoom, Teams, Skype, etc.
✓ Close other browser tabs using camera
✓ Restart browser
✓ Restart computer if issue persists
```

---

### "OverconstrainedError"
**Cause:** Requested camera resolution not supported

**Solution:**
The code now gracefully handles this. Try:
```
✓ Click "Restart Camera" button
✓ Use a different browser
✓ Update camera drivers
```

---

## 🛠️ Advanced Troubleshooting

### Check Console Logs

Open Developer Tools (F12) and check Console tab:

**Expected logs:**
```
Requesting camera access...
Camera access granted!
Video loaded, starting detection...
```

**Error logs indicate the issue:**
```
NotAllowedError → Permission denied
NotFoundError → No camera
NotReadableError → Camera busy
TypeError → API not supported
```

---

### Test Camera Separately

Test if camera works at all:

**Online tools:**
- https://webcamtests.com/
- https://onlinemictest.com/webcam-test/

**Native apps:**
- Windows: Camera app
- Mac: Photo Booth
- Linux: Cheese or Guvcview

---

### Check Operating System Permissions

**Windows 10/11:**
```
1. Settings → Privacy → Camera
2. Enable "Camera access"
3. Enable "Allow desktop apps to access camera"
4. Find your browser in the list → Enable
```

**macOS:**
```
1. System Preferences → Security & Privacy
2. Privacy tab → Camera
3. Find your browser → Check the box
4. Restart browser
```

**Linux (Ubuntu):**
```bash
# Check if camera is detected
ls -l /dev/video*

# Check permissions
sudo usermod -aG video $USER

# Logout and login again
```

---

### Mobile-Specific Issues

**Android:**
```
1. Settings → Apps → Chrome/Browser
2. Permissions → Camera → Allow
3. Clear browser cache
4. Restart browser
```

**iOS:**
```
1. Settings → Safari
2. Camera → Allow
3. Settings → General → iPhone Storage
4. Safari → Clear Website Data
```

---

## 💡 Prevention Tips

### For Farmers Using Mobile Phones:

1. **Use Chrome or default browser** (most compatible)
2. **Keep browser updated** (auto-updates recommended)
3. **Don't deny camera permission** on first prompt
4. **Close camera apps** before using scanner
5. **Use in good lighting** (helps with detection too)

### For Desktop Users:

1. **Use modern browsers** (Chrome, Edge, Firefox)
2. **Connect webcam properly** (USB 3.0 recommended)
3. **Install camera drivers** (from manufacturer website)
4. **Close video conferencing apps** before scanning

---

## 🎯 Step-by-Step First-Time Setup

### When Using AI Scanner for First Time:

**Step 1:** Navigate to Add Crop page
```
Farmer Dashboard → Crops → Add Crop
```

**Step 2:** Click purple "AI Camera Scan" button
```
Opens full-screen scanner modal
```

**Step 3:** Wait for model to load (3-5 seconds)
```
Shows: "Loading AI model..."
Toast: "AI model loaded!"
```

**Step 4:** Browser prompts for camera permission
```
┌──────────────────────────────┐
│ mandiconnect.com wants to    │
│ use your camera              │
│                              │
│  [Block]     [Allow]         │
└──────────────────────────────┘
```
**CLICK "ALLOW"** ✅

**Step 5:** Camera starts automatically
```
Shows live video feed
Scanning line moves up/down
Green dot pulses = active
```

**Step 6:** Point at crop and wait
```
Detection happens every 2 seconds
Live results appear in panel
Auto-capture at >85% confidence
```

---

## 🚨 Emergency Workarounds

### If Camera Still Doesn't Work:

**Option 1: Manual Upload**
```
1. Take photo with phone camera
2. Transfer to computer
3. Use regular "Upload Photos" button
4. Fill form manually
```

**Option 2: Different Device**
```
Try using:
✓ Different smartphone
✓ Different browser
✓ Desktop with webcam
```

**Option 3: Screen Share Demo**
```
For demo purposes:
1. Share screen in video call
2. Show pre-recorded scan video
3. Explain the feature manually
```

---

## 📞 Getting Help

### Information to Provide:

When reporting camera issues, include:

1. **Device Model:** e.g., "iPhone 12", "Dell Inspiron 15"
2. **Operating System:** e.g., "Windows 11", "iOS 16.5"
3. **Browser & Version:** e.g., "Chrome 120.0.6099.109"
4. **Error Message:** Exact text from toast/console
5. **Console Logs:** Screenshot of F12 console
6. **What You Tried:** Steps already attempted

### Contact Support:

- **Email:** support@mandiconnect.com
- **Phone:** 1800-XXX-XXXX
- **WhatsApp:** +91-XXX-XXX-XXXX
- **GitHub:** Create issue with details

---

## ✅ Success Checklist

Camera is working correctly when you see:

- ✅ Live video feed in scanner
- ✅ Green pulsing dot (active status)
- ✅ Scanning line animation
- ✅ Console shows "Camera access granted!"
- ✅ Video plays smoothly
- ✅ Detections appear in panel
- ✅ No error messages

---

## 🎓 Technical Details

### How Camera Access Works:

```javascript
// 1. Check browser support
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  throw new Error('Camera API not supported');
}

// 2. Request permission
const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: 'environment', // Back camera on mobile
    width: { ideal: 1920 },    // Full HD preferred
    height: { ideal: 1080 }
  }
});

// 3. Attach to video element
videoRef.current.srcObject = stream;

// 4. Wait for metadata
videoRef.current.onloadedmetadata = () => {
  videoRef.current.play();
  // Start detection...
};
```

### Required Permissions:

| Permission | Type | Duration |
|------------|------|----------|
| Camera | Hardware | Session-only |
| HTTPS | Protocol | Permanent |
| Autoplay | Browser | Permanent |

---

## 🔐 Privacy & Security

### What We Access:
- ✅ Live camera video stream only
- ❌ No photos stored permanently
- ❌ No video recording
- ❌ No audio capture
- ❌ No location data
- ❌ No personal information

### Data Flow:
```
Camera → Browser Memory → TensorFlow.js → Detection Result
                              ↓
                        (Image discarded immediately)
```

**Your privacy is protected!** Images never leave your device.

---

## 🌟 Pro Tips

### For Best Camera Performance:

1. **Clean camera lens** (microfiber cloth)
2. **Stable internet** (for initial model download)
3. **Good battery** (camera drains battery)
4. **Enough storage** (browser cache needs space)
5. **Modern device** (2018 or newer recommended)

### Optimal Setup:
```
Device: Smartphone with autofocus camera
Browser: Chrome (latest version)
Lighting: Natural daylight
Distance: 6-8 inches from crop
Connection: 4G/WiFi (for model download)
```

---

**Following this guide should resolve 99% of camera access issues! 🎯**

If problems persist, contact support with detailed information.
