# Network Configuration Quick Reference

## 📍 Configuration Files

| File                                         | Purpose                                         |
| -------------------------------------------- | ----------------------------------------------- |
| `frontend/src/config/networkConfig.js`       | Main network settings (timeouts, retries, URLs) |
| `frontend/src/config/apiConfig.js`           | API endpoint definitions                        |
| `frontend/src/config/authConfig.js`          | Auth settings (imports from networkConfig)      |
| `frontend/src/utils/networkUtils.js`         | Basic network utilities with caching            |
| `frontend/src/utils/enhancedNetworkUtils.js` | Advanced utilities with retry logic             |

## 🔧 Quick Updates

### Change Backend URL

**File:** `frontend/src/config/networkConfig.js`

```javascript
BACKEND_URL: isDevelopment
  ? 'http://YOUR_IP:5000'  // ← Change this
  : 'https://your-production-api.com',
```

### Add Fallback URL

**File:** `frontend/src/config/networkConfig.js`

```javascript
FALLBACK_URLS: isDevelopment
  ? [
      'http://192.168.1.100:5000',  // ← Add your IP here
      // ... existing URLs
    ]
  : [],
```

### Adjust Timeouts

**File:** `frontend/src/config/networkConfig.js`

```javascript
TIMEOUTS: {
  DEFAULT: 6000,  // ← Change milliseconds
  AUTH: 12000,    // ← Longer for auth
  UPLOAD: 30000,  // ← Very long for uploads
}
```

### Change Retry Behavior

**File:** `frontend/src/config/networkConfig.js`

```javascript
RETRY: {
  MAX_RETRIES: 3,              // ← Number of retries
  BASE_DELAY: 1000,            // ← Initial delay (ms)
  EXPONENTIAL_BACKOFF: true,   // ← Enable/disable
}
```

## 🌐 Find Your IP Address

### Windows

```powershell
ipconfig
```

Look for: **IPv4 Address**

### Mac/Linux

```bash
ifconfig
# or
ip addr show
```

Look for: **inet** address (not 127.0.0.1)

## 🔥 Firewall Setup

### Windows

```powershell
# PowerShell (as Administrator)
New-NetFirewallRule -DisplayName "Bug Tracker API" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow
```

### Mac

```bash
# Allow Node.js
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add $(which node)
```

### Linux (UFW)

```bash
sudo ufw allow 5000/tcp
```

## 🚀 Server Commands

### Start Server

```bash
cd server
npm start
```

### Check Server is Running

```bash
curl http://localhost:5000/api/health
```

### Check from Network

```bash
curl http://YOUR_IP:5000/api/health
```

## 📱 Mobile Network Setup

### Option 1: Mobile Hotspot (For Mobile Network)

1. Enable hotspot on phone
2. Connect computer to phone's hotspot
3. Get computer's IP: `ipconfig` or `ifconfig`
4. Update `BACKEND_URL` with this IP
5. Run app on phone

### Option 2: Same WiFi

1. Connect both to same WiFi
2. Get computer's WiFi IP
3. Update `BACKEND_URL`
4. Run app

## 🔍 Testing Connection

### From Browser (on phone)

```
http://YOUR_COMPUTER_IP:5000/api/health
```

### From App Console

Look for these logs:

```
✅ Server reachable at: http://...
🔑 Using auth token for API request
✅ API request successful
```

## ⚠️ Common Issues

| Problem                  | Solution                                              |
| ------------------------ | ----------------------------------------------------- |
| "Connection refused"     | Check firewall, verify server is running              |
| "Request timeout"        | Increase timeout values, check network speed          |
| "Network request failed" | Verify IP address, check both devices on same network |
| "CORS error"             | Server already configured for development             |
| "Auth error"             | Clear app data, log in again                          |

## 📊 Network Quality

| Quality        | Latency | Behavior              |
| -------------- | ------- | --------------------- |
| **Good** 🟢    | < 1s    | Full features enabled |
| **Fair** 🟡    | 1-3s    | Reduced auto-refresh  |
| **Poor** 🔴    | > 3s    | Manual refresh only   |
| **Offline** ⚫ | N/A     | Cached data only      |

## 🛠️ Development Tools

### Test Connectivity

```javascript
import { testServerConnectivity } from "../utils/networkUtils";

const server = await testServerConnectivity();
console.log("Connected to:", server);
```

### Get Network Quality

```javascript
import { getNetworkQuality } from "../utils/enhancedNetworkUtils";

const quality = await getNetworkQuality();
console.log("Network:", quality.quality, "Latency:", quality.latency);
```

### Make API Request

```javascript
import { apiRequest } from "../utils/networkUtils";

const data = await apiRequest("/api/bugs", {
  method: "GET",
});
```

## 📦 Environment Variables (Optional)

Create `.env` in `frontend/`:

```env
API_URL=http://192.168.1.100:5000
NODE_ENV=development
```

Requires:

```bash
npm install react-native-dotenv
```

## 🎯 Checklist for Mobile Network

- [ ] Find computer's IP address
- [ ] Update `networkConfig.js` with IP
- [ ] Configure firewall (port 5000)
- [ ] Start server (`npm start`)
- [ ] Verify server logs show network IP
- [ ] Connect phone (hotspot or WiFi)
- [ ] Test in browser on phone
- [ ] Run React Native app
- [ ] Check logs for connectivity

## 💡 Pro Tips

1. **Mobile Hotspot** is most reliable for mobile network testing
2. **Static IP** prevents need to update config frequently
3. **Clear cache** when changing URLs
4. **Check logs** for detailed error messages
5. **Test health endpoint** before running full app

## 📚 Documentation

- Full setup guide: `MOBILE_NETWORK_SETUP.md`
- Network config: `frontend/src/config/networkConfig.js`
- API endpoints: `frontend/src/config/apiConfig.js`

---

**Last Updated:** October 5, 2025
**For:** Bug Tracker Mobile App
