import NETWORK_CONFIG, {
  getAllUrls,
  getTimeoutForEndpoint as getTimeout,
  calculateRetryDelay,
  getNetworkQuality as getQualityFromLatency
} from '../config/networkConfig';
import { requiresAuth } from '../config/apiConfig';

/**
 * Enhanced network utility with improved error handling and retry logic
 * Optimized for mobile networks
 */

let inMemoryAuthToken = null;

export const setInMemoryAuthToken = (token) => {
  inMemoryAuthToken = token;
};

export const clearInMemoryAuthToken = () => {
  inMemoryAuthToken = null;
};

// Network error types for better categorization
export const NETWORK_ERROR_TYPES = {
  TIMEOUT: 'TIMEOUT',
  CONNECTION_REFUSED: 'CONNECTION_REFUSED',
  DNS_ERROR: 'DNS_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  PARSE_ERROR: 'PARSE_ERROR',
  UNKNOWN: 'UNKNOWN'
};

// Categorize network errors for better handling
export const categorizeNetworkError = (error) => {
  const message = error.message.toLowerCase();
  
  if (error.name === 'AbortError' || message.includes('timeout')) {
    return NETWORK_ERROR_TYPES.TIMEOUT;
  }
  
  if (message.includes('connection refused') || message.includes('econnrefused')) {
    return NETWORK_ERROR_TYPES.CONNECTION_REFUSED;
  }
  
  if (message.includes('enotfound') || message.includes('dns')) {
    return NETWORK_ERROR_TYPES.DNS_ERROR;
  }
  
  if (message.includes('server error') || message.includes('5')) {
    return NETWORK_ERROR_TYPES.SERVER_ERROR;
  }
  
  if (message.includes('auth') || message.includes('unauthorized')) {
    return NETWORK_ERROR_TYPES.AUTH_ERROR;
  }
  
  if (message.includes('parse') || message.includes('json')) {
    return NETWORK_ERROR_TYPES.PARSE_ERROR;
  }
  
  return NETWORK_ERROR_TYPES.UNKNOWN;
};

// Enhanced server connectivity test with health check fallbacks
export const testServerConnectivity = async () => {
  const urlsToTest = getAllUrls();

  console.log('🔍 Testing server connectivity...');
  
  // Health check endpoints from network config
  const healthEndpoints = NETWORK_CONFIG.HEALTH_ENDPOINTS;
  
  for (const url of urlsToTest) {
    console.log(`🔗 Testing: ${url}`);
    
    for (const endpoint of healthEndpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log(`⏰ Connectivity test timeout for ${url}${endpoint}`);
          controller.abort();
        }, NETWORK_CONFIG.TIMEOUTS.HEALTH_CHECK);
        
        const response = await fetch(`${url}${endpoint}`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log(`✅ Server reachable at: ${url} (via ${endpoint})`);
          return { url, healthEndpoint: endpoint };
        }
        
      } catch (error) {
        const errorType = categorizeNetworkError(error);
        console.log(`❌ ${errorType}: ${url}${endpoint} - ${error.message}`);
      }
    }
  }
  
  console.log('❌ No server URL is reachable');
  return null;
};

