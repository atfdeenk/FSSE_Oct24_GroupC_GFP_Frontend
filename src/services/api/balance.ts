// src/services/api/balance.ts
import axiosInstance from './axios';
import { API_CONFIG } from './config';
import { BalanceResponse } from './users';

/**
 * Balance service for balance-related API calls
 */
const balanceService = {
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

export default balanceService;
