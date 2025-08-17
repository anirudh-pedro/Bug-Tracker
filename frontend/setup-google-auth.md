# Google Authentication Setup Guide

## Current Status

✅ Firebase dependencies configured
✅ Custom keystore generated
✅ SHA-1 fingerprint: `D2:D2:2E:FF:C6:F6:9D:70:16:3C:EC:D0:78:11:31:A6:CA:DC:82:48`
✅ Google Sign-In UI enabled
✅ Firebase Auth integration complete

## Required Steps in Firebase Console

### 1. Enable Google Sign-In

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `bug-tracker-c9cf3`
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Google** provider
5. **Enable** the toggle
6. **Copy the Web client ID** (format: `xxxxx-xxxxx.apps.googleusercontent.com`)

### 2. Add SHA-1 Fingerprint

1. Go to **Project Settings** → **General** tab
2. Scroll to **Your apps** section
3. Click on your Android app (`com.frontend`)
4. Click **Add fingerprint**
5. Add: `D2:D2:2E:FF:C6:F6:9D:70:16:3C:EC:D0:78:11:31:A6:CA:DC:82:48`
6. **Download** the updated `google-services.json`

### 3. Update Configuration

Once you have the Web Client ID, update the firebase.ts file:

```typescript
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com', // Replace with actual ID
  offlineAccess: true,
  hostedDomain: '',
  forceCodeForRefreshToken: true,
});
```

## Testing Google Sign-In

1. Replace the Web Client ID in `src/config/firebase.ts`
2. Replace `google-services.json` in `android/app/`
3. Rebuild the app: `npx react-native run-android`
4. Test Google Sign-In button on login screen

## Troubleshooting

- **Error 12500**: Usually means Web Client ID is incorrect
- **Error 10**: SHA-1 fingerprint not added to Firebase Console
- **Network error**: Check internet connection and Firebase project status
