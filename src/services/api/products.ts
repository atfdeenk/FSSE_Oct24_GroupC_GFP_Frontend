// src/services/api/products.ts
import axiosInstance from './axios';
import { API_CONFIG } from './config';
import { 
  Product, 
  ProductResponse, 
  ProductsResponse 
} from '../../types/apiResponses';

// Types for product requests
export interface ProductFilters {
  category_id?: number | string;
  vendor_id?: number | string;
  search?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: 'price' | 'name' | 'created_at' | 'rating';
  sort_order?: 'asc' | 'desc';
  is_featured?: boolean;
  page?: number;
  limit?: number;
}

// Product service with Axios
const productService = {
  // Get all products with optional filters
  getProducts: async (filters?: ProductFilters) => {
    try {
      const response = await axiosInstance.get<ProductsResponse>(
        API_CONFIG.ENDPOINTS.products.list,
        { params: filters }
      );
      
      // Add success flag if it doesn't exist
      const responseData = response.data;
      if (responseData.products) {
        return {
          ...responseData,
          success: true
        };
      }
      
      return responseData;
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  },

  // Get a single product by ID
  getProduct: async (id: number | string) => {
    try {
      const response = await axiosInstance.get<ProductResponse>(
        API_CONFIG.ENDPOINTS.products.detail(id)
      );
      // The API returns the product directly
      return response.data;
    } catch (error) {
      console.error(`Get product ${id} error:`, error);
      throw error;
    }
  },

  // Get product images
  getProductImages: async (id: number | string) => {
    try {
      const response = await axiosInstance.get(
        API_CONFIG.ENDPOINTS.products.images(id)
      );
      return response.data;
    } catch (error) {
      console.error(`Get product ${id} images error:`, error);
      throw error;
    }
  },
  
  // Get product image URL
  getProductImageUrl: (imageUrl: string) => {
    return API_CONFIG.ENDPOINTS.products.imageUrl(imageUrl);
  },
  
  // Add category to product
  addCategoryToProduct: async (productId: number | string, categoryId: number | string) => {
    try {
      const response = await axiosInstance.post(
        API_CONFIG.ENDPOINTS.products.categories(productId),
        { category_id: categoryId }
      );
      return response.data;
    } catch (error) {
      console.error(`Add category ${categoryId} to product ${productId} error:`, error);
      throw error;
    }
  },
  
  // Remove category from product
  removeCategoryFromProduct: async (productId: number | string, categoryId: number | string) => {
    try {
      const response = await axiosInstance.delete(
        API_CONFIG.ENDPOINTS.products.removeCategory(productId, categoryId)
      );
      return response.data;
    } catch (error) {
      console.error(`Remove category ${categoryId} from product ${productId} error:`, error);
      throw error;
    }
  },

  // Get featured products
  getFeaturedProducts: async (limit = 6) => {
    try {
      const response = await axiosInstance.get<ProductsResponse>(
        API_CONFIG.ENDPOINTS.products.list,
        { params: { is_featured: true, limit } }
      );
      return response.data;
    } catch (error) {
      console.error('Get featured products error:', error);
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (categoryId: number | string, limit = 12) => {
    try {
      const response = await axiosInstance.get<ProductsResponse>(
        API_CONFIG.ENDPOINTS.products.list,
        { params: { category_id: categoryId, limit } }
      );
      return response.data;
    } catch (error) {
      console.error(`Get products by category ${categoryId} error:`, error);
      throw error;
    }
  },

  // Get products by vendor
  getProductsByVendor: async (vendorId: number | string, limit = 12) => {
    try {
      const response = await axiosInstance.get<ProductsResponse>(
        API_CONFIG.ENDPOINTS.products.list,
        { params: { vendor_id: vendorId, limit } }
      );
      return response.data;
    } catch (error) {
      console.error(`Get products by vendor ${vendorId} error:`, error);
      throw error;
    }
  },

  // Search products
  searchProducts: async (query: string, limit = 12) => {
    try {
      const response = await axiosInstance.get<ProductsResponse>(
        API_CONFIG.ENDPOINTS.products.list,
        { params: { search: query, limit } }
      );
      return response.data;
    } catch (error) {
      console.error(`Search products with query "${query}" error:`, error);
      throw error;
    }
  }
};

export default productService;
