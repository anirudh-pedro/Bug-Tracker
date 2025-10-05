/**
 * API Endpoint Configuration
 * Centralized API route definitions
 */

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh-token',
    GOOGLE: '/api/auth/google',
    VERIFY: '/api/auth/verify',
  },
  
  // Users
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE: '/api/users/update',
    DELETE: '/api/users/delete',
    LIST: '/api/users',
    BY_ID: (userId) => `/api/users/${userId}`,
    STATS: (userId) => `/api/users/${userId}/stats`,
    DEBUG_PUBLIC: '/api/users/debug-public',
  },
  
  // Bugs
  BUGS: {
    LIST: '/api/bugs',
    CREATE: '/api/bugs',
    BY_ID: (bugId) => `/api/bugs/${bugId}`,
    UPDATE: (bugId) => `/api/bugs/${bugId}`,
    DELETE: (bugId) => `/api/bugs/${bugId}`,
    COMMENTS: (bugId) => `/api/bugs/${bugId}/comments`,
    AWARD_POINTS: (bugId) => `/api/bugs/${bugId}/award-points`,
    STATUS: (bugId) => `/api/bugs/${bugId}/status`,
    ASSIGN: (bugId) => `/api/bugs/${bugId}/assign`,
  },
  
  // Projects
  PROJECTS: {
    LIST: '/api/projects',
    CREATE: '/api/projects',
    BY_ID: (projectId) => `/api/projects/${projectId}`,
    UPDATE: (projectId) => `/api/projects/${projectId}`,
    DELETE: (projectId) => `/api/projects/${projectId}`,
    BUGS: (projectId) => `/api/projects/${projectId}/bugs`,
    MEMBERS: (projectId) => `/api/projects/${projectId}/members`,
    STATS: (projectId) => `/api/projects/${projectId}/stats`,
  },
  
  // Dashboard
  DASHBOARD: {
    OVERVIEW: '/api/dashboard',
    STATS: '/api/dashboard/stats',
    RECENT_ACTIVITY: '/api/dashboard/recent-activity',
    TRENDING: '/api/dashboard/trending',
  },
  
  // GitHub Integration
  GITHUB: {
    LINK_REPO: (bugId) => `/api/github/link-repo/${bugId}`,
    FORK: (bugId) => `/api/github/fork/${bugId}`,
    PULL_REQUEST: (bugId) => `/api/github/pull-request/${bugId}`,
    UPDATE_PR: (bugId, prNumber) => `/api/github/pull-request/${bugId}/${prNumber}`,
    ACTIVITY: (bugId) => `/api/github/activity/${bugId}`,
  },
  
  // Health & Testing
  HEALTH: {
    CHECK: '/api/health',
    TEST: '/api/test/health',
  },
};

/**
 * Build full API URL
 * @param {string} baseUrl - Base URL from network config
 * @param {string} endpoint - API endpoint path
 * @returns {string} Full URL
 */
export const buildApiUrl = (baseUrl, endpoint) => {
  // Remove trailing slash from baseUrl if present
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${cleanBaseUrl}${cleanEndpoint}`;
};

/**
 * Check if endpoint requires authentication
 * @param {string} endpoint - API endpoint path
 * @returns {boolean} Whether auth token is required
 */
export const requiresAuth = (endpoint) => {
  const publicEndpoints = [
    API_ENDPOINTS.AUTH.LOGIN,
    API_ENDPOINTS.AUTH.SIGNUP,
    API_ENDPOINTS.AUTH.GOOGLE,
    API_ENDPOINTS.HEALTH.CHECK,
    API_ENDPOINTS.HEALTH.TEST,
    API_ENDPOINTS.USERS.DEBUG_PUBLIC,
  ];
  
  return !publicEndpoints.some(publicEndpoint => 
    endpoint.includes(publicEndpoint)
  );
};

export default API_ENDPOINTS;
