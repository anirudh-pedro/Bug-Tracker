/**
 * This file helps set up port forwarding for Android devices using ADB
 * It helps developers easily connect their physical Android device to the local server
 */

import { Platform } from 'react-native';
import { API_CONFIG } from '../config/networkConfig';

/**
 * Check if ADB port forwarding could be used (Android only)
 */
export const canUseAdbPortForwarding = () => {
  return Platform.OS === 'android';
};

/**
 * Get ADB port forwarding commands
 */
export const getAdbCommands = () => {
  return {
    // Check connected devices
    listDevices: 'adb devices',
    
    // Set up port forwarding
    setupForwarding: 'adb reverse tcp:5000 tcp:5000',
    
    // Check port forwarding status
    checkForwarding: 'adb reverse --list',
    
    // Get device IP addresses
    getDeviceIps: 'adb shell ip addr',
    
    // Check device network connections
    checkNetworkConnections: 'adb shell netstat -tunlp'
  };
};

/**
 * Instructions for setting up ADB port forwarding
 * We can't run ADB commands directly from the app for security reasons,
 * but we can provide clear instructions for developers
 */
export const getAdbPortForwardingInstructions = () => {
  if (Platform.OS !== 'android') {
    return {
      canUseAdb: false,
      message: 'ADB port forwarding is only applicable for Android devices'
    };
  }

  return {
    canUseAdb: true,
    title: 'ADB Port Forwarding Instructions',
    message: 'Follow these steps to set up port forwarding for connecting to your local development server:',
    steps: [
      '1. Connect your Android device to your computer with a USB cable',
      '2. Make sure USB debugging is enabled on your device',
      '3. Open a terminal or command prompt on your computer',
      '4. Run the following commands:',
      '   adb devices               (to verify your device is connected)',
      '   adb reverse tcp:5000 tcp:5000    (to set up port forwarding)',
      '5. After running these commands, restart the app and try again'
    ],
    commands: {
      checkDevices: 'adb devices',
      setupForwarding: 'adb reverse tcp:5000 tcp:5000',
      verifyForwarding: 'adb reverse --list'
    },
    apiConfigUpdate: {
      current: API_CONFIG.BASE_URL,
      recommended: 'http://localhost:5000',
      message: 'After setting up port forwarding, you should update your API_CONFIG to use http://localhost:5000'
    }
  };
};

/**
 * Helper function to suggest using the local URL after port forwarding is set up
 */
export const suggestUsingLocalUrl = () => {
  if (Platform.OS !== 'android') return null;
  
  return {
    suggestion: 'Use localhost URL with ADB port forwarding',
    updateApiConfig: {
      oldUrl: API_CONFIG.BASE_URL,
      newUrl: 'http://localhost:5000',
      instructions: 'After setting up port forwarding, edit networkConfig.js to use localhost:5000 as SERVER_URL'
    }
  };
};

/**
 * Get network configuration recommendations based on current environment
 */
export const getNetworkRecommendations = () => {
  if (Platform.OS === 'android') {
    return {
      deviceType: 'Android Physical Device',
      recommendations: [
        {
          title: 'ADB Port Forwarding (Recommended)',
          url: 'http://localhost:5000',
          setup: 'Run: adb reverse tcp:5000 tcp:5000',
          pros: ['Most reliable', 'Works even on different networks', 'Lowest latency'],
          cons: ['Requires USB connection']
        },
        {
          title: 'Local Network IP',
          url: API_CONFIG.BASE_URL,
          setup: 'Make sure device is on same network as server',
          pros: ['No USB required', 'Works with multiple devices'],
          cons: ['Requires same network', 'IP may change']
        }
      ]
    };
  } else if (Platform.OS === 'ios') {
    return {
      deviceType: 'iOS Device',
      recommendations: [
        {
          title: 'Local Network',
          url: API_CONFIG.BASE_URL, 
          setup: 'Make sure device is on same network as server',
          pros: ['No special setup needed'],
          cons: ['Requires same network', 'IP may change']
        }
      ]
    };
  } else {
    // Web
    return {
      deviceType: 'Web Browser',
      recommendations: [
        {
          title: 'Direct Connection',
          url: 'http://localhost:5000',
          setup: 'No special setup needed',
          pros: ['Works out of the box'],
          cons: []
        }
      ]
    };
  }
};

export default {
  canUseAdbPortForwarding,
  getAdbCommands,
  getAdbPortForwardingInstructions,
  suggestUsingLocalUrl,
  getNetworkRecommendations
};
