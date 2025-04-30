// src/services/api/cart.ts
import axiosInstance from './axios';
import { API_CONFIG } from './config';
import { 
  Cart, 
  CartItem,
  CartResponse,
  BaseResponse
} from '@/types';

// Types for cart requests
export interface AddToCartData {
  product_id: number | string;
  quantity: number;
}

export interface UpdateCartItemData {
  quantity: number;
}

// --- Centralized cart API response normalization ---
function normalizeCartResponse(response: any, fallbackMsg = 'Cart operation failed') {
  if (response && response.data && Array.isArray(response.data.items)) {
    return { success: true, error: null, data: response.data };
  }
  return {
    success: false,
    error: response?.message || fallbackMsg,
    data: response?.data || { items: [], total: 0 }
  };
}

// Cart service with Axios
const cartService = {
  // Get the current user's cart
  getCart: async (): Promise<{ success: boolean; error: string | null; data?: any }> => {
    try {
      // First get basic cart info
      const cartResponse = await axiosInstance.get<any>(API_CONFIG.ENDPOINTS.cart.get);
      // Then get cart items
      const itemsResponse = await axiosInstance.get<any>(API_CONFIG.ENDPOINTS.cart.items);
      // Compose a unified object for normalization
      const merged = {
        ...cartResponse.data,
        items: Array.isArray(itemsResponse.data) ? itemsResponse.data : [],
        total: Array.isArray(itemsResponse.data)
          ? itemsResponse.data.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 0)), 0)
          : 0
      };
      return normalizeCartResponse({ data: merged }, 'Cart not found');
    } catch (error: any) {
      console.error('Get cart error:', error);
      return normalizeCartResponse(error.response?.data || {}, 'Cart not found');
    }
  },

  // Add an item to the cart
  addToCart: async (itemData: AddToCartData): Promise<{ success: boolean; error: string | null; data?: any }> => {
    try {
      const response = await axiosInstance.post<CartResponse>(
        API_CONFIG.ENDPOINTS.cart.items,
        itemData
      );
      return normalizeCartResponse(response.data, 'Failed to add to cart');
    } catch (error: any) {
      return normalizeCartResponse(error.response?.data || {}, 'Failed to add to cart');
    }
  },

  // Update a cart item quantity
  updateCartItem: async (itemId: number | string, updateData: UpdateCartItemData): Promise<{ success: boolean; error: string | null; data?: any }> => {
    try {
      const response = await axiosInstance.patch<CartResponse>(
        API_CONFIG.ENDPOINTS.cart.item(itemId),
        updateData
      );
      return normalizeCartResponse(response.data, `Failed to update cart item ${itemId}`);
    } catch (error: any) {
      console.error(`Update cart item ${itemId} error:`, error);
      return normalizeCartResponse(error.response?.data || {}, `Failed to update cart item ${itemId}`);
    }
  },

  // Remove an item from the cart
  removeFromCart: async (itemId: number | string): Promise<{ success: boolean; error: string | null; data?: any }> => {
    try {
      const response = await axiosInstance.delete<CartResponse>(
        API_CONFIG.ENDPOINTS.cart.item(itemId)
      );
      return normalizeCartResponse(response.data, `Failed to remove cart item ${itemId}`);
    } catch (error: any) {
      console.error(`Remove from cart item ${itemId} error:`, error);
      return normalizeCartResponse(error.response?.data || {}, `Failed to remove cart item ${itemId}`);
    }
  },

  // Clear the entire cart
  clearCart: async (): Promise<{ success: boolean; error: string | null; data?: any }> => {
    try {
      const response = await axiosInstance.delete<CartResponse>(
        API_CONFIG.ENDPOINTS.cart.items
      );
      return normalizeCartResponse(response.data, 'Failed to clear cart');
    } catch (error: any) {
      console.error('Clear cart error:', error);
      return normalizeCartResponse(error.response?.data || {}, 'Failed to clear cart');
    }
  },
  
  // Calculate cart total (helper function)
  calculateCartTotal: (items: CartItem[]): number => {
    return items.reduce((total, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
  },
  
  // Get cart item count
  getCartItemCount: async (): Promise<number> => {
    try {
      const cart = await cartService.getCart();
      return cart.data?.items?.length || 0;
    } catch (error) {
      console.error('Get cart item count error:', error);
      return 0;
    }
  }
};

export default cartService;
