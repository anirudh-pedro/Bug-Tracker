/**
 * Network Configuration
 * Centralized network settings optimized for mobile networks
 */

// Detect if running in development mode
const isDevelopment = __DEV__;

/**
 * Backend URL Configuration
 * For mobile network: Use your computer's LAN IP address
 * 
 * To find your computer's IP:
 * - Windows: Run `ipconfig` in command prompt, look for IPv4 Address
 * - Mac/Linux: Run `ifconfig` in terminal, look for inet address
 * 
 * Make sure:
 * 1. Phone and computer are on the same network (or use mobile hotspot)
 * 2. Firewall allows incoming connections on port 5000
 * 3. Server is running with HOST='0.0.0.0' (already configured)
 */

// Determine development backend URL based on environment/platform
const resolveDevelopmentBackendUrl = () => {
  // Allow overriding through Metro env (RN 0.72+) or Expo extras
  const envUrl =
    process.env.BUGTRACKER_API_URL ||
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.REACT_NATIVE_APP_API_URL ||
    process.env.API_URL;

  if (envUrl && envUrl.trim().length) {
    return envUrl.trim().replace(/\/$/, '');
  }

  // Fallback to local defaults depending on platform
  try {
    const { Platform } = require('react-native');
    if (Platform.OS === 'android') {
      // Android emulator uses the special 10.0.2.2 host to access the PC
      return 'http://10.0.2.2:5000';
    }
    // iOS simulator (and Metro on desktop) can talk to localhost directly
    return 'http://127.0.0.1:5000';
  } catch (error) {
    // If Platform isn't available (e.g. during Jest), fall back to localhost
    return 'http://127.0.0.1:5000';
  }
};

const developmentBackendUrl = resolveDevelopmentBackendUrl();

export const NETWORK_CONFIG = {
  // Primary backend URL
  // Override via BUGTRACKER_API_URL / EXPO_PUBLIC_API_URL to point at a real server
  BACKEND_URL: isDevelopment
    ? 'http://10.126.128.115:5000'  // Current Network IP from backend
    : 'https://your-production-api.com',
  
  /**
   * Fallback URLs - Ordered by reliability for mobile networks
   * 
   * Mobile Network Priority:
   * 1. Computer's WiFi/Mobile Hotspot IP
   * 2. Computer's Ethernet IP (if on same network)
   * 3. localhost (only works with adb reverse for Android emulator)
   */
  FALLBACK_URLS: isDevelopment 
    ? [
        'http://10.126.128.115:5000',  // Current Network IP (from backend)
        developmentBackendUrl,
        'http://10.0.2.2:5000',   // Android emulator special host
        'http://127.0.0.1:5000',  // iOS simulator / desktop
        'http://localhost:5000',  // Node/Metro environment
      ]
    : [],
  
  /**
   * Timeout Configuration (in milliseconds)
   * Adjusted for mobile networks which can be slower than WiFi
   */
  TIMEOUTS: {
    // Authentication endpoints - longer timeout for mobile networks
    AUTH: 12000,           // 12 seconds (increased from 10s)
    
    // File upload endpoints - very generous for mobile data
    UPLOAD: 30000,         // 30 seconds
    
    // Dashboard/Analytics - moderate timeout
    DASHBOARD: 8000,       // 8 seconds
    
    // Standard API calls - balanced for mobile
    DEFAULT: 6000,         // 6 seconds (increased from 4s)
    
    // Quick connectivity check
    HEALTH_CHECK: 3000,    // 3 seconds
    
    // Sign out - quick operation
    SIGN_OUT: 5000,        // 5 seconds
  },
  
  /**
   * Retry Configuration
   * More aggressive retries for unreliable mobile networks
   */
  RETRY: {
    // Maximum number of retry attempts
    MAX_RETRIES: 3,
    
    // Base delay for exponential backoff (milliseconds)
    BASE_DELAY: 1000,      // 1 second
    
    // Maximum backoff delay
    MAX_DELAY: 8000,       // 8 seconds
    
    // Enable exponential backoff
    EXPONENTIAL_BACKOFF: true,
    
    // Add random jitter to prevent thundering herd
    JITTER: true,
  },
  
  /**
   * Cache Configuration
   * Aggressive caching for mobile to reduce data usage
   */
  CACHE: {
    // Enable response caching
    ENABLED: true,
    
    // Cache duration (milliseconds)
    DURATION: 3 * 60 * 1000,  // 3 minutes (increased from 2)
    
    // Maximum cache size (number of entries)
    MAX_SIZE: 100,            // Increased from 50
    
    // Endpoints to exclude from caching
    EXCLUDE_PATTERNS: [
      '/auth/login',
      '/auth/signup',
      '/auth/refresh',
      '/auth/logout',
    ],
  },
  
  /**
   * Request Optimization for Mobile
   */
  OPTIMIZATION: {
    // Enable request deduplication
    DEDUPLICATE_REQUESTS: true,
    
    // Enable response compression
    COMPRESSION: true,
    
    // Batch requests when possible
    BATCH_REQUESTS: false, // TODO: Implement batching
    
    // Prefetch common resources
    PREFETCH: false,       // TODO: Implement prefetching
  },
  
  /**
   * Network Quality Thresholds
   * Used to adapt behavior based on connection quality
   */
  QUALITY_THRESHOLDS: {
    // Good network: < 1 second response
    GOOD: 1000,
    
    // Fair network: 1-3 seconds response
    FAIR: 3000,
    
    // Poor network: > 3 seconds response
    POOR: 3000,
  },
  
  /**
   * Mobile-specific settings
   */
  MOBILE: {
    // Auto-detect network type (WiFi vs Cellular)
    AUTO_DETECT_NETWORK: true,
    
    // Reduce image quality on cellular
    OPTIMIZE_IMAGES_ON_CELLULAR: true,
    
    // Disable auto-refresh on poor connection
    DISABLE_AUTO_REFRESH_ON_POOR_CONNECTION: true,
    
    // Show network quality indicator
    SHOW_NETWORK_INDICATOR: true,
  },
  
  /**
   * Health check endpoints (in order of preference)
   */
  HEALTH_ENDPOINTS: [
    '/api/health',
    '/api/test/health',
    '/api/users/debug-public',
  ],
  
  /**
   * Storage keys for network configuration
   */
  STORAGE_KEYS: {
    LAST_SUCCESSFUL_URL: 'network_last_successful_url',
    NETWORK_QUALITY: 'network_quality_metrics',
    PREFERRED_URL: 'network_preferred_url',
  },
};

