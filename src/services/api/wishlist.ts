// src/services/api/wishlist.ts
import axiosInstance from './axios';
import { API_CONFIG } from './config';
import { 
  BaseResponse,
  Product
} from '@/types';

// Types for wishlist requests
export interface WishlistItem {
  id: number | string;
  product_id: number | string;
  user_id?: number | string;
  product?: Product;
  created_at?: string;
}

export interface WishlistResponse extends BaseResponse {
  data: {
    items: WishlistItem[];
  };
}

export interface AddToWishlistData {
  product_id: number | string;
}

// Wishlist service with Axios
const wishlistService = {
  // Get the current user's wishlist
  getWishlist: async (): Promise<WishlistResponse> => {
    try {
      const response = await axiosInstance.get<any>(API_CONFIG.ENDPOINTS.wishlist.list);
      // Normalize possible backend response shapes
      let items: WishlistItem[] = [];
      if (Array.isArray(response.data)) {
        items = response.data;
      } else if (Array.isArray(response.data?.wishlist)) {
        items = response.data.wishlist;
      } else if (Array.isArray(response.data?.items)) {
        items = response.data.items;
      } else if (Array.isArray(response.data?.data?.items)) {
        items = response.data.data.items;
      }
      return {
        success: true,
        message: response.data?.message || 'Wishlist retrieved successfully',
        data: { items }
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Wishlist not found or error occurred',
        data: { items: [] }
      };
    }
  },

  // Add an item to the wishlist
  addToWishlist: async (itemData: AddToWishlistData): Promise<WishlistResponse> => {
    try {
      const response = await axiosInstance.post<any>(API_CONFIG.ENDPOINTS.wishlist.add, itemData);
      let items: WishlistItem[] = [];
      if (Array.isArray(response.data)) {
        items = response.data;
      } else if (Array.isArray(response.data?.wishlist)) {
        items = response.data.wishlist;
      } else if (Array.isArray(response.data?.items)) {
        items = response.data.items;
      } else if (Array.isArray(response.data?.data?.items)) {
        items = response.data.data.items;
      }
      return {
        success: true,
        message: response.data?.message || 'Item added to wishlist successfully',
        data: { items }
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to add item to wishlist',
        data: { items: [] }
      };
    }
  },

  // Remove an item from the wishlist
  removeFromWishlist: async (itemId: number | string): Promise<WishlistResponse | BaseResponse> => {
    try {
      const response = await axiosInstance.post<any>(API_CONFIG.ENDPOINTS.wishlist.remove, { product_id: itemId });
      let items: WishlistItem[] = [];
      if (Array.isArray(response.data)) {
        items = response.data;
      } else if (Array.isArray(response.data?.wishlist)) {
        items = response.data.wishlist;
      } else if (Array.isArray(response.data?.items)) {
        items = response.data.items;
      } else if (Array.isArray(response.data?.data?.items)) {
        items = response.data.data.items;
      }
      return {
        success: true,
        message: response.data?.message || 'Item removed from wishlist successfully',
        data: { items }
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || `Failed to remove wishlist item ${itemId}`,
        data: { items: [] }
      };
    }
  },

  // Check if a product is in the wishlist
  isInWishlist: async (productId: number | string): Promise<boolean> => {
    try {
      const wishlist = await wishlistService.getWishlist();
      return wishlist.data?.items?.some(item => 
        item.product_id.toString() === productId.toString()
      ) || false;
    } catch (error) {
      console.error(`Check if product ${productId} is in wishlist error:`, error);
      return false;
    }
  },

  // Get wishlist item count
  getWishlistItemCount: async (): Promise<number> => {
    try {
      const wishlist = await wishlistService.getWishlist();
      return wishlist.data?.items?.length || 0;
    } catch (error) {
      console.error('Get wishlist item count error:', error);
      return 0;
    }
  },
  // Clear the wishlist
  clearWishlist: async (): Promise<WishlistResponse | BaseResponse> => {
    try {
      const response = await axiosInstance.post<any>(API_CONFIG.ENDPOINTS.wishlist.clear);
      let items: WishlistItem[] = [];
      if (Array.isArray(response.data)) {
        items = response.data;
      } else if (Array.isArray(response.data?.wishlist)) {
        items = response.data.wishlist;
      } else if (Array.isArray(response.data?.items)) {
        items = response.data.items;
      } else if (Array.isArray(response.data?.data?.items)) {
        items = response.data.data.items;
      }
      return {
        success: true,
        message: response.data?.message || 'Wishlist cleared successfully',
        data: { items }
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to clear wishlist',
        data: { items: [] }
      };
    }
  }
};

export default wishlistService;
