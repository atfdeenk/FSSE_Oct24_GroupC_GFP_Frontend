// src/services/api/categories.ts
import axiosInstance from './axios';
import { API_CONFIG } from './config';
import { 
  Category, 
  CategoryResponse, 
  CategoriesResponse,
  BaseResponse
} from '@/types';
import { getCategoryImageUrl, handleCategoryImageError } from '@/utils';

// Types for category requests
export interface CategoryFilters {
  parent_id?: number | string;
  search?: string;
  page?: number;
  limit?: number;
  vendor_id?: number | string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  parent_id?: number | string | null;
  image_url?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  parent_id?: number | string | null;
  image_url?: string;
}

// Category service with Axios
const categoryService = {
  // Get all categories with optional filters
  getCategories: async (filters?: CategoryFilters): Promise<CategoriesResponse> => {
    try {
      const response = await axiosInstance.get<CategoriesResponse>(
        API_CONFIG.ENDPOINTS.categories.list,
        { params: filters }
      );
      return response.data;
    } catch (error: any) {
      console.error('Get categories error:', error);
      // Return empty array on error
      return [];
    }
  },

  // Get a single category by ID
  getCategory: async (id: number | string): Promise<CategoryResponse> => {
    try {
      const response = await axiosInstance.get<CategoryResponse>(
        API_CONFIG.ENDPOINTS.categories.detail(id)
      );
      return response.data;
    } catch (error: any) {
      console.error(`Get category ${id} error:`, error);
      // Return null on error
      return null as any;
    }
  },

  // Create a new category
  createCategory: async (categoryData: CreateCategoryData): Promise<CategoryResponse | BaseResponse> => {
    try {
      const response = await axiosInstance.post<CategoryResponse>(
        API_CONFIG.ENDPOINTS.categories.list,
        categoryData
      );
      return response.data;
    } catch (error: any) {
      console.error('Create category error:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to create category',
        error: error?.message
      };
    }
  },

  // Update a category
  updateCategory: async (id: number | string, categoryData: UpdateCategoryData): Promise<CategoryResponse | BaseResponse> => {
    try {
      const response = await axiosInstance.patch<CategoryResponse>(
        API_CONFIG.ENDPOINTS.categories.detail(id),
        categoryData
      );
      return response.data;
    } catch (error: any) {
      console.error(`Update category ${id} error:`, error);
      return {
        success: false,
        message: error?.response?.data?.message || `Failed to update category ${id}`,
        error: error?.message
      };
    }
  },

  // Delete a category
  deleteCategory: async (id: number | string): Promise<BaseResponse> => {
    try {
      const response = await axiosInstance.delete<BaseResponse>(
        API_CONFIG.ENDPOINTS.categories.detail(id)
      );
      return response.data;
    } catch (error: any) {
      console.error(`Delete category ${id} error:`, error);
      return {
        success: false,
        message: error?.response?.data?.message || `Failed to delete category ${id}`,
        error: error?.message
      };
    }
  },

  // Get top-level categories (no parent)
  getTopCategories: async (limit = 10): Promise<CategoriesResponse> => {
    try {
      const response = await axiosInstance.get<CategoriesResponse>(
        API_CONFIG.ENDPOINTS.categories.list,
        { params: { parent_id: null, limit } }
      );
      return response.data;
    } catch (error: any) {
      console.error('Get top categories error:', error);
      // Return empty array on error
      return [];
    }
  },

  // Get subcategories for a parent category
  getSubcategories: async (parentId: number | string, limit = 20): Promise<CategoriesResponse> => {
    try {
      const response = await axiosInstance.get<CategoriesResponse>(
        API_CONFIG.ENDPOINTS.categories.list,
        { params: { parent_id: parentId, limit } }
      );
      return response.data;
    } catch (error: any) {
      console.error(`Get subcategories for parent ${parentId} error:`, error);
      // Return empty array on error
      return [];
    }
  },
  
  // Get categories by vendor - fetches all categories and filters on client side
  getCategoriesByVendor: async (vendorId: number | string): Promise<CategoriesResponse> => {
    try {
      console.log(`=== Starting getCategoriesByVendor for vendor ${vendorId} ===`);
      
      // Convert vendorId to number for consistent comparison
      const numericVendorId = typeof vendorId === 'string' ? parseInt(vendorId) : vendorId;
      console.log(`Normalized vendor ID: ${numericVendorId}`);
      
      // Fetch all categories without any filtering
      console.log('Fetching all categories and filtering client-side...');
      
      // Make the API request without any params
      const response = await axiosInstance.get<CategoriesResponse>(
        API_CONFIG.ENDPOINTS.categories.list,
        { 
          params: { 
            limit: 1000 // Use a high limit to get all categories at once
          } 
        }
      );
      
      // Extract all categories from the response
      const allCategories = response.data || [];
      console.log(`Server returned ${allCategories.length} total categories`);
      
      // Filter categories by vendor ID on the client side
      const vendorCategories = allCategories.filter((category: Category) => {
        // Convert category vendor_id to number for consistent comparison
        const categoryVendorId = typeof category.vendor_id === 'string' ? 
          parseInt(category.vendor_id) : category.vendor_id;
        
        // Check if this category belongs to the specified vendor
        return categoryVendorId === numericVendorId;
      });
      
      console.log(`Filtered to ${vendorCategories.length} categories for vendor ${vendorId}`);
      
      // Log all vendor categories for debugging
      vendorCategories.forEach((category: Category) => {
        console.log(`Category: ID: ${category.id}, Name: ${category.name}, Vendor ID: ${category.vendor_id}`);
      });
      
      // Return only the filtered categories
      console.log(`=== Completed getCategoriesByVendor with ${vendorCategories.length} categories ===`);
      return vendorCategories;
    } catch (error: any) {
      console.error(`Get categories for vendor ${vendorId} error:`, error);
      // Return empty array on error
      return [];
    }
  },
  
  // Get category image URL
  getCategoryImageUrl,
  
  // Handle category image loading errors
  handleCategoryImageError
};

export default categoryService;
