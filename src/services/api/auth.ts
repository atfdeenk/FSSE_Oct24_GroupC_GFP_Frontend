// src/services/api/auth.ts
import axiosInstance from './axios';
import { API_CONFIG } from './config';
import { User, LoginResponse, RegisterResponse } from '../../types/apiResponses';

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
      // Real API call to login endpoint
      const response = await axiosInstance.post<LoginResponse>(
        API_CONFIG.ENDPOINTS.auth.login, 
        credentials
      );
      
      // Store token in localStorage
      if (response.data && response.data.access_token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', response.data.access_token);
        }
        
        try {
          // Fetch user profile after successful login
          const userResponse = await axiosInstance.get<User>(API_CONFIG.ENDPOINTS.auth.me);
          
          return {
            success: true,
            data: {
              token: response.data.access_token,
              user: userResponse.data
            },
            message: response.data.msg || 'Login successful'
          };
        } catch (profileError) {
          console.error('Error fetching user profile after login:', profileError);
          // Return success with token but without user data
          return {
            success: true,
            data: {
              token: response.data.access_token,
              user: null
            },
            message: response.data.msg || 'Login successful, but unable to fetch user profile'
          };
        }
      } else {
        return {
          success: false,
          data: {
            token: '',
            user: null
          },
          message: 'Invalid login response from server'
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        data: {
          token: '',
          user: null
        },
        message: error?.response?.data?.msg || error?.message || 'Login failed'
      };
    }
  },
  
  // Register user
  register: async (userData: RegisterData) => {
    try {
      // Real API call
      const response = await axiosInstance.post<RegisterResponse>(
        API_CONFIG.ENDPOINTS.auth.register, 
        userData
      );
      
      return {
        success: true,
        message: response.data.msg || 'Registration successful'
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error?.response?.data?.msg || error?.message || 'Registration failed'
      };
    }
  },
  
  // Get current user profile
  getProfile: async (): Promise<User | null> => {
    try {
      // Real API call
      const response = await axiosInstance.get<User>(API_CONFIG.ENDPOINTS.auth.me);
      return response.data;
    } catch (error: any) {
      console.error('Get profile error:', error);
      return null;
    }
  },
  
  // Get user by ID
  getUserById: async (id: string | number): Promise<User | null> => {
    try {
      const response = await axiosInstance.get<User>(
        API_CONFIG.ENDPOINTS.auth.user(id)
      );
      return response.data;
    } catch (error: any) {
      console.error(`Get user ${id} error:`, error);
      return null;
    }
  },
  
  // Get all users (admin only)
  getUsers: async (): Promise<User[]> => {
    try {
      const response = await axiosInstance.get<User[]>(
        API_CONFIG.ENDPOINTS.auth.users
      );
      return response.data;
    } catch (error: any) {
      console.error('Get users error:', error);
      return [];
    }
  },
  
  // Logout user
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  }
};

export default authService;
