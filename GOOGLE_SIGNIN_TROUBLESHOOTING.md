# Google Sign-In Troubleshooting Guide

## Error: NETWORK_ERROR

This error typically occurs due to network connectivity or configuration issues. Here are the solutions implemented and additional steps to try:

## ✅ Fixes Applied

1. **Enhanced Google Sign-In Configuration**

   - Updated `GoogleSignin.configure()` with comprehensive options
   - Added proper scopes and iOS client ID

2. **Improved Error Handling**

   - Added specific handling for NETWORK_ERROR
   - Enhanced logging for better debugging

3. **Better Play Services Support**

   - Added autoResolve option for Play Services
   - Enhanced Play Services checking

4. **Development Tools**
   - Added "Test Config" button to verify Google Sign-In setup
   - Added enhanced logging throughout the sign-in process

## 🔧 Additional Troubleshooting Steps

### 1. Check Internet Connection

```bash
# Test if you can reach Google's servers
ping google.com
```

### 2. Update Google Play Services

- Open Google Play Store on your device/emulator
- Search for "Google Play Services"
- Update to the latest version

### 3. Verify SHA-1 Fingerprint (Important!)

```bash
# Get debug SHA-1 fingerprint
cd android
./gradlew signingReport

# Look for the debug SHA1 fingerprint and ensure it's added to Firebase console
```

### 4. Check Firebase Console Settings

1. Go to Firebase Console → Project Settings → General
2. Verify the package name is: `com.frontend`
3. Ensure the SHA-1 fingerprint is added
4. Download and replace `google-services.json` if needed

### 5. Clear Google Play Services Cache

- On device: Settings → Apps → Google Play Services → Storage → Clear Cache

### 6. Test on Physical Device

- Emulators sometimes have Google Play Services issues
- Test on a real Android device with Google Play Services

### 7. Check Network Restrictions

- Ensure your network/firewall allows access to:
  - `accounts.google.com`
  - `oauth2.googleapis.com`
  - `www.googleapis.com`

## 🔍 Using the Debug Tools

1. **Test Config Button**: Use the "Test Config" button in the login screen to verify:

   - Google Play Services availability
   - Current user status
   - Configuration validity

2. **Console Logs**: Check the console for detailed error information:
   - Look for "Google Sign-In Error" messages
   - Check Play Services status logs
   - Verify ID token retrieval logs

## 🚨 Common Issues and Solutions

### Issue: "Play Services not available"

**Solution**: Update Google Play Services on device/emulator

### Issue: "Invalid client ID"

**Solution**: Verify webClientId in GoogleSignin.configure() matches Firebase

### Issue: "Network timeout"

**Solution**: Check internet connection and try again

### Issue: "Sign-in cancelled"

**Solution**: This is normal user behavior, not an error

## 📱 Testing Checklist

- [ ] Google Play Services updated
- [ ] Internet connection stable
- [ ] SHA-1 fingerprint added to Firebase
- [ ] Package name matches in all configs
- [ ] google-services.json is latest version
- [ ] Test Config button shows "Play Services: Available"
- [ ] Clear auth and try fresh sign-in

## 🔄 Reset Everything (Last Resort)

If nothing works, use the "Dev: Clear Auth" button and:

1. Clear Google Play Services cache
2. Restart the app
3. Try sign-in again

## 📞 Getting Help

If the issue persists:

1. Check the console logs during sign-in attempt
2. Note the exact error message and code
3. Verify all configuration steps above
4. Test on a different device/network
