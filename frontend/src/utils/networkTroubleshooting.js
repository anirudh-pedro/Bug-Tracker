/**
 * Common network troubleshooting solutions based on platform
 * Used to provide helpful advice when connectivity issues occur
 */
import { Platform } from 'react-native';
import { API_CONFIG } from '../config/networkConfig';

/**
 * Get troubleshooting tips for network connectivity issues
 */
export const getNetworkTroubleshootingTips = () => {
  const commonTips = [
    {
      title: "Check Server Status",
      steps: [
        "Make sure the server is running on your development machine",
        `Verify that the server is listening on port ${API_CONFIG.SERVER_PORT}`,
        "Check server logs for any errors or warnings"
      ]
    },
    {
      title: "Check Network Connection",
      steps: [
        "Ensure your device is connected to the internet",
        "Try connecting to a different network",
        "Disable and re-enable your device's Wi-Fi"
      ]
    },
    {
      title: "Verify Network Configuration",
      steps: [
        `Verify the server IP address: ${API_CONFIG.SERVER_IP}`,
        "Make sure your device and server are on the same network",
        "Try using a direct IP address rather than a hostname"
      ]
    }
  ];

  // Platform-specific tips
  if (Platform.OS === 'android') {
    return [
      ...commonTips,
      {
        title: "Android-Specific Solutions",
        steps: [
          "Use ADB port forwarding: adb reverse tcp:5000 tcp:5000",
          "Make sure USB debugging is enabled",
          "Try running the app in an emulator instead of a physical device",
          "Check if any VPN or firewall is blocking the connection"
        ]
      }
    ];
  } else if (Platform.OS === 'ios') {
    return [
      ...commonTips,
      {
        title: "iOS-Specific Solutions",
        steps: [
          "iOS simulators should use localhost:5000 to access your computer",
          "For physical devices, both device and computer must be on same network",
          "Check Network Link Conditioner isn't enabled in developer settings",
          "Restart the Xcode project and clean the build"
        ]
      }
    ];
  }

  return commonTips;
};

/**
 * Get common error codes and their explanations
 */
export const getCommonErrorCodes = () => {
  return [
    {
      code: "ECONNREFUSED",
      explanation: "Connection refused. The server is not running or not accessible at the specified address/port.",
      solution: "Start the server or correct the server address/port configuration."
    },
    {
      code: "ETIMEDOUT",
      explanation: "Connection timed out. The server is not responding or is unreachable.",
      solution: "Check if server is running and that your device and server are on the same network."
    },
    {
      code: "ENOTFOUND",
      explanation: "Host not found. The hostname could not be resolved to an IP address.",
      solution: "Check that the hostname is correct or try using a direct IP address."
    },
    {
      code: "Network request failed",
      explanation: "Generic network failure. Can be caused by various issues including server being unreachable.",
      solution: "Check internet connection, server status, and network configuration."
    }
  ];
};

/**
 * Parse an error message and provide a suggestion
 */
export const parseNetworkError = (errorMessage) => {
  const errorCodes = getCommonErrorCodes();
  const matchedError = errorCodes.find(error => 
    errorMessage.includes(error.code)
  );

  if (matchedError) {
    return {
      errorCode: matchedError.code,
      explanation: matchedError.explanation,
      solution: matchedError.solution
    };
  }

  // Generic error
  return {
    errorCode: "UNKNOWN",
    explanation: "Unknown network error occurred.",
    solution: "Try running the Network Diagnostics tool for more information."
  };
};

export default {
  getNetworkTroubleshootingTips,
  getCommonErrorCodes,
  parseNetworkError
};
