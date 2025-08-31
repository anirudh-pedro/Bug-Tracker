import { AUTH_CONFIG } from '../config/authConfig';

// Test server connectivity with multiple URLs
export const testServerConnectivity = async () => {
  const urlsToTest = [
    AUTH_CONFIG.BACKEND_URL,
    ...AUTH_CONFIG.FALLBACK_URLS
  ];

  console.log('🔍 Testing server connectivity...');
  
  for (const url of urlsToTest) {
    try {
      console.log(`🔗 Testing: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${url}/api/users/debug-public`, {
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
      console.log(`❌ Connection failed to ${url}:`, error.message);
    }
  }
  
  console.log('❌ No server URL is reachable');
  return null;
};

// Make API request with automatic fallback URLs
export const apiRequest = async (endpoint, options = {}) => {
  const urlsToTry = [
    AUTH_CONFIG.BACKEND_URL,
    ...AUTH_CONFIG.FALLBACK_URLS
  ];

  let lastError = null;

  for (const baseUrl of urlsToTry) {
    try {
      console.log(`🔗 Trying API request to: ${baseUrl}${endpoint}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok || response.status < 500) {
        // Return response for both success and client errors (4xx)
        console.log(`✅ API request successful to: ${baseUrl}${endpoint}`);
        return response;
      } else {
        console.log(`❌ Server error at ${baseUrl}${endpoint}: ${response.status}`);
        lastError = new Error(`Server error: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Request failed to ${baseUrl}${endpoint}:`, error.message);
      lastError = error;
    }
  }
  
  console.log('❌ All API endpoints failed');
  throw lastError || new Error('Network request failed - no servers reachable');
};
