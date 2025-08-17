# Google Sign-In DEVELOPER_ERROR - Troubleshooting Guide

## Current Issue: DEVELOPER_ERROR

### Problem Analysis:

- SHA-1 fingerprint: `D2:D2:2E:FF:C6:F6:9D:70:16:3C:EC:D0:78:11:31:A6:CA:DC:82:48`
- Web Client ID: `505775401765-43mt53j5jri7f6pqtlq37b99s0ui216d.apps.googleusercontent.com`
- Missing: Android OAuth client in google-services.json

### Root Cause:

The current `google-services.json` only contains a Web client (client_type: 3) but is missing the Android client (client_type: 1). This happens when the SHA-1 fingerprint is not properly added to Firebase Console.

## Fix Steps:

### 1. Add SHA-1 to Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `bug-tracker-c9cf3`
3. **Project Settings** → **General** tab
4. Scroll to **Your apps** → Click on Android app (`com.frontend`)
5. Click **"Add fingerprint"**
6. Add SHA-1: `D2:D2:2E:FF:C6:F6:9D:70:16:3C:EC:D0:78:11:31:A6:CA:DC:82:48`
7. **Download NEW google-services.json**

### 2. Expected google-services.json Structure

After adding SHA-1, you should see:

```json
"oauth_client": [
  {
    "client_id": "xxx-yyy.apps.googleusercontent.com",
    "client_type": 1  // Android client
  },
  {
    "client_id": "505775401765-43mt53j5jri7f6pqtlq37b99s0ui216d.apps.googleusercontent.com",
    "client_type": 3  // Web client (already present)
  }
]
```

### 3. Replace google-services.json

1. Download the updated file from Firebase Console
2. Replace `android/app/google-services.json`
3. Rebuild the app: `npx react-native run-android`

### 4. Alternative: Check Firebase Console Settings

- Ensure Google Sign-In is **enabled** in Authentication → Sign-in method
- Verify the package name matches: `com.frontend`
- Confirm the SHA-1 fingerprint is added correctly

## Testing After Fix:

1. Clean build: `npx react-native run-android`
2. Try Google Sign-In
3. Should see Google account picker instead of DEVELOPER_ERROR

## Common Issues:

- **Error 12500**: Wrong Web Client ID
- **DEVELOPER_ERROR**: Missing SHA-1 fingerprint
- **Error 10**: Network/configuration issue

## Debug Commands:

```bash
# Check current SHA-1
cd android && ./gradlew signingReport

# Clean build
npx react-native run-android --reset-cache
```
