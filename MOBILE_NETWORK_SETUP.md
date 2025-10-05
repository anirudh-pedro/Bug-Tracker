# Mobile Network Setup Guide

This guide will help you connect your React Native app to the backend server when using your phone's mobile network or mobile hotspot.

## 🎯 Quick Setup

### Step 1: Find Your Computer's IP Address

#### On Windows:
```powershell
ipconfig
```
Look for **IPv4 Address** under your active network adapter (WiFi or Ethernet).

Example output:
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . : 192.168.1.100
```

#### On Mac/Linux:
```bash
ifconfig
# or
ip addr show
```
Look for **inet** address (not 127.0.0.1).

### Step 2: Update Network Configuration

Open `frontend/src/config/networkConfig.js` and update the `BACKEND_URL`:

```javascript
BACKEND_URL: isDevelopment 
  ? 'http://YOUR_COMPUTER_IP:5000'  // Replace with your IP
  : 'https://your-production-api.com',
```

**Example:**
```javascript
BACKEND_URL: isDevelopment 
  ? 'http://192.168.1.100:5000'
  : 'https://your-production-api.com',
```

### Step 3: Update Fallback URLs (Optional)

Add your IP to the fallback URLs list:

```javascript
FALLBACK_URLS: isDevelopment 
  ? [
      'http://192.168.1.100:5000',    // Your WiFi IP
      'http://10.178.105.115:5000',   // Your mobile hotspot IP
      // ... other IPs
    ]
  : [],
```

### Step 4: Configure Firewall

#### Windows Firewall:
1. Open **Windows Defender Firewall**
2. Click **Advanced settings**
3. Click **Inbound Rules** → **New Rule**
4. Select **Port** → Next
5. Select **TCP** and enter port **5000** → Next
6. Select **Allow the connection** → Next
7. Check all profiles → Next
8. Name it "Bug Tracker API" → Finish

#### Mac Firewall:
```bash
# Allow incoming connections on port 5000
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /path/to/node
```

#### Linux (UFW):
```bash
sudo ufw allow 5000/tcp
```

### Step 5: Start the Server

Make sure the server is running and listening on all network interfaces:

```bash
cd server
npm start
```

You should see:
```
🚀 Server running on port 5000
📍 Local API URL: http://localhost:5000
📱 Network API URL: http://192.168.1.100:5000
```

### Step 6: Connect Your Phone

#### Option A: Mobile Hotspot (Recommended for Mobile Network)
1. Enable **Mobile Hotspot** on your phone
2. Connect your computer to your phone's hotspot
3. Find your computer's new IP address (see Step 1)
4. Update `BACKEND_URL` with this IP
5. Run the app on your phone

#### Option B: Same WiFi Network
1. Connect both phone and computer to the same WiFi network
2. Use your computer's WiFi IP address
3. Run the app on your phone

## 🔧 Network Configuration Features

### Optimized for Mobile Networks

The network configuration includes several optimizations for mobile networks:

- **Extended Timeouts**: Longer timeouts for slower mobile connections
- **Automatic Retries**: 3 retry attempts with exponential backoff
- **Response Caching**: 3-minute cache to reduce data usage
- **Request Deduplication**: Prevents duplicate requests
- **Fallback URLs**: Automatic fallback to alternative server URLs

### Timeout Settings

```javascript
TIMEOUTS: {
  AUTH: 12000,       // 12 seconds for login/signup
  UPLOAD: 30000,     // 30 seconds for file uploads
  DASHBOARD: 8000,   // 8 seconds for dashboard
  DEFAULT: 6000,     // 6 seconds for standard requests
  HEALTH_CHECK: 3000 // 3 seconds for connectivity tests
}
```

### Retry Configuration

```javascript
RETRY: {
  MAX_RETRIES: 3,              // Retry up to 3 times
  BASE_DELAY: 1000,            // Start with 1 second delay
  MAX_DELAY: 8000,             // Maximum 8 seconds delay
  EXPONENTIAL_BACKOFF: true,   // Double delay each retry
  JITTER: true                 // Add random variation
}
```

## 🐛 Troubleshooting

### Problem: Cannot connect to server

**Solution:**
1. Verify server is running: `http://YOUR_IP:5000/api/health`
2. Check firewall settings (see Step 4)
3. Ensure both devices are on the same network
4. Try using the fallback URLs
5. Check console logs for specific error messages

