// src/services/api/auth.ts
import axiosInstance from './axios';
import { API_CONFIG } from './config';
import { UserProfile, LoginResponse, RegisterResponse } from '@/types/apiResponses';
import { TOKEN_KEY, MSG_LOGIN_PROFILE_FAIL } from '@/constants';

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
    user: UserProfile;
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
          localStorage.setItem(TOKEN_KEY, response.data.access_token);
        }
        
        try {
          // Fetch user profile after successful login
          const userResponse = await axiosInstance.get<UserProfile>(API_CONFIG.ENDPOINTS.auth.me);
          
          return {
            success: true,
            data: {
              token: response.data.access_token,
              user: userResponse.data
            },
            message: response.data.msg || 'Login successful'
          };
        } catch (profileError) {
          // Return success with token but without user data
          return {
            success: true,
            data: {
              token: response.data.access_token,
              user: null
            },
            message: response.data.msg || MSG_LOGIN_PROFILE_FAIL
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
      return {
        success: false,
        message: error?.response?.data?.msg || error?.message || 'Registration failed'
      };
    }
  },
  
  // Get current user profile
  getProfile: async (): Promise<UserProfile | null> => {
    try {
      // Real API call
      const response = await axiosInstance.get<UserProfile>(API_CONFIG.ENDPOINTS.auth.me);
      return response.data;
    } catch (error: any) {
      return null;
    }
  },
  
  // Get user by ID
  getUserById: async (id: string | number): Promise<UserProfile | null> => {
    try {
      const response = await axiosInstance.get<UserProfile>(
        API_CONFIG.ENDPOINTS.auth.user(id)
      );
      return response.data;
    } catch (error: any) {
      return null;
    }
  },
  
  // Get all users (admin only)
  getUsers: async (): Promise<UserProfile[]> => {
    try {
      const response = await axiosInstance.get<UserProfile[]>(
        API_CONFIG.ENDPOINTS.auth.users
      );
      return response.data;
    } catch (error: any) {
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
  },

  // Update user profile
  updateUser: async (id: string | number, userData: Partial<UserProfile>) => {
    try {
      console.log('Auth service - updateUser - endpoint:', API_CONFIG.ENDPOINTS.auth.user(id));
      console.log('Auth service - updateUser - payload:', userData);
      
      const response = await axiosInstance.patch<any>(
        API_CONFIG.ENDPOINTS.auth.user(id),
        userData
      );
      
      console.log('Auth service - updateUser - API response:', response.data);
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.msg || 'Profile updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error?.response?.data?.msg || error?.message || 'Failed to update profile'
      };
    }
  },

  // Delete user account
  deleteUser: async (id: string | number) => {
    try {
      const response = await axiosInstance.delete<any>(API_CONFIG.ENDPOINTS.auth.user(id));
      // If successful, also log out the user
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      return {
        success: true,
        message: response.data?.msg || 'Account deleted successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.msg || error?.message || 'Failed to delete account'
      };
    }
  }
};

export default authService;
