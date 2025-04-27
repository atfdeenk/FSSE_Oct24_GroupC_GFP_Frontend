// src/services/api/auth.ts
import axiosInstance from './axios';
import { API_CONFIG } from './config';

// Types for authentication
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'customer' | 'vendor';
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message: string;
}

// Auth service with Axios
export const authService = {
  // Login user
  login: async (credentials: LoginCredentials) => {
    try {
      // Real API call
      const response = await axiosInstance.post<{ access_token: string }>(
        API_CONFIG.ENDPOINTS.auth.login, 
        credentials
      );
      
      // Store token in localStorage
      if (response.data && response.data.access_token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', response.data.access_token);
        }
      }
      
      return {
        success: true,
        data: {
          token: response.data.access_token,
          // We'll need to fetch user data separately since it's not included in the login response
          user: null
        },
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Register user
  register: async (userData: RegisterData) => {
    try {
      // Real API call
      const response = await axiosInstance.post(
        API_CONFIG.ENDPOINTS.auth.register, 
        userData
      );
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  // Get current user profile
  getProfile: async () => {
    try {
      // Real API call
      const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.auth.me);
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },
  
  // Logout user
  logout: () => {
    localStorage.removeItem('token');
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export default authService;
