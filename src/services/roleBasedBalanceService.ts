// src/services/roleBasedBalanceService.ts
import { isAuthenticated, getCurrentUser } from '@/lib/auth';
import balanceService from './api/balance';
import { BalanceResponse } from './api/users';

/**
 * Checks if the current user has customer role
 * @returns boolean - True if user is a customer, false for admin/seller roles
 */
async function isCustomerRole(): Promise<boolean> {
  if (!isAuthenticated()) {
    return false; // Non-logged in users don't have balance access
  }
  
  try {
    const user = await getCurrentUser();
    return user?.role === 'customer';
  } catch (error) {
    console.error('Error checking user role:', error);
    return false; // Default to false on error
  }
}

/**
 * Role-based balance service wrapper that provides appropriate responses based on user role
 * Only customer roles should have access to balance functionality
 */
export const roleBasedBalanceService = {
  getUserBalance: async (): Promise<BalanceResponse> => {
    // Only allow customer roles to access balance
    if (await isCustomerRole()) {
      return balanceService.getUserBalance();
    }
    return {
      success: false,
      balance: 0,
      error: 'Balance not available for this role'
    };
  },

  updateBalance: async (amount: number): Promise<BalanceResponse> => {
    // Only allow customer roles to update balance
    if (await isCustomerRole()) {
      return balanceService.updateBalance(amount);
    }
    return {
      success: false,
      balance: 0,
      error: 'Balance not available for this role'
    };
  }
};

export default roleBasedBalanceService;
