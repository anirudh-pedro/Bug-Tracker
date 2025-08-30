// Import the centralized network configuration
import { API_CONFIG as NETWORK_CONFIG, buildApiUrl as networkBuildApiUrl } from './networkConfig';

// Re-export the configuration from networkConfig.js
export const API_CONFIG = NETWORK_CONFIG;

// Re-export the buildApiUrl function
export const buildApiUrl = networkBuildApiUrl;

// Function to detect the best API URL for the current environment
export const detectBestApiUrl = async () => {
  const urls = Object.values(API_CONFIG.URLS);
  
  for (const url of urls) {
    try {
      console.log(`🔍 Testing API URL: ${url}`);
      const response = await fetch(`${url}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        timeout: 2000
      });
      
      if (response.ok) {
        console.log(`✅ API URL working: ${url}`);
        return url;
      }
    } catch (error) {
      console.log(`❌ Failed API URL: ${url} - ${error.message}`);
    }
  }
  
  console.log('⚠️ No working API URL found, using default');
  return API_CONFIG.BASE_URL;
};
