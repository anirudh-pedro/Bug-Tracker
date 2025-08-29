// Auth Configuration
export const AUTH_CONFIG = {
  // Backend endpoints
  BACKEND_URL: __DEV__ 
    ? 'http://192.168.212.115:5000' // Your current development IP
    : 'https://your-production-api.com',
  
  // Google Sign-In
  GOOGLE_WEB_CLIENT_ID: '505775401765-43mt53j5jri7f6pqtlq37b99s0ui216d.apps.googleusercontent.com',
  
  // Timeouts and retries
  AUTH_TIMEOUT: 30000, // 30 seconds
  SIGN_OUT_TIMEOUT: 5000, // 5 seconds
  MAX_RETRIES: 3,
  
  // Storage keys
  STORAGE_KEYS: {
    USER_TOKEN: 'userToken',
    USER_DATA: (uid) => `user_data_${uid}`,
    ONBOARDING: (uid) => `user_onboarding_${uid}`,
  }
};

// Auth States
export const AUTH_STATES = {
  SIGNED_OUT: 'signed_out',
  SIGNING_IN: 'signing_in',
  SIGNED_IN: 'signed_in',
  SIGNING_OUT: 'signing_out',
  ERROR: 'error'
};
