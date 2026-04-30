// services/apiService.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import apiConfig, { ENDPOINTS, getEndpoint } from '../helpers/ApiConfig';

class ApiService {
  constructor() {
    // Create axios instance with base configuration
    this.api = axios.create({
      baseURL: apiConfig.baseURL,
      timeout: apiConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      async (config) => {
        const token = await this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            await this.refreshToken();
            const newToken = await this.getToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            await this.logout();
            return Promise.reject(refreshError);
          }
        }

        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  // Error handler with React Native Alert
  handleError(error) {
    let errorMessage = 'Something went wrong';
    
    if (error.response) {
      console.error(`API Error ${error.response.status}:`, error.response.data);
      errorMessage = error.response.data?.message || `Server Error: ${error.response.status}`;
    } else if (error.request) {
      console.error('Network Error:', error.request);
      errorMessage = 'Network error. Please check your internet connection.';
    } else {
      console.error('Request Setup Error:', error.message);
      errorMessage = error.message;
    }

    // Show alert in React Native (optional - you can remove this if you want to handle errors in components)
    Alert.alert('Error', errorMessage);
  }

  // Token management with AsyncStorage
  async getToken() {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async setToken(token) {
    try {
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  async setRefreshToken(refreshToken) {
    try {
      await AsyncStorage.setItem('refreshToken', refreshToken);
    } catch (error) {
      console.error('Error saving refresh token:', error);
    }
  }

  async getRefreshToken() {
    try {
      return await AsyncStorage.getItem('refreshToken');
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  async removeTokens() {
    try {
      await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userProfile']);
    } catch (error) {
      console.error('Error removing tokens:', error);
    }
  }

  // Save user profile
  async saveUserProfile(userProfile) {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  // Get user profile
  async getUserProfile() {
    try {
      const profile = await AsyncStorage.getItem('userProfile');
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Generic HTTP methods
  async get(endpoint, params = {}) {
    try {
      const response = await this.api.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async post(endpoint, data = {}) {
    try {
      const response = await this.api.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async put(endpoint, data = {}) {
    try {
      const response = await this.api.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async patch(endpoint, data = {}) {
    try {
      const response = await this.api.patch(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async delete(endpoint) {
    try {
      const response = await this.api.delete(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Authentication methods
  async login(phone, password) {
    try {
      const response = await this.post(ENDPOINTS.AUTH.LOGIN, { phone, password });
      
      if (response.token) {
        await this.setToken(response.token);
      }
      
      if (response.refreshToken) {
        await this.setRefreshToken(response.refreshToken);
      }
      
      if (response.user) {
        await this.saveUserProfile(response.user);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async logout(navigation = null) {
    try {
      await this.post(ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.removeTokens();
      
      // Navigate to login screen if navigation is provided
      if (navigation) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    }
  }

  async refreshToken() {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.post(ENDPOINTS.AUTH.REFRESH, { refreshToken });
      
      if (response.token) {
        await this.setToken(response.token);
      }
      
      return response;
    } catch (error) {
      await this.removeTokens();
      throw error;
    }
  }

  // Check if user is authenticated
  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  }

  // ==================== ATTENDANCE METHODS ====================

  /**
   * Check-in attendance
   * @param {Object} checkInData - Check-in data
   * @param {string} checkInData.check_in - Check-in time (HH:MM:SS format)
   * @param {string} checkInData.status - Attendance status (e.g., "present")
   * @param {number} checkInData.latitude - User's latitude
   * @param {number} checkInData.longitude - User's longitude  
   * @param {string} checkInData.remarks - Optional remarks
   * @returns {Promise} API response
   */
  async checkIn(checkInData) {
    try {
      // Validate required fields
      if (!checkInData.check_in || !checkInData.status || 
          checkInData.latitude === undefined || checkInData.longitude === undefined) {
        throw new Error('Missing required check-in data');
      }

      const response = await this.post(ENDPOINTS.ATTENDANCE.CLOCKIN, checkInData);
      console.log('Check-in successful:', response);
      return response;
    } catch (error) {
      console.error('Check-in failed:', error);
      throw error;
    }
  }

  /**
   * Check-out attendance
   * @param {Object} checkOutData - Check-out data
   * @param {string} checkOutData.check_out - Check-out time (HH:MM:SS format)
   * @param {string} checkOutData.status - Attendance status
   * @param {number} checkOutData.latitude - User's latitude
   * @param {number} checkOutData.longitude - User's longitude
   * @param {string} checkOutData.remarks - Optional remarks
   * @returns {Promise} API response
   */
  async checkOut(checkOutData) {
    try {
      // Validate required fields
      if (!checkOutData.check_out || !checkOutData.status || 
          checkOutData.latitude === undefined || checkOutData.longitude === undefined) {
        throw new Error('Missing required check-out data');
      }

      const response = await this.post(ENDPOINTS.ATTENDANCE.CLOCKOUT, checkOutData);
      console.log('Check-out successful:', response);
      return response;
    } catch (error) {
      console.error('Check-out failed:', error);
      throw error;
    }
  }

  /**
   * Helper method to get current time in HH:MM:SS format
   * @returns {string} Current time in HH:MM:SS format
   */
  getCurrentTime() {
    const now = new Date();
    return now.toTimeString().split(' ')[0]; // Gets HH:MM:SS part
  }

  /**
   * Helper method to get current location (you'll need to implement location services)
   * This is a placeholder - you should integrate with react-native-geolocation-service
   * @returns {Promise<{latitude: number, longitude: number}>}
   */
  async getCurrentLocation() {
    // This is a placeholder - implement actual location service
    // You'll need to install and configure react-native-geolocation-service
    return new Promise((resolve, reject) => {
      // Placeholder coordinates - replace with actual location service
      resolve({
        latitude: 23.456789,
        longitude: 87.654321
      });
    });
  }

  /**
   * Convenience method for quick check-in with current time and location
   * @param {string} status - Attendance status (default: "present")
   * @param {string} remarks - Optional remarks
   * @returns {Promise} API response
   */
  async quickCheckIn(status = "present", remarks = "Morning check-in") {
    try {
      const currentTime = this.getCurrentTime();
      const location = await this.getCurrentLocation();
      
      const checkInData = {
        check_in: currentTime,
        status: status,
        latitude: location.latitude,
        longitude: location.longitude,
        remarks: remarks
      };

      return await this.checkIn(checkInData);
    } catch (error) {
      console.error('Quick check-in failed:', error);
      throw error;
    }
  }

  /**
   * Convenience method for quick check-out with current time and location
   * @param {string} status - Attendance status (default: "present")
   * @param {string} remarks - Optional remarks
   * @returns {Promise} API response
   */
  async quickCheckOut(status = "present", remarks = "Evening check-out") {
    try {
      const currentTime = this.getCurrentTime();
      const location = await this.getCurrentLocation();
      
      const checkOutData = {
        check_out: currentTime,
        status: status,
        latitude: location.latitude,
        longitude: location.longitude,
        remarks: remarks
      };

      return await this.checkOut(checkOutData);
    } catch (error) {
      console.error('Quick check-out failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;