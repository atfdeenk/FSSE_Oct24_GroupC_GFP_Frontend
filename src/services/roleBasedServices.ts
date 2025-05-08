// src/services/roleBasedServices.ts
import { getCurrentUser, isAuthenticated } from '@/lib/auth';
import cartService from './api/cart';
import wishlistService from './api/wishlist';
import balanceService from './api/balance';
import { BalanceResponse } from './api/users';

// Empty response templates
const emptyCartResponse = {
  success: true,
  error: null,
  data: { items: [], total: 0 }
};

const emptyWishlistResponse = {
  success: true,
  message: 'Operation successful',
  data: { items: [] }
};

/**
 * Checks if the current user has customer role
 * @returns boolean - True if user is a customer or not logged in
 */
async function isCustomerOrGuest(): Promise<boolean> {
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
 * Role-based cart service wrapper that prevents API calls for non-customer roles
 */
export const roleBasedCartService = {
  getCartMeta: async () => {
    if (await isCustomerOrGuest()) {
      return cartService.getCartMeta();
    }
    return null;
  },

  getCartItems: async () => {
    if (await isCustomerOrGuest()) {
      return cartService.getCartItems();
    }
    return { items: [], message: 'Cart not available for this role' };
  },

  getCart: async () => {
    if (await isCustomerOrGuest()) {
      return cartService.getCart();
    }
    return emptyCartResponse;
  },

  addToCart: async (itemData: any) => {
    if (await isCustomerOrGuest()) {
      return cartService.addToCart(itemData);
    }
    return emptyCartResponse;
  },

  updateCartItem: async (itemId: number | string, updateData: any) => {
    if (await isCustomerOrGuest()) {
      return cartService.updateCartItem(itemId, updateData);
    }
    return emptyCartResponse;
  },

  removeFromCart: async (itemId: number | string) => {
    if (await isCustomerOrGuest()) {
      return cartService.removeFromCart(itemId);
    }
    return emptyCartResponse;
  },

  clearCart: async () => {
    if (await isCustomerOrGuest()) {
      return cartService.clearCart();
    }
    return emptyCartResponse;
  },

  calculateCartTotal: (items: any[]) => {
    return cartService.calculateCartTotal(items);
  },

  getCartItemCount: async () => {
    if (await isCustomerOrGuest()) {
      return cartService.getCartItemCount();
    }
    return 0;
  }
};

/**
 * Role-based wishlist service wrapper that prevents API calls for non-customer roles
 */
export const roleBasedWishlistService = {
  getWishlist: async () => {
    if (await isCustomerOrGuest()) {
      return wishlistService.getWishlist();
    }
    return emptyWishlistResponse;
  },

  addToWishlist: async (itemData: any) => {
    if (await isCustomerOrGuest()) {
      return wishlistService.addToWishlist(itemData);
    }
    return emptyWishlistResponse;
  },

  removeFromWishlist: async (itemId: number | string) => {
    if (await isCustomerOrGuest()) {
      return wishlistService.removeFromWishlist(itemId);
    }
    return emptyWishlistResponse;
  },

  isInWishlist: async (productId: number | string) => {
    if (await isCustomerOrGuest()) {
      return wishlistService.isInWishlist(productId);
    }
    return false;
  },

  getWishlistItemCount: async () => {
    if (await isCustomerOrGuest()) {
      return wishlistService.getWishlistItemCount();
    }
    return 0;
  },

  clearWishlist: async () => {
    if (await isCustomerOrGuest()) {
      return wishlistService.clearWishlist();
    }
    return emptyWishlistResponse;
  }
};
