// Network configuration file to make it easy to switch between different environments

// 1. DIRECT DEVICE IP - Use when connecting to a server on your local network
// This is the IP address of your development machine on your local network
export const NETWORK_CONFIG = {
  // Use the server's actual network IP address (from server logs)
  SERVER_IP: '192.168.212.115',
  SERVER_PORT: 5000,
  
  // Determine the best URL based on environment
  get SERVER_URL() {
    return `http://${this.SERVER_IP}:${this.SERVER_PORT}`;
  },
  
  // Special URLs for different development environments
  URLS: {
    // For Android device with ADB reverse tcp:5000 tcp:5000
    LOCALHOST: 'http://localhost:5000',
    
    // For Android emulator accessing host machine
    EMULATOR: 'http://10.0.2.2:5000',
    
    // For iOS simulator accessing host machine
    IOS_SIMULATOR: 'http://127.0.0.1:5000'
  },
  
  // Endpoints used by the app
  ENDPOINTS: {
    AUTH: {
      GOOGLE: '/api/auth/google',
    },
    USERS: {
      CHECK_USERNAME: '/api/users/check-username',
      COMPLETE_ONBOARDING: '/api/users/complete-onboarding',
      TEST_AUTH: '/api/users/test-auth',
      UPDATE_PROFILE: '/api/users/update-profile',
      SEARCH: '/api/users/search',
    },
    HEALTH: '/api/health',
    DASHBOARD: '/api/dashboard',
    BUGS: '/api/bugs',
    PROJECTS: '/api/projects',
  }
};

// Export the API config in the format expected by the rest of the app
export const API_CONFIG = {
  BASE_URL: NETWORK_CONFIG.SERVER_URL,
  URLS: NETWORK_CONFIG.URLS,
  ENDPOINTS: NETWORK_CONFIG.ENDPOINTS
};

// Helper function to build full URL with endpoint
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Simple function to test if server is reachable
export const pingServer = async () => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/health`, { 
      method: 'GET',
      timeout: 5000
    });
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
