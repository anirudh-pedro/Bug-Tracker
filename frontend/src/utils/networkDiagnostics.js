import { Platform } from 'react-native';
import { API_CONFIG } from '../config/networkConfig';

/**
 * Network connectivity testing utility
 * - Tests internet connectivity
 * - Tests server connectivity
 * - Provides diagnostic information
 */

/**
 * Get network information to aid in debugging connectivity issues
 * @returns {Promise<Object>} Network information
 */
export const getNetworkInfo = async () => {
  try {
    // Since we don't have NetInfo, we'll use a simpler approach
    const isConnected = true; // We assume the device has connectivity
    
    // Get IP addresses on device if available (using external API)
    let ipAddresses = { publicIp: 'unknown', deviceIp: 'unknown' };
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json', { 
        timeout: 5000 
      });
      const ipData = await ipResponse.json();
      ipAddresses.publicIp = ipData.ip;
    } catch (e) {
      console.log('Could not determine public IP:', e.message);
    }

    // Build network report
    const networkInfo = {
      isConnected: isConnected,
      isInternetReachable: true, // Assume internet is reachable
      type: 'unknown', // Without NetInfo, we don't know the connection type
      details: {},
      isWifi: Platform.OS === 'ios' ? true : false, // Just a guess based on platform
      isCellular: Platform.OS === 'android' ? true : false, // Just a guess based on platform
      serverUrl: API_CONFIG.BASE_URL,
      appNetworkConfig: API_CONFIG,
      timestamp: new Date().toISOString(),
      ipAddresses,
      troubleshooting: {
        suggestedCommands: [
          'adb devices                 # List connected devices',
          'adb reverse tcp:5000 tcp:5000  # Set up port forwarding',
          'adb shell netstat -tunlp    # Check network connections on device',
          'adb shell ip addr           # Get device IP addresses'
        ]
      }
    };

    console.log('📡 Network diagnostics:', networkInfo);
    
    return networkInfo;
  } catch (error) {
    console.error('Error getting network info:', error);
    return { 
      isConnected: false,
      isInternetReachable: false,
      error: error.message 
    };
  }
};

/**
 * Tests if we can reach the internet at all (even if server is unreachable)
 * This helps distinguish between network issues and server issues
 */
export const testInternetConnectivity = async () => {
  const urls = [
    'https://www.google.com',
    'https://www.cloudflare.com',
    'https://www.microsoft.com'
  ];
  
  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, { 
        method: 'HEAD', // Just get headers, not body
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`✅ Internet connectivity verified via ${url}`);
        return { success: true, url };
      }
    } catch (e) {
      console.log(`❌ Could not reach ${url}: ${e.message}`);
    }
  }
  
  console.log('❌ Internet connectivity test failed on all URLs');
  return { success: false };
};

/**
 * Test if device can connect to the server
 */
export const testServerConnectivity = async () => {
  try {
    const url = `${API_CONFIG.BASE_URL}/api/health`;
    console.log(`Testing server connectivity to: ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Server connectivity verified: ${JSON.stringify(data)}`);
      return { success: true, data };
    } else {
      console.log(`❌ Server returned error status: ${response.status}`);
      return { success: false, status: response.status };
    }
  } catch (error) {
    console.error('Server connectivity test failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Try alternative server URLs
 */
export const tryAlternativeUrls = async () => {
  const results = {};
  const urls = Object.values(API_CONFIG.URLS || {});
  
  if (urls.length === 0) {
    console.log('No alternative URLs configured');
    return { noAlternatives: true };
  }
  
  for (const url of urls) {
    try {
      console.log(`Testing alternative URL: ${url}/api/health`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${url}/api/health`, { 
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Alternative URL working: ${url}`);
        results[url] = { success: true, data };
      } else {
        console.log(`❌ Alternative URL returned error: ${url} (${response.status})`);
        results[url] = { success: false, status: response.status };
      }
    } catch (error) {
      console.log(`❌ Alternative URL failed: ${url} (${error.message})`);
      results[url] = { success: false, error: error.message };
    }
  }
  
  return results;
};

/**
 * Comprehensive connectivity test
 */
export const runNetworkDiagnostics = async () => {
  console.log('🔍 Running comprehensive network diagnostics...');
  
  const networkInfo = await getNetworkInfo();
  const internetConnectivity = await testInternetConnectivity();
  const serverConnectivity = await testServerConnectivity();
  
  // Only try alternative URLs if main server connection failed
  const alternativeUrls = !serverConnectivity.success 
    ? await tryAlternativeUrls() 
    : null;
  
  const results = {
    timestamp: new Date().toISOString(),
    device: {
      platform: Platform.OS,
      version: Platform.Version,
    },
    networkInfo,
    internetConnectivity,
    serverConnectivity,
    alternativeUrls,
    serverConfig: {
      mainUrl: API_CONFIG.BASE_URL,
      alternativeUrls: API_CONFIG.URLS,
    }
  };
  
  console.log('📊 Network diagnostics complete:', results);
  return results;
};

/**
 * Get troubleshooting steps based on diagnostic results
 */
export const getTroubleshootingSteps = (diagnostics) => {
  console.log('Generating troubleshooting steps from diagnostics');
  const steps = [];
  
  if (!diagnostics.networkInfo.isConnected) {
    steps.push('Your device is not connected to any network. Please check your Wi-Fi or mobile data connection.');
  }
  else if (!diagnostics.internetConnectivity.success) {
    steps.push('Your device has a network connection but cannot access the internet. Please check your Wi-Fi or mobile data connection.');
  }
  else if (!diagnostics.serverConnectivity.success) {
    steps.push(`Cannot connect to the server at ${API_CONFIG.BASE_URL}. Possible issues:`);
    steps.push('- The server might not be running');
    steps.push('- Your device and server might be on different networks');
    steps.push('- A firewall might be blocking the connection');
    
    // Add ADB reverse suggestion for Android
    if (Platform.OS === 'android') {
      steps.push('\nTry running this command on your development machine:');
      steps.push('adb reverse tcp:5000 tcp:5000');
      steps.push('This will forward your device\'s port 5000 to your computer\'s port 5000');
    }
  }
  
  // Check if any alternative URLs worked
  if (diagnostics.alternativeUrls && !diagnostics.alternativeUrls.noAlternatives) {
    const workingUrls = Object.entries(diagnostics.alternativeUrls)
      .filter(([_, result]) => result.success)
      .map(([url, _]) => url);
    
    if (workingUrls.length > 0) {
      steps.push('\nThe following alternative URLs are working:');
      workingUrls.forEach(url => steps.push(`- ${url}`));
      steps.push('Consider updating your network configuration to use one of these URLs.');
    }
  }
  
  return steps;
};

export default {
  getNetworkInfo,
  testInternetConnectivity,
  testServerConnectivity,
  tryAlternativeUrls,
  runNetworkDiagnostics,
  getTroubleshootingSteps,
};
