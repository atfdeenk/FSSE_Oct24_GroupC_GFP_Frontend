// src/services/api/cart.ts
import axiosInstance from './axios';
import { API_CONFIG } from './config';
import { 
  Cart, 
  CartItem,
  CartResponse,
  BaseResponse
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
  getCart: async (): Promise<CartResponse> => {
    try {
      // First get basic cart info
      console.log('Fetching cart from:', API_CONFIG.ENDPOINTS.cart.get);
      const cartResponse = await axiosInstance.get<any>(
        API_CONFIG.ENDPOINTS.cart.get
      );
      console.log('Cart API response:', cartResponse.data);
      
      // Then get cart items
      console.log('Fetching cart items from:', API_CONFIG.ENDPOINTS.cart.items);
      const itemsResponse = await axiosInstance.get<any>(
        API_CONFIG.ENDPOINTS.cart.items
      );
      console.log('Cart items API response:', itemsResponse.data);
      
      // Process cart items
      if (itemsResponse.data && Array.isArray(itemsResponse.data)) {
        const items = itemsResponse.data;
        // Calculate total from items
        const total = items.reduce((sum: number, item: any) => {
          return sum + ((item.price || 0) * (item.quantity || 0));
        }, 0);
        
        return {
          success: true,
          message: 'Cart retrieved successfully',
          data: {
            id: cartResponse.data?.cart_id,
            user_id: cartResponse.data?.user_id,
            items: items,
            total: total
          }
        };
      }
      
      // Default empty response
      return {
        success: true,
        message: 'Cart is empty',
        data: {
          id: cartResponse.data?.cart_id,
          user_id: cartResponse.data?.user_id,
          items: [],
          total: 0
        }
      };
    } catch (error: any) {
      console.error('Get cart error:', error);
      // Return a default empty cart if there's an error
      return {
        success: false,
        message: error?.response?.data?.message || 'Cart not found',
        data: {
          items: [],
          total: 0
        }
      };
    }
  },

  // Add an item to the cart
  addToCart: async (itemData: AddToCartData): Promise<CartResponse> => {
    try {
      const response = await axiosInstance.post<CartResponse>(
        API_CONFIG.ENDPOINTS.cart.items,
        itemData
      );
      return response.data;
    } catch (error: any) {
      console.error('Add to cart error:', error);
      // Handle specific error cases
      if (error.response?.data) {
        return {
          success: false,
          message: error.response.data.message || 'Failed to add item to cart',
          data: error.response.data.data || { items: [], total: 0 }
        };
      }
      throw error;
    }
  },

  // Update a cart item quantity
  updateCartItem: async (itemId: number | string, updateData: UpdateCartItemData): Promise<CartResponse> => {
    try {
      const response = await axiosInstance.patch<CartResponse>(
        API_CONFIG.ENDPOINTS.cart.item(itemId),
        updateData
      );
      return response.data;
    } catch (error: any) {
      console.error(`Update cart item ${itemId} error:`, error);
      // Handle specific error cases
      if (error.response?.data) {
        return {
          success: false,
          message: error.response.data.message || `Failed to update cart item ${itemId}`,
          data: error.response.data.data || { items: [], total: 0 }
        };
      }
      throw error;
    }
  },

  // Remove an item from the cart
  removeFromCart: async (itemId: number | string): Promise<CartResponse | BaseResponse> => {
    try {
      const response = await axiosInstance.delete<CartResponse>(
        API_CONFIG.ENDPOINTS.cart.item(itemId)
      );
      return response.data;
    } catch (error: any) {
      console.error(`Remove from cart item ${itemId} error:`, error);
      // Handle specific error cases
      if (error.response?.data) {
        return {
          success: false,
          message: error.response.data.message || `Failed to remove cart item ${itemId}`,
          ...(error.response.data.data ? { data: error.response.data.data } : {})
        };
      }
      throw error;
    }
  },

  // Clear the entire cart
  clearCart: async (): Promise<CartResponse | BaseResponse> => {
    try {
      const response = await axiosInstance.delete<CartResponse>(
        API_CONFIG.ENDPOINTS.cart.items
      );
      return response.data;
    } catch (error: any) {
      console.error('Clear cart error:', error);
      // Handle specific error cases
      if (error.response?.data) {
        return {
          success: false,
          message: error.response.data.message || 'Failed to clear cart'
        };
      }
      throw error;
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