/**
 * Get timeout for specific endpoint
 * @param {string} endpoint - API endpoint path
 * @returns {number} Timeout in milliseconds
 */
export const getTimeoutForEndpoint = (endpoint) => {
  if (endpoint.includes('/auth/')) {
    return NETWORK_CONFIG.TIMEOUTS.AUTH;
  }
  if (endpoint.includes('/upload')) {
    return NETWORK_CONFIG.TIMEOUTS.UPLOAD;
  }
  if (endpoint.includes('/dashboard')) {
    return NETWORK_CONFIG.TIMEOUTS.DASHBOARD;
  }
  if (endpoint.includes('/health')) {
    return NETWORK_CONFIG.TIMEOUTS.HEALTH_CHECK;
  }
  return NETWORK_CONFIG.TIMEOUTS.DEFAULT;
};

/**
 * Check if endpoint should be cached
 * @param {string} endpoint - API endpoint path
 * @returns {boolean} Whether to cache this endpoint
 */
export const shouldCacheEndpoint = (endpoint) => {
  if (!NETWORK_CONFIG.CACHE.ENABLED) {
    return false;
  }
  
  return !NETWORK_CONFIG.CACHE.EXCLUDE_PATTERNS.some(pattern => 
    endpoint.includes(pattern)
  );
};

/**
 * Calculate retry delay with exponential backoff and jitter
 * @param {number} attempt - Current attempt number (0-based)
 * @returns {number} Delay in milliseconds
 */
export const calculateRetryDelay = (attempt) => {
  const { BASE_DELAY, MAX_DELAY, EXPONENTIAL_BACKOFF, JITTER } = NETWORK_CONFIG.RETRY;
  
  let delay = BASE_DELAY;
  
  if (EXPONENTIAL_BACKOFF) {
    delay = Math.min(BASE_DELAY * Math.pow(2, attempt), MAX_DELAY);
  }
  
  if (JITTER) {
    // Add random jitter (0-50% of delay)
    delay += Math.random() * delay * 0.5;
  }
  
  return Math.round(delay);
};

/**
 * Get all URLs to try (primary + fallbacks)
 * @returns {string[]} Array of URLs
 */
export const getAllUrls = () => {
  return [
    NETWORK_CONFIG.BACKEND_URL,
    ...NETWORK_CONFIG.FALLBACK_URLS,
  ].filter((url, index, self) => 
    // Remove duplicates
    self.indexOf(url) === index
  );
};

/**
 * Determine network quality from latency
 * @param {number} latency - Response time in milliseconds
 * @returns {string} Quality level: 'good', 'fair', 'poor', or 'offline'
 */
export const getNetworkQuality = (latency) => {
  if (latency < 0) return 'offline';
  if (latency < NETWORK_CONFIG.QUALITY_THRESHOLDS.GOOD) return 'good';
  if (latency < NETWORK_CONFIG.QUALITY_THRESHOLDS.FAIR) return 'fair';
  return 'poor';
};

export default NETWORK_CONFIG;
