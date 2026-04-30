// config/apiConfig.js

// Environment-based API configurations
const API_CONFIG = {
  development: {
    baseURL: 'http://43.205.34.89:8001/v1/api',
    timeout: 10000,
  },
  production: {
    baseURL: 'https://your-production-api.com/v1/api',
    timeout: 15000,
  },
  staging: {
    baseURL: 'https://your-staging-api.com/v1/api',
    timeout: 12000,
  }
};

// Get current environment configuration
const currentConfig = API_CONFIG[process.env.NODE_ENV || 'development'];

// API endpoint constants
export const ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/employee-login',
    // LOGOUT: '/employee-logout',
    // REFRESH: '/refresh-token',
    // FORGOT_PASSWORD: '/forgot-password',
    // RESET_PASSWORD: '/reset-password'
  },

  // Attendence endpoints
  ATTENDANCE: {
    CLOCKIN: '/check_in',
    CLOCKOUT: '/check_out',
  },
  // Employee endpoints
  EMPLOYEE: {
    PROFILE: '/employee-profile',
    LIST: '/employees',
    CREATE: '/employee',
    UPDATE: (id) => `/employee/${id}`,
    DELETE: (id) => `/employee/${id}`,
    SEARCH: '/employees/search'
  },

  // Department endpoints
  DEPARTMENT: {
    LIST: '/departments',
    CREATE: '/department',
    UPDATE: (id) => `/department/${id}`,
    DELETE: (id) => `/department/${id}`
  },

  // Add more endpoint groups as needed
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/change-password'
  }
};

// Export default configuration
export default currentConfig;

// Helper function to build complete URLs
export const buildUrl = (endpoint) => {
  return `${currentConfig.baseURL}${endpoint}`;
};

// Helper function to get endpoint with parameters
export const getEndpoint = (endpointFunction, ...params) => {
  if (typeof endpointFunction === 'function') {
    return endpointFunction(...params);
  }
  return endpointFunction;
};