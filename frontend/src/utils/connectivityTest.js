/**
 * Utility functions to test backend connectivity
 */

import { API_CONFIG, buildApiUrl } from '../config/apiConfig';
import { 
  runNetworkDiagnostics, 
  getTroubleshootingSteps, 
  testInternetConnectivity 
} from './networkDiagnostics';

/**
 * Tests if the backend is reachable from the device
 * @returns {Promise<{success: boolean, message: string, data: Object|null}>}
 */
export const testBackendConnectivity = async () => {
  try {
    console.log('🧪 Testing backend connectivity...');
    console.log(`🔍 Testing connection to: ${API_CONFIG.BASE_URL}`);
    
    // Use a longer timeout since we're only trying one address
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const healthEndpoint = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`;
    
    // Add a timestamp to prevent caching issues
    const timestampedUrl = `${healthEndpoint}?t=${Date.now()}`;
    console.log(`🔍 Testing endpoint: ${timestampedUrl}`);
    
    const response = await fetch(timestampedUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // If we get a response, try to parse it
    const data = await response.json();
    
    console.log('✅ Backend connectivity successful!');
    console.log('✅ Response:', data);
    
    return {
      success: true,
      message: `Successfully connected to backend at ${API_CONFIG.BASE_URL}`,
      data: data,
      url: API_CONFIG.BASE_URL
    };
  } catch (error) {
    console.error(`❌ Backend connectivity test failed: ${error.message}`);
    
    // Run comprehensive diagnostics
    console.log('� Running comprehensive network diagnostics...');
    const diagnostics = await runNetworkDiagnostics();
    const troubleshootingSteps = getTroubleshootingSteps(diagnostics);
    
    if (diagnostics.internetConnectivity.success) {
      console.log('✅ Internet is working, but server connection failed');
      console.log('💡 This suggests the issue is with the server or your connection to it');
      
      return {
        success: false,
        message: `Failed to connect to backend at ${API_CONFIG.BASE_URL}: ${error.message}`,
        data: null,
        diagnostics,
        troubleshootingSteps
      };
    } else {
      console.log('❌ Internet connectivity test failed');
      console.log('💡 This suggests your device has no internet connection');
      
      return {
        success: false,
        message: `No internet connection detected: ${error.message}`,
        data: null,
        diagnostics,
        troubleshootingSteps
      };
    }
  }
};

/**
 * Tests if the authentication endpoint is working
 * @param {string} idToken - Firebase ID token
 * @returns {Promise<{success: boolean, message: string, data: Object|null}>}
 */
export const testAuthEndpoint = async (idToken) => {
  try {
    console.log('🧪 Testing auth endpoint...');
    
    if (!idToken) {
      return {
        success: false,
        message: 'No ID token provided',
        data: null
      };
    }
    
    // We'll directly try the auth endpoint without testing connectivity first
    // to reduce the number of network calls
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const authEndpoint = buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.GOOGLE);
    console.log(`🔍 Testing auth endpoint: ${authEndpoint}`);
    
    const response = await fetch(authEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store',
      },
      body: JSON.stringify({ idToken }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const data = await response.json();
    
    console.log('✅ Auth endpoint test result:', {
      status: response.status,
      success: data.success,
      hasUser: !!data.user,
      message: data.message || 'No message'
    });
    
    return {
      success: true,
      message: 'Successfully tested auth endpoint',
      data: data
    };
  } catch (error) {
    console.error('❌ Auth endpoint test failed:', error.message);
    
    // Run comprehensive diagnostics
    const diagnostics = await runNetworkDiagnostics();
    const troubleshootingSteps = getTroubleshootingSteps(diagnostics);
    
    return {
      success: false,
      message: `Failed to test auth endpoint: ${error.message}`,
      data: null,
      diagnostics,
      troubleshootingSteps
    };
  }
};
