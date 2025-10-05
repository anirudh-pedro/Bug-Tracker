# Network Configuration Architecture

## 📐 Configuration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Network Configuration                    │
│                   (networkConfig.js)                        │
│                                                             │
│  • Backend URLs (primary + fallbacks)                      │
│  • Timeouts (auth, upload, default)                        │
│  • Retry settings (count, backoff, jitter)                 │
│  • Cache settings (duration, size)                         │
│  • Mobile optimizations                                    │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               │                              │
               ▼                              ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│    authConfig.js         │   │    apiConfig.js          │
│                          │   │                          │
│  Imports:                │   │  • API Endpoints         │
│  • BACKEND_URL           │   │  • Route definitions     │
│  • FALLBACK_URLS         │   │  • Auth requirements     │
│  • Timeouts              │   │                          │
│  • Retry settings        │   │                          │
└──────────────┬───────────┘   └──────────────┬───────────┘
               │                              │
               └──────────────┬───────────────┘
                              │
                              ▼
               ┌──────────────────────────┐
               │   Network Utilities      │
               │                          │
               │  • networkUtils.js       │
               │    - Basic requests      │
               │    - Caching             │
               │    - Deduplication       │
               │                          │
               │  • enhancedNetworkUtils  │
               │    - Advanced retries    │
               │    - Error handling      │
               │    - Quality monitoring  │
               └──────────────┬───────────┘
                              │
                              ▼
               ┌──────────────────────────┐
               │   React Native App       │
               │   (Screens & Components) │
               └──────────────────────────┘
```

## 🔄 Request Flow

```
┌──────────────┐
│  App Screen  │
└──────┬───────┘
       │ 1. Call apiRequest()
       ▼
┌─────────────────────────┐
│  Network Utils          │
│  - Check cache          │ ───────► Cache hit? Return cached data
│  - Deduplicate request  │
└──────┬──────────────────┘
       │ 2. No cache, make request
       ▼
┌─────────────────────────┐
│  Try Primary URL        │
│  http://IP:5000         │
└──────┬──────────────────┘
       │ 3a. Success
       │ └─────► Parse response → Cache → Return
       │
       │ 3b. Failure
       ▼
┌─────────────────────────┐
│  Try Fallback URLs      │
│  - URL 1                │
│  - URL 2                │
│  - URL 3...             │
└──────┬──────────────────┘
       │ 4a. One succeeds
       │ └─────► Parse response → Cache → Return
       │
       │ 4b. All fail
       ▼
┌─────────────────────────┐
│  Retry Logic            │
│  - Wait (exp backoff)   │
│  - Try all URLs again   │
│  - Max 3 attempts       │
└──────┬──────────────────┘
       │ 5a. Success
       │ └─────► Return
       │
       │ 5b. All retries fail
       ▼
┌─────────────────────────┐
│  Error Handling         │
│  - Categorize error     │
│  - User-friendly message│
│  - Throw error          │
└─────────────────────────┘
```

## 🌐 Network Topology

### Development Mode (Mobile Hotspot)

```
┌────────────────────────────────────────────────┐
│                  Mobile Phone                  │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │         Mobile Hotspot Active            │ │
│  │         IP: 192.168.43.1                 │ │
│  │                                          │ │
│  │  ┌────────────────────────────────────┐ │ │
│  │  │     Bug Tracker App Running        │ │ │
│  │  │                                    │ │ │
│  │  │  Connects to:                      │ │ │
│  │  │  http://192.168.43.100:5000       │ │ │
│  │  └────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────┘ │
└────────────────────┬───────────────────────────┘
                     │ WiFi Hotspot
                     │
┌────────────────────▼───────────────────────────┐
│               Computer/Laptop                  │
│                                                │
│  Connected to: Phone's Hotspot                │
│  IP Address: 192.168.43.100                   │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │         Backend Server Running           │ │
│  │                                          │ │
│  │  Host: 0.0.0.0                          │ │
│  │  Port: 5000                             │ │
│  │                                          │ │
│  │  Accessible at:                         │ │
│  │  http://192.168.43.100:5000            │ │
│  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

### Development Mode (Same WiFi)

```
┌────────────────────────────────────────────────┐
│              WiFi Router                       │
│              192.168.1.1                       │
└──────┬─────────────────────────────┬───────────┘
       │                             │
       │                             │
┌──────▼────────────┐       ┌────────▼──────────┐
│  Mobile Phone     │       │  Computer/Laptop  │
│                   │       │                   │
│  IP: 192.168.1.50 │       │  IP: 192.168.1.100│
│                   │       │                   │
│  ┌─────────────┐ │       │  ┌──────────────┐ │
│  │ Bug Tracker │ │       │  │ Backend      │ │
│  │ App         │ │       │  │ Server       │ │
│  │             │ │       │  │              │ │
│  │ Connects to:│◄┼───────┼─►│ Port: 5000   │ │
│  │ 192.168.1   │ │       │  │              │ │
│  │ .100:5000   │ │       │  │              │ │
│  └─────────────┘ │       │  └──────────────┘ │
└───────────────────┘       └───────────────────┘
```

