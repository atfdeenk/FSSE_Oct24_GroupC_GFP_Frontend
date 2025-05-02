// src/services/api/cart.ts
import axiosInstance from './axios';
import { API_CONFIG } from './config';
import { 
  Cart, 
  CartItem,
  CartResponse,
  BaseResponse
} from '@/types';
import { refreshCart } from '@/lib/dataRefresh';
import { showSuccess, showError } from '@/utils/toast';

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
  // Consider the response successful if it has a status code in the 2xx range
  // or if it has data with items array
  const isSuccess = 
    (response?.status >= 200 && response?.status < 300) || 
    (response?.data && Array.isArray(response?.data?.items)) ||
    // Also consider it successful if there's no error message
    (!response?.error && !response?.message);
  
  if (isSuccess) {
    return { 
      success: true, 
      error: null, 
      data: response?.data || { items: [], total: 0 }
    };
  }
  
  return {
    success: false,
    error: response?.message || response?.error || fallbackMsg,
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
      // Log the request for debugging
      console.log('Adding to cart:', itemData);
      
      // Get product name for more informative toast - for adding to cart, we can safely use the products API
      // since the product must exist to be added to the cart
      let productName = 'Item';
      try {
        // Use a safer approach with proper error handling
        const productsAPI = await import('@/services/api/products');
        if (productsAPI && productsAPI.default && typeof productsAPI.default.getProduct === 'function') {
          const productDetails = await productsAPI.default.getProduct(itemData.product_id);
          if (productDetails && productDetails.name) {
            productName = productDetails.name;
          }
        }
      } catch (e) {
        console.error('Error fetching product details for toast:', e);
        // Continue with default product name
      }
      
      const response = await axiosInstance.post<CartResponse>(
        API_CONFIG.ENDPOINTS.cart.items,
        itemData
      );
      
      console.log('Add to cart response:', response);
      
      // Always show success toast for cart addition regardless of response structure
      showSuccess(`Added ${itemData.quantity} ${productName} to cart`);
      
      // Trigger refresh after successful addition
      const result = normalizeCartResponse(response.data, 'Failed to add to cart');
      
      // Trigger refresh with showToast false to prevent duplicate toasts
      refreshCart({ source: 'add', id: itemData.product_id, showToast: false });
      
      return result;
    } catch (error: any) {
      // Show error toast
      showError(error?.response?.data?.message || 'Failed to add to cart');
      return normalizeCartResponse(error.response?.data || {}, 'Failed to add to cart');
    }
  },

  // Update a cart item quantity
  updateCartItem: async (itemId: number | string, updateData: UpdateCartItemData): Promise<{ success: boolean; error: string | null; data?: any }> => {
    try {
      // Log the request for debugging
      console.log('Updating cart item:', { itemId, updateData });
      
      // First get the current cart to find the item name before updating it
      let productName = 'Item';
      try {
        const cartResponse = await axiosInstance.get<CartResponse>(API_CONFIG.ENDPOINTS.cart.items);
        if (cartResponse?.data?.data?.items) {
          const item = cartResponse.data.data.items.find((item: any) => item.id == itemId || item.product_id == itemId);
          if (item) {
            // CartItem doesn't have a name property, so we need to get it from the product
            productName = item.product?.name || 'Item';
          }
        }
      } catch (e) {
        console.error('Error fetching cart for product name:', e);
      }
      
      // Now update the item
      const response = await axiosInstance.patch<CartResponse>(
        API_CONFIG.ENDPOINTS.cart.item(itemId),
        updateData
      );
      
      console.log('Update cart item response:', response);
      
      // Always show success toast for quantity updates regardless of response structure
      showSuccess(`Updated ${updateData.quantity} ${productName} in cart`);
      
      // Trigger refresh after update
      const result = normalizeCartResponse(response.data, `Failed to update cart item ${itemId}`);
      
      // Trigger refresh with showToast false to prevent duplicate toasts
      refreshCart({ source: 'update', id: itemId, showToast: false });
      
      return result;
    } catch (error: any) {
      console.error(`Update cart item ${itemId} error:`, error);
      // Show error toast
      showError(error?.response?.data?.message || `Failed to update cart item quantity`);
      return normalizeCartResponse(error.response?.data || {}, `Failed to update cart item ${itemId}`);
    }
  },

  // Remove an item from the cart
  removeFromCart: async (itemId: number | string): Promise<{ success: boolean; error: string | null; data?: any }> => {
    try {
      // Log the request for debugging
      console.log('Removing cart item:', itemId);
      
      // First get the current cart to find the item name before removing it
      let productName = 'Item';
      try {
        const cartResponse = await axiosInstance.get<CartResponse>(API_CONFIG.ENDPOINTS.cart.items);
        if (cartResponse?.data?.data?.items) {
          const item = cartResponse.data.data.items.find((item: any) => item.id == itemId || item.product_id == itemId);
          if (item) {
            // CartItem doesn't have a name property, so we need to get it from the product
            productName = item.product?.name || 'Item';
          }
        }
      } catch (e) {
        console.error('Error fetching cart for product name:', e);
      }
      
      // Now remove the item
      const response = await axiosInstance.delete<CartResponse>(
        API_CONFIG.ENDPOINTS.cart.item(itemId)
      );
      
      console.log('Remove cart item response:', response);
      
      // Always show success toast for item removal regardless of response structure
      showSuccess(`Removed ${productName} from cart`);
      
      // Trigger refresh after removal
      const result = normalizeCartResponse(response.data, `Failed to remove cart item ${itemId}`);
      
      // Trigger refresh with showToast false to prevent duplicate toasts
      refreshCart({ source: 'remove', id: itemId, showToast: false });
      
      return result;
    } catch (error: any) {
      console.error(`Remove cart item ${itemId} error:`, error);
      // Show error toast
      showError(error?.response?.data?.message || `Failed to remove item from cart`);
      return normalizeCartResponse(error.response?.data || {}, `Failed to remove cart item ${itemId}`);
    }
  },

  // Clear the entire cart
  clearCart: async (): Promise<{ success: boolean; error: string | null; data?: any }> => {
    try {
      const response = await axiosInstance.delete<CartResponse>(
        API_CONFIG.ENDPOINTS.cart.items
      );
      
      // Trigger refresh after successful cart clearing
      const result = normalizeCartResponse(response.data, 'Failed to clear cart');
      if (result.success) {
        // Set showToast to false to prevent duplicate toasts
        refreshCart({ source: 'clear', showToast: false });
      }
      
      return result;
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
