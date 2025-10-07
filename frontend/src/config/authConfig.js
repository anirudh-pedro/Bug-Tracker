import NETWORK_CONFIG from './networkConfig';

// Auth Configuration
export const AUTH_CONFIG = {
  // Backend endpoints - now imported from centralized network config
  BACKEND_URL: NETWORK_CONFIG.BACKEND_URL,
  
  // Fallback URLs - now imported from centralized network config
  FALLBACK_URLS: NETWORK_CONFIG.FALLBACK_URLS,
  
  // Google Sign-In
  GOOGLE_WEB_CLIENT_ID: '505775401765-43mt53j5jri7f6pqtlq37b99s0ui216d.apps.googleusercontent.com',
  
  // Timeouts and retries - now using network config values
  AUTH_TIMEOUT: NETWORK_CONFIG.TIMEOUTS.AUTH,
  SIGN_OUT_TIMEOUT: NETWORK_CONFIG.TIMEOUTS.SIGN_OUT,
  MAX_RETRIES: NETWORK_CONFIG.RETRY.MAX_RETRIES,
  
  // Storage keys
  STORAGE_KEYS: {
    USER_TOKEN: 'userToken',
    USER_DATA: (uid) => `user_data_${uid}`,
    ONBOARDING: (uid) => `user_onboarding_${uid}`,
    CURRENT_USERNAME: 'currentUsername',
    USER_DATA_BY_USERNAME: (username) => `user_data_username_${username}`,
    ONBOARDING_BY_USERNAME: (username) => `user_onboarding_username_${username}`,
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
