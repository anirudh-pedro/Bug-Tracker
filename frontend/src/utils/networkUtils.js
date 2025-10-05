import NETWORK_CONFIG, { 
  getAllUrls, 
  getTimeoutForEndpoint,
  shouldCacheEndpoint 
} from '../config/networkConfig';

// Simple cache for API responses
const API_CACHE = new Map();

// Request deduplication - prevent multiple identical simultaneous requests
const PENDING_REQUESTS = new Map();

const getCacheKey = (endpoint, options) => {
  return `${endpoint}_${JSON.stringify(options || {})}`;
};

const getCachedResponse = (cacheKey) => {
  const cached = API_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < NETWORK_CONFIG.CACHE.DURATION) {
    console.log('📦 Using cached response for:', cacheKey);
    return cached.data;
  }
  return null;
};

const setCachedResponse = (cacheKey, data) => {
  API_CACHE.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  // Clean old entries periodically
  if (API_CACHE.size > NETWORK_CONFIG.CACHE.MAX_SIZE) {
    const firstKey = API_CACHE.keys().next().value;
    API_CACHE.delete(firstKey);
  }
};

// Test server connectivity with multiple URLs
export const testServerConnectivity = async () => {
  const urlsToTest = getAllUrls();

  console.log('🔍 Testing server connectivity...');
  
  for (const url of urlsToTest) {
    try {
      console.log(`🔗 Testing: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log(`⏰ Connectivity test timeout for ${url}`);
        controller.abort();
      }, NETWORK_CONFIG.TIMEOUTS.HEALTH_CHECK);
      
      const response = await fetch(`${url}/api/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`✅ Server reachable at: ${url}`);
        return url;
      } else {
        console.log(`❌ Server responded with error at ${url}: ${response.status}`);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`⏰ Connectivity test timed out for ${url}`);
      } else {
        console.log(`❌ Connection failed to ${url}:`, error.message);
      }
    }
  }
  
  console.log('❌ No server URL is reachable');
  return null;
};

// Make API request with automatic fallback URLs
export const apiRequest = async (endpoint, options = {}) => {
  // Check cache for GET requests (non-auth endpoints)
  const isGetRequest = !options.method || options.method === 'GET';
  const shouldCache = isGetRequest && shouldCacheEndpoint(endpoint);
  const cacheKey = getCacheKey(endpoint, options);
  
  if (shouldCache) {
    const cachedResponse = getCachedResponse(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Check if the same request is already in progress
    if (PENDING_REQUESTS.has(cacheKey)) {
      console.log('⏳ Request already in progress, waiting for result:', cacheKey);
      return await PENDING_REQUESTS.get(cacheKey);
    }
  }

  // Create promise for deduplication
  const requestPromise = performRequest(endpoint, options, shouldCache, cacheKey);
  
  if (shouldCache && NETWORK_CONFIG.OPTIMIZATION.DEDUPLICATE_REQUESTS) {
    PENDING_REQUESTS.set(cacheKey, requestPromise);
    try {
      const result = await requestPromise;
      return result;
    } finally {
      PENDING_REQUESTS.delete(cacheKey);
    }
  }
  
  return await requestPromise;
};

const performRequest = async (endpoint, options, shouldCache, cacheKey) => {
  const urlsToTry = getAllUrls();

  let lastError = null;
  
  // Use network config timeouts
  const timeout = getTimeoutForEndpoint(endpoint);

  // Get authentication token from AsyncStorage
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  let authToken = null;
  try {
    authToken = await AsyncStorage.getItem('userToken');
    if (authToken) {
      console.log('🔑 Using auth token for API request');
    } else {
      console.log('⚠️ No auth token found');
    }
  } catch (error) {
    console.log('❌ Error getting auth token:', error);
  }

  for (const baseUrl of urlsToTry) {
    try {
      console.log(`🔗 Trying API request to: ${baseUrl}${endpoint} (timeout: ${timeout}ms)`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log(`⏰ Request timeout after ${timeout}ms`);
        controller.abort();
      }, timeout);

      // Prepare headers with authentication
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Add auth token if available and not a public endpoint
      if (authToken && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/signup') && !endpoint.includes('/auth/google')) {
        headers.Authorization = `Bearer ${authToken}`;
      }
      
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok || response.status < 500) {
        // Parse JSON and return data for both success and client errors (4xx)
        console.log(`✅ API request successful to: ${baseUrl}${endpoint}`);
        try {
          const data = await response.json();
          
          // Handle authentication errors specifically
          if (response.status === 401) {
            console.log('🔒 Authentication failed - invalid or expired token');
            return { 
              success: false, 
              message: 'Authentication failed. Please log in again.',
              authError: true 
            };
          }
          
          // Cache successful GET responses
          if (shouldCache && response.ok) {
            setCachedResponse(cacheKey, data);
          }
          
          return data;
        } catch (parseError) {
          console.log('⚠️ Failed to parse response as JSON:', parseError);
          return { success: false, message: 'Invalid response format' };
        }
      } else {
        console.log(`❌ Server error at ${baseUrl}${endpoint}: ${response.status}`);
        lastError = new Error(`Server error: ${response.status}`);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`⏰ Request timed out to ${baseUrl}${endpoint} after ${timeout}ms`);
        lastError = new Error(`Request timed out after ${timeout / 1000} seconds`);
      } else {
        console.log(`❌ Request failed to ${baseUrl}${endpoint}:`, error.message);
        lastError = error;
      }
    }
  }
  
  console.log('❌ All API endpoints failed');
  throw lastError || new Error('Network request failed - no servers reachable');
};
