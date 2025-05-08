// src/utils/roleBasedAccess.ts
import { getCurrentUser, isAuthenticated } from '@/lib/auth';

/**
 * Checks if the current user has customer role
 * @returns Promise<boolean> - True if user is a customer, false otherwise
 */
export async function isCustomerRole(): Promise<boolean> {
  if (!isAuthenticated()) {
    return true; // Non-logged in users should see customer features
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
 * Checks if cart/wishlist functionality should be enabled
 * @returns Promise<boolean> - True if cart/wishlist should be enabled
 */
export async function shouldEnableCartWishlist(): Promise<boolean> {
  return await isCustomerRole();
}
