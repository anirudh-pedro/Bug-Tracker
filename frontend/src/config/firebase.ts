import { initializeApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Firebase is automatically initialized by React Native Firebase
// The configuration is read from google-services.json

// Google Sign-In configuration with Web Client ID from Firebase Console
GoogleSignin.configure({
  webClientId: '505775401765-43mt53j5jri7f6pqtlq37b99s0ui216d.apps.googleusercontent.com',
  offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
  hostedDomain: '', // specifies a hosted domain restriction
  forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
});

export { auth, GoogleSignin };
