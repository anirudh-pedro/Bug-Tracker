// Auth Configuration
export const AUTH_CONFIG = {
  // Backend endpoints - for USB-connected physical device
  BACKEND_URL: __DEV__ 
    ? 'http://192.168.137.1:5000' // Your computer's IP address for USB-connected phone
    : 'https://your-production-api.com',
  
  // Fallback URLs for connectivity issues
  FALLBACK_URLS: __DEV__ 
    ? ['http://192.168.137.1:5000', 'http://172.16.8.229:5000', 'http://localhost:5000', 'http://10.0.2.2:5000']
    : [],
  
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
