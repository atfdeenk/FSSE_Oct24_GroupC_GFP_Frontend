// src/services/api/categories.ts
import axiosInstance from './axios';
import { API_CONFIG } from './config';
import { 
  Category, 
  CategoryResponse, 
  CategoriesResponse 
} from '../../types/apiResponses';

// Types for category requests
export interface CategoryFilters {
  parent_id?: number | string;
  search?: string;
  page?: number;
  limit?: number;
}

// Category service with Axios
const categoryService = {
  // Get all categories with optional filters
  getCategories: async (filters?: CategoryFilters) => {
    try {
      const response = await axiosInstance.get<CategoriesResponse>(
        API_CONFIG.ENDPOINTS.categories.list,
        { params: filters }
      );
      return response.data;
    } catch (error) {
      console.error('Get categories error:', error);
      throw error;
    }
  },

  // Get a single category by ID
  getCategory: async (id: number | string) => {
    try {
      const response = await axiosInstance.get<CategoryResponse>(
        API_CONFIG.ENDPOINTS.categories.detail(id)
      );
      return response.data;
    } catch (error) {
      console.error(`Get category ${id} error:`, error);
      throw error;
    }
  },

  // Get top-level categories (no parent)
  getTopCategories: async (limit = 10) => {
    try {
      const response = await axiosInstance.get<CategoriesResponse>(
        API_CONFIG.ENDPOINTS.categories.list,
        { params: { parent_id: null, limit } }
      );
      return response.data;
    } catch (error) {
      console.error('Get top categories error:', error);
      throw error;
    }
  },

  // Get subcategories for a parent category
  getSubcategories: async (parentId: number | string, limit = 20) => {
    try {
      const response = await axiosInstance.get<CategoriesResponse>(
        API_CONFIG.ENDPOINTS.categories.list,
        { params: { parent_id: parentId, limit } }
      );
      return response.data;
    } catch (error) {
      console.error(`Get subcategories for parent ${parentId} error:`, error);
      throw error;
    }
  }
};

export default categoryService;
