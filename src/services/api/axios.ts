// src/services/api/axios.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from './config';
import { TOKEN_KEY, USER_KEY, TOKEN_EXPIRED_EVENT, MSG_SESSION_EXPIRED } from '@/constants';

// Event for token expiration to trigger logout across the app
// TOKEN_EXPIRED_EVENT is now imported from centralized constants

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
    return localStorage.getItem(TOKEN_KEY);
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
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          
          // Dispatch token expired event to notify the app
          const event = new CustomEvent(TOKEN_EXPIRED_EVENT, {
            detail: { message: MSG_SESSION_EXPIRED }
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
