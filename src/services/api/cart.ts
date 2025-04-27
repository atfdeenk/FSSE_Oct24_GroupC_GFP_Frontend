// src/services/api/cart.ts
import axiosInstance from './axios';
import { API_CONFIG } from './config';
import { 
  Cart, 
  CartItem,
  CartResponse
} from '../../types/apiResponses';

// Types for cart requests
export interface AddToCartData {
  product_id: number | string;
  quantity: number;
}

export interface UpdateCartItemData {
  quantity: number;
}

// Cart service with Axios
const cartService = {
  // Get the current user's cart
  getCart: async () => {
    try {
      const response = await axiosInstance.get<CartResponse>(
        API_CONFIG.ENDPOINTS.cart.get
      );
      return response.data;
    } catch (error) {
      console.error('Get cart error:', error);
      throw error;
    }
  },

  // Add an item to the cart
  addToCart: async (itemData: AddToCartData) => {
    try {
      const response = await axiosInstance.post<CartResponse>(
        API_CONFIG.ENDPOINTS.cart.items,
        itemData
      );
      return response.data;
    } catch (error) {
      console.error('Add to cart error:', error);
      throw error;
    }
  },

  // Update a cart item quantity
  updateCartItem: async (itemId: number | string, updateData: UpdateCartItemData) => {
    try {
      const response = await axiosInstance.patch<CartResponse>(
        API_CONFIG.ENDPOINTS.cart.item(itemId),
        updateData
      );
      return response.data;
    } catch (error) {
      console.error(`Update cart item ${itemId} error:`, error);
      throw error;
    }
  },

  // Remove an item from the cart
  removeFromCart: async (itemId: number | string) => {
    try {
      const response = await axiosInstance.delete<CartResponse>(
        API_CONFIG.ENDPOINTS.cart.item(itemId)
      );
      return response.data;
    } catch (error) {
      console.error(`Remove from cart item ${itemId} error:`, error);
      throw error;
    }
  },

  // Clear the entire cart
  clearCart: async () => {
    try {
      const response = await axiosInstance.delete<CartResponse>(
        API_CONFIG.ENDPOINTS.cart.items
      );
      return response.data;
    } catch (error) {
      console.error('Clear cart error:', error);
      throw error;
    }
  }
};

export default cartService;
