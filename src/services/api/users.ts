// src/services/api/users.ts
import axiosInstance from './axios';
import { API_CONFIG } from './config';

/**
 * Interface for user data
 */
export interface User {
  id: string | number;
  username: string;
  role?: string;
  city?: string;
  image_url?: string | null;
  [key: string]: any; // For any additional properties
}

/**
 * Interface for API response containing users
 */
export interface UsersResponse {
  success: boolean;
  data?: User[];
  message?: string;
  error?: string;
}

/**
 * Interface for API response containing a single user
 */
export interface UserResponse {
  success: boolean;
  data?: User;
  message?: string;
  error?: string;
}

/**
 * Interface for API response containing user balance
 */
export interface BalanceResponse {
  success?: boolean;
  balance: number;
  error?: string;
}

/**
 * Users service for user-related API calls
 */
const usersService = {
  /**
   * Get all users
   */
  async getUsers(): Promise<UsersResponse> {
    try {
      const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.auth.users);
      return {
        success: true,
        data: response.data,
        message: 'Users fetched successfully'
      };
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      return {
        success: false,
        error: error?.response?.data?.message || error?.message || 'Failed to fetch users'
      };
    }
  },

  /**
   * Get a specific user by ID
   */
  async getUser(userId: string | number): Promise<UserResponse> {
    try {
      const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.auth.user(userId));
      return {
        success: true,
        data: response.data,
        message: 'User fetched successfully'
      };
    } catch (error: any) {
      console.error(`Failed to fetch user with ID ${userId}:`, error);
      return {
        success: false,
        error: error?.response?.data?.message || error?.message || `Failed to fetch user with ID ${userId}`
      };
    }
  },

  /**
   * Get a user by their vendor ID
   * This is useful for getting seller information
   */
  async getUserByVendorId(vendorId: string | number): Promise<UserResponse> {
    try {
      // First get all users
      const response = await this.getUsers();
      
      if (!response.success || !response.data) {
        return {
          success: false,
          error: 'Failed to fetch users to find vendor'
        };
      }
      
      // Find the user with the matching vendor ID
      const user = response.data.find(user => user.id === vendorId || user.vendor_id === vendorId);
      
      if (!user) {
        return {
          success: false,
          error: `No user found with vendor ID ${vendorId}`
        };
      }
      
      return {
        success: true,
        data: user,
        message: 'User found by vendor ID'
      };
    } catch (error: any) {
      console.error(`Failed to find user with vendor ID ${vendorId}:`, error);
      return {
        success: false,
        error: error?.response?.data?.message || error?.message || `Failed to find user with vendor ID ${vendorId}`
      };
    }
  },

  /**
   * Get the current user's balance
   */
  async getUserBalance(): Promise<BalanceResponse> {
    try {
      const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.auth.balance);
      
      // The API returns { balance: number }
      return {
        success: true,
        balance: response.data.balance,
      };
    } catch (error: any) {
      console.error('Failed to fetch user balance:', error);
      return {
        success: false,
        balance: 0,
        error: error?.response?.data?.message || error?.message || 'Failed to fetch user balance'
      };
    }
  },

  /**
   * Update the current user's balance
   * @param amount The amount to update (negative for payments, positive for deposits)
   */
  async updateBalance(amount: number): Promise<BalanceResponse> {
    try {
      console.log(`Updating user balance by ${amount}`);
      
      // First get current balance
      const currentBalanceResponse = await this.getUserBalance();
      const currentBalance = currentBalanceResponse.success ? currentBalanceResponse.balance : 0;
      
      // Calculate new balance (ensure it's not negative)
      const newBalance = Math.max(0, currentBalance + amount);
      console.log(`Current balance: ${currentBalance}, New balance: ${newBalance}`);
      
      // Send the exact payload format required by the API
      const response = await axiosInstance.patch(API_CONFIG.ENDPOINTS.auth.balance, { 
        balance: newBalance 
      });
      
      console.log('Balance update API response:', response.data);
      
      return {
        success: true,
        balance: response.data.balance || newBalance,
      };
    } catch (error: any) {
      console.error('Failed to update user balance:', error);
      return {
        success: false,
        balance: 0,
        error: error?.response?.data?.message || error?.message || 'Failed to update user balance'
      };
    }
  }
};

export default usersService;
