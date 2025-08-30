# Network Connectivity Troubleshooting Guide

This guide helps you resolve connectivity issues between your React Native app and the backend server.

## Common Issues

1. **"Backend connectivity test failed: Network request failed"**
2. **"Backend connectivity test failed on all URLs"**
3. **"Cannot connect to backend server"**

## Quick Solutions

### 1. Run the Network Diagnostics Tool

We've added a comprehensive network diagnostics tool in the app that will:

- Test your internet connectivity
- Test your server connectivity
- Provide detailed troubleshooting steps
- Help with ADB port forwarding (Android)

To access it:

1. Go to the Login screen
2. Tap on "Network Diagnostics" at the bottom

### 2. For Android Devices: Use ADB Port Forwarding

The most reliable way to connect your Android device to your local development server is with ADB port forwarding:

```bash
# Connect your Android device via USB with USB debugging enabled
adb devices                # Check if your device is recognized
adb reverse tcp:5000 tcp:5000  # Set up port forwarding
```

After setting this up, your app will be able to connect to your local server using `http://localhost:5000`.

### 3. Check Your Network Configuration

The app now uses a centralized network configuration file:

- `src/config/networkConfig.js`

You can edit this file to update the server IP address and port.

## How the Networking Stack Works

We've completely redesigned the networking stack to be more robust and easier to debug:

1. **Network Configuration**:

   - All network settings are centralized in `networkConfig.js`
   - Includes server IP, port, endpoints, and alternative URLs

2. **Connectivity Testing**:

   - `connectivityTest.js` provides functions to test server connectivity
   - Can test both internet and server connectivity
   - Provides detailed diagnostics

3. **Network Diagnostics**:

   - `networkDiagnostics.js` gathers network information
   - Checks network type, IP addresses, and server status
   - Provides troubleshooting recommendations

4. **ADB Helper**:

   - `adbHelper.js` helps with Android ADB port forwarding
   - Provides commands and instructions

5. **Error Handling**:
   - Better error messages with troubleshooting steps
   - Network error modal with retry functionality

## Debug Tools

### NetworkDiagnosticsScreen

A dedicated screen for diagnosing and fixing network issues:

- Runs comprehensive diagnostics
- Shows server status
- Provides troubleshooting steps
- Offers platform-specific recommendations

### NetworkErrorModal

A modal component that appears when network errors occur:

- Shows error details
- Runs diagnostics in the background
- Provides troubleshooting steps
- Allows retrying the connection

## Troubleshooting Flow

1. **Check Server Status**:

   - Make sure your backend server is running
   - Verify the correct IP and port

2. **Check Network Connection**:

   - Ensure your device has internet connectivity
   - Make sure your device and server are on the same network

3. **Try ADB Port Forwarding (Android)**:

   - Use `adb reverse tcp:5000 tcp:5000`
   - This works even if your device and computer are on different networks

4. **Check Firewall Settings**:

   - Make sure your firewall isn't blocking the connection
   - Allow incoming connections on port 5000

5. **Check Server Logs**:
   - Look for any errors in your backend server logs

## Network URL Strategy

The app tries to connect using these URLs in order:

1. The main URL (from networkConfig.js)
2. Alternative URLs:
   - localhost:5000 (for emulators and ADB port forwarding)
   - 10.0.2.2:5000 (for Android emulator)
   - 127.0.0.1:5000 (for iOS simulator)