## 🔐 Security Layers

```
┌─────────────────────────────────────────────────┐
│               Mobile App Request                 │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│           Network Layer (HTTPS)                  │
│  - TLS encryption (production)                  │
│  - Certificate validation                       │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│          Firewall (Port 5000)                   │
│  - Windows Defender / UFW / iptables            │
│  - Allow incoming on 5000                       │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│          Backend Server (Express)                │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ 1. Rate Limiter (100 req/15min)           │ │
│  └────────────────┬───────────────────────────┘ │
│                   ▼                              │
│  ┌────────────────────────────────────────────┐ │
│  │ 2. Helmet (Security Headers)              │ │
│  └────────────────┬───────────────────────────┘ │
│                   ▼                              │
│  ┌────────────────────────────────────────────┐ │
│  │ 3. CORS Validation                        │ │
│  └────────────────┬───────────────────────────┘ │
│                   ▼                              │
│  ┌────────────────────────────────────────────┐ │
│  │ 4. JWT Authentication                     │ │
│  │    - Verify token                         │ │
│  │    - Check expiration                     │ │
│  └────────────────┬───────────────────────────┘ │
│                   ▼                              │
│  ┌────────────────────────────────────────────┐ │
│  │ 5. Route Handler                          │ │
│  │    - Process request                      │ │
│  │    - Query database                       │ │
│  └────────────────┬───────────────────────────┘ │
│                   ▼                              │
│  ┌────────────────────────────────────────────┐ │
│  │ 6. Response Standardizer                 │ │
│  │    - Format response                      │ │
│  │    - Compress (gzip)                      │ │
│  └────────────────┬───────────────────────────┘ │
└───────────────────┼──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│            Return to Mobile App                  │
│  - Cache response (if applicable)               │
│  - Parse and display                            │
└─────────────────────────────────────────────────┘
```

## 📊 Configuration Hierarchy

```
networkConfig.js (Master Configuration)
├── BACKEND_URL
│   └── Used by: authConfig, networkUtils, enhancedNetworkUtils
│
├── FALLBACK_URLS[]
│   └── Used by: networkUtils, enhancedNetworkUtils
│
├── TIMEOUTS{}
│   ├── AUTH (12s) → authConfig.AUTH_TIMEOUT
│   ├── UPLOAD (30s) → getTimeoutForEndpoint()
│   ├── DASHBOARD (8s) → getTimeoutForEndpoint()
│   ├── DEFAULT (6s) → getTimeoutForEndpoint()
│   └── HEALTH_CHECK (3s) → testServerConnectivity()
│
├── RETRY{}
│   ├── MAX_RETRIES (3) → authConfig.MAX_RETRIES
│   ├── BASE_DELAY (1s) → calculateRetryDelay()
│   └── EXPONENTIAL_BACKOFF → calculateRetryDelay()
│
├── CACHE{}
│   ├── DURATION (3min) → getCachedResponse()
│   ├── MAX_SIZE (100) → setCachedResponse()
│   └── EXCLUDE_PATTERNS[] → shouldCacheEndpoint()
│
└── HEALTH_ENDPOINTS[]
    └── Used by: testServerConnectivity()
```

## 🔧 Helper Functions

```
networkConfig.js exports:
├── getTimeoutForEndpoint(endpoint)
│   └── Returns: timeout in ms based on endpoint type
│
├── shouldCacheEndpoint(endpoint)
│   └── Returns: boolean if endpoint should be cached
│
├── calculateRetryDelay(attempt)
│   └── Returns: delay in ms with exponential backoff + jitter
│
├── getAllUrls()
│   └── Returns: [primary, ...fallbacks] deduplicated
│
└── getNetworkQuality(latency)
    └── Returns: 'good' | 'fair' | 'poor' | 'offline'
```

## 🎯 Usage Examples

### Basic API Request
```javascript
import { apiRequest } from '../utils/networkUtils';

// Automatically uses configured timeouts, retries, and caching
const bugs = await apiRequest('/api/bugs');
```

### Test Server Connectivity
```javascript
import { testServerConnectivity } from '../utils/networkUtils';

const server = await testServerConnectivity();
// Tries all URLs with all health endpoints
// Returns first reachable URL
```

### Monitor Network Quality
```javascript
import { getNetworkQuality } from '../utils/enhancedNetworkUtils';

const quality = await getNetworkQuality();
console.log(quality.quality); // 'good', 'fair', 'poor', 'offline'
console.log(quality.latency); // response time in ms
```

---

**Last Updated:** October 5, 2025
