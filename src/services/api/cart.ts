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
  // Get the current user's cart meta (id, user_id)
  getCartMeta: async () => {
    try {
      const response = await axiosInstance.get<any>(API_CONFIG.ENDPOINTS.cart.get);
      return response.data; // { cart_id, user_id, message }
    } catch (error: any) {
      console.error('Get cart meta error:', error);
      return null;
    }
  },

  // Get the current user's cart items
  getCartItems: async () => {
    try {
      const response = await axiosInstance.get<any>(API_CONFIG.ENDPOINTS.cart.items);
      return response.data; // { items: [...], message }
    } catch (error: any) {
      console.error('Get cart items error:', error);
      return { items: [], message: 'Failed to fetch cart items' };
    }
  },

  // Get the normalized cart object for the frontend
  getCart: async (): Promise<{ success: boolean; error: string | null; data?: any }> => {
    try {
      const cartMeta = await cartService.getCartMeta();
      const cartItemsResp = await cartService.getCartItems();
      const items = Array.isArray(cartItemsResp.items) ? cartItemsResp.items : [];
      const total = items.reduce((sum: number, item: { price?: number; quantity: number }) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
      const merged = {
        id: cartMeta?.cart_id,
        user_id: cartMeta?.user_id,
        items,
        total
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
