// src/services/api/axios.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from './config';

// Event for token expiration to trigger logout across the app
export const TOKEN_EXPIRED_EVENT = 'token-expired';

// Create a custom Axios instance with default configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUTS.long,
  headers: API_CONFIG.HEADERS
});

// Helper function to safely access localStorage
const getToken = (): string | null => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('token');
  }
  return null;
};

// Request interceptor for adding token, etc.
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token using the safe helper function
    const token = getToken();
    
    // If token exists, add it to the headers
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common responses
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common errors (401, 403, 500, etc.)
    if (error.response) {
      const { status } = error.response;
      
      // Handle authentication errors (unauthorized or token expired)
      if (status === 401) {
        // Clear authentication data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Dispatch token expired event to notify the app
          const event = new CustomEvent(TOKEN_EXPIRED_EVENT, {
            detail: { message: 'Your session has expired. Please log in again.' }
          });
          window.dispatchEvent(event);
          
          // Redirect to login if not already there
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/login')) {
            // Add redirect parameter to return after login
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          }
        }
      }
      
      // Log all errors
      console.error('API Error:', {
        status,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response?.data
      });
    }
    
    return Promise.reject(error);
  }
);

// Export the Axios instance
export default axiosInstance;