### Problem: Connection times out

**Solution:**
1. Increase timeout values in `networkConfig.js`:
```javascript
TIMEOUTS: {
  DEFAULT: 10000,  // Increase from 6000 to 10000
}
```
2. Check your mobile network signal strength
3. Try connecting via WiFi instead

### Problem: "Network request failed"

**Solution:**
1. Check if server URL is correct
2. Verify server is accessible from browser: `http://YOUR_IP:5000`
3. Clear app cache and restart
4. Check network console logs for detailed error

### Problem: Auth token errors

**Solution:**
1. Clear app data/cache
2. Log out and log back in
3. Check token expiration settings

## 📱 Testing Connection

### Test from Browser (on phone)
Open your phone's browser and visit:
```
http://YOUR_COMPUTER_IP:5000/api/health
```

You should see:
```json
{
  "success": true,
  "data": {
    "service": "Bug Tracker API",
    "status": "running"
  }
}
```

### Test from App
The app will automatically test connectivity on startup and show:
- ✅ Green indicator: Connected
- ⚠️ Yellow indicator: Poor connection
- ❌ Red indicator: No connection

## 🌐 Network Quality Indicators

The app monitors network quality and adapts:

- **Good** (< 1s response): Full functionality
- **Fair** (1-3s response): Reduced auto-refresh
- **Poor** (> 3s response): Manual refresh only
- **Offline**: Cached data only

## 🔐 Security Notes

### Development Mode
- Current setup allows all origins (CORS: `*`)
- This is **ONLY** for development
- Backend logs all network interfaces

### Production Mode
- Update `BACKEND_URL` to HTTPS production URL
- Remove fallback URLs
- Configure proper CORS settings on backend
- Use environment variables for sensitive config

## 📝 Environment Variables (Future Enhancement)

You can also use environment variables:

Create `.env` file in `frontend/`:
```env
API_URL=http://192.168.1.100:5000
```

Then in `networkConfig.js`:
```javascript
import { API_URL } from '@env';

BACKEND_URL: isDevelopment 
  ? (API_URL || 'http://172.16.8.229:5000')
  : 'https://your-production-api.com',
```

## 🚀 Advanced Configuration

### Custom Timeout Per Request

```javascript
import { apiRequest } from '../utils/networkUtils';

const data = await apiRequest('/api/slow-endpoint', {
  method: 'GET',
  timeout: 20000  // Custom 20 second timeout
});
```

### Disable Caching for Specific Request

```javascript
const freshData = await apiRequest('/api/realtime-data', {
  method: 'GET',
  cache: false  // Skip cache, always fetch fresh
});
```

### Monitor Network Quality

```javascript
import { getNetworkQuality } from '../utils/enhancedNetworkUtils';

const quality = await getNetworkQuality();
console.log(quality);
// { isConnected: true, latency: 250, quality: 'good', serverUrl: '...' }
```

## 📊 Network Monitoring

Check logs for network activity:
- 🔍 Testing connectivity
- 🔗 Trying specific URL
- ✅ Success
- ❌ Failure with error type
- ⏰ Timeout
- 📦 Cache hit
- 🔑 Auth token usage

## ✅ Checklist

Before running the app on mobile network:

- [ ] Found computer's IP address
- [ ] Updated `BACKEND_URL` in `networkConfig.js`
- [ ] Configured firewall to allow port 5000
- [ ] Started server with `npm start`
- [ ] Verified server shows network IP in logs
- [ ] Connected phone to same network or mobile hotspot
- [ ] Tested server URL in phone's browser
- [ ] Built and ran React Native app
- [ ] Checked app logs for connectivity status

## 🎉 Success!

If everything is configured correctly, you should see:
```
✅ Server reachable at: http://192.168.1.100:5000
🔑 Using auth token for API request
✅ API request successful
```

Happy coding! 🚀