// Enhanced API request with exponential backoff and circuit breaker pattern
export const apiRequest = async (endpoint, options = {}) => {
  const urlsToTry = getAllUrls();

  const maxRetries = options.maxRetries || NETWORK_CONFIG.RETRY.MAX_RETRIES;
  let lastError = null;
  
  // Dynamic timeout based on endpoint type
  const timeout = getTimeout(endpoint);

  // Get authentication token
  const authToken = await getAuthToken(options.authToken);
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    console.log(`🔄 API Request attempt ${attempt + 1}/${maxRetries}`);
    
    for (const baseUrl of urlsToTry) {
      try {
        const result = await makeRequestWithTimeout(
          baseUrl, 
          endpoint, 
          options, 
          authToken, 
          timeout
        );
        
        console.log(`✅ API request successful to: ${baseUrl}${endpoint}`);
        return result;
        
      } catch (error) {
        const errorType = categorizeNetworkError(error);
        console.log(`❌ ${errorType} at ${baseUrl}${endpoint}: ${error.message}`);
        lastError = error;
        
        // Skip remaining URLs for auth errors (will fail on all)
        if (errorType === NETWORK_ERROR_TYPES.AUTH_ERROR) {
          return {
            success: false,
            message: 'Authentication failed. Please log in again.',
            authError: true
          };
        }

        // Break out early for non-recoverable network issues
        if ([
          NETWORK_ERROR_TYPES.CONNECTION_REFUSED,
          NETWORK_ERROR_TYPES.DNS_ERROR
        ].includes(errorType)) {
          console.log('🚫 Fatal network error detected - skipping additional retries');
          attempt = maxRetries - 1; // Prevent outer retry loop from running again
          break;
        }
      }
    }
    
    // Exponential backoff between retry attempts
    if (attempt < maxRetries - 1) {
      const delay = calculateRetryDelay(attempt);
      console.log(`⏳ Waiting ${Math.round(delay)}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.log('❌ All API endpoints failed after all retries');
  
  // Provide user-friendly error messages based on error type
  const errorType = categorizeNetworkError(lastError || new Error('Network request failed'));
  const userMessage = getUserFriendlyErrorMessage(errorType);

  const networkError = new Error(userMessage);
  networkError.code = errorType;
  networkError.cause = lastError;
  
  throw networkError;
};

// Get authentication token with error handling
const getAuthToken = async (overrideToken = null) => {
  try {
    if (overrideToken) {
      inMemoryAuthToken = overrideToken;
      return overrideToken;
    }

    if (inMemoryAuthToken) {
      return inMemoryAuthToken;
    }

    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const token = await AsyncStorage.getItem('userToken');
    
    if (token) {
      console.log('🔑 Using auth token for API request');
      inMemoryAuthToken = token;
    } else {
      console.log('⚠️ No auth token found');
    }
    
    return token;
  } catch (error) {
    console.log('❌ Error getting auth token:', error);
    return null;
  }
};

// Make request with proper timeout handling
const makeRequestWithTimeout = async (baseUrl, endpoint, options, authToken, timeout) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log(`⏰ Request timeout after ${timeout}ms`);
    controller.abort();
  }, timeout);

  try {
    // Prepare headers with authentication
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available and not a public endpoint
    if (authToken && shouldIncludeAuthToken(endpoint)) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers,
    });
    
    clearTimeout(timeoutId);
    
    return await handleResponse(response);
    
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Determine if auth token should be included for endpoint
const shouldIncludeAuthToken = (endpoint) => {
  return requiresAuth(endpoint);
};

// Handle response with proper error categorization
const handleResponse = async (response) => {
  if (response.ok || response.status < 500) {
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
      
      return data;
    } catch (parseError) {
      console.log('⚠️ Failed to parse response as JSON:', parseError);
      throw new Error('Invalid response format from server');
    }
  } else {
    console.log(`❌ Server error: ${response.status}`);
    throw new Error(`Server error: ${response.status}`);
  }
};

// Get user-friendly error messages
const getUserFriendlyErrorMessage = (errorType) => {
  switch (errorType) {
    case NETWORK_ERROR_TYPES.TIMEOUT:
      return 'Request timed out. Please check your internet connection and try again.';
    case NETWORK_ERROR_TYPES.CONNECTION_REFUSED:
      return 'Unable to connect to server. Please try again later.';
    case NETWORK_ERROR_TYPES.DNS_ERROR:
      return 'Network connectivity issue. Please check your internet connection.';
    case NETWORK_ERROR_TYPES.SERVER_ERROR:
      return 'Server is experiencing issues. Please try again later.';
    case NETWORK_ERROR_TYPES.AUTH_ERROR:
      return 'Authentication failed. Please log in again.';
    case NETWORK_ERROR_TYPES.PARSE_ERROR:
      return 'Received invalid response from server. Please try again.';
    default:
      return 'Network request failed. Please check your connection and try again.';
  }
};

// Check network connectivity with ping-like functionality
export const checkNetworkConnectivity = async () => {
  try {
    // Use a reliable external service for connectivity check
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://httpbin.org/status/200', {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
    
  } catch (error) {
    console.log('❌ Network connectivity check failed:', error.message);
    return false;
  }
};

// Get network quality metrics
export const getNetworkQuality = async () => {
  const startTime = Date.now();
  
  try {
    const connectivity = await testServerConnectivity();
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    const quality = getQualityFromLatency(latency);
    
    return {
      isConnected: !!connectivity,
      latency,
      quality,
      serverUrl: connectivity?.url || null
    };
  } catch (error) {
    return {
      isConnected: false,
      latency: -1,
      quality: 'offline',
      serverUrl: null
    };
  }
};

export default {
  apiRequest,
  testServerConnectivity,
  checkNetworkConnectivity,
  getNetworkQuality,
  categorizeNetworkError,
  NETWORK_ERROR_TYPES,
  setInMemoryAuthToken,
  clearInMemoryAuthToken
};