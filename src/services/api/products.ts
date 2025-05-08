// src/services/api/products.ts
import axiosInstance from './axios';
import { API_CONFIG } from './config';
import { 
  Product, 
  ProductResponse, 
  ProductsResponse,
  AssignProductCategoryResponse,
  DeleteProductCategoryResponse
} from '@/types';
import { refreshProducts, refreshProductDetail, refreshCategories } from '@/lib/dataRefresh';

// Types for product requests
export interface ProductFilters {
  category_id?: number | string;
  vendor_id?: number | string;
  search?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: 'price' | 'name' | 'created_at' | 'rating';
  sort_order?: 'asc' | 'desc';
  featured?: boolean;
  flash_sale?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  currency: string;
  image_url?: string;
  location?: string;
  unit_quantity: string;
  discount_percentage?: number;
  featured?: boolean;
  flash_sale?: boolean;
  categories?: (number | string)[];
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  stock_quantity?: number;
  currency?: string;
  image_url?: string;
  location?: string;
  unit_quantity?: string;
  discount_percentage?: number;
  featured?: boolean;
  flash_sale?: boolean;
  is_approved?: boolean;
  rejected?: boolean | null;
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
      console.error('Get products error:', error); // TODO: Centralize this error message if reused elsewhere
      throw error;
    }
  },

  // Get a single product by ID
  getProduct: async (id: number | string) => {
    try {
      const response = await axiosInstance.get<ProductResponse>(
        API_CONFIG.ENDPOINTS.products.detail(id)
      );
      return response.data;
    } catch (error) {
      console.error(`Get product ${id} error:`, error);
      throw error;
    }
  },

  // Create a new product
  createProduct: async (productData: CreateProductData) => {
    try {
      const response = await axiosInstance.post<ProductResponse>(
        API_CONFIG.ENDPOINTS.products.list,
        productData
      );
      
      // Trigger refresh after successful creation
      refreshProducts({ source: 'create' });
      if (response.data?.id) {
        refreshProductDetail(response.data.id, { source: 'create' });
      }
      
      return response.data;
    } catch (error) {
      console.error('Create product error:', error);
      throw error;
    }
  },

  // Update a product
  updateProduct: async (id: number | string, productData: UpdateProductData) => {
    try {
      const response = await axiosInstance.put<ProductResponse>(
        API_CONFIG.ENDPOINTS.products.detail(id),
        productData
      );
      
      // Trigger refresh after successful update
      refreshProducts({ source: 'update' });
      refreshProductDetail(id, { source: 'update' });
      
      return response.data;
      
    } catch (error) {
      console.error(`Update product ${id} error:`, error);
      throw error;
    }
  },

  // Delete a product
  deleteProduct: async (id: number | string) => {
    try {
      const response = await axiosInstance.delete(
        API_CONFIG.ENDPOINTS.products.detail(id)
      );
      
      // Trigger refresh after successful deletion
      refreshProducts({ source: 'delete', id });
      
      return response.data;
    } catch (error) {
      console.error(`Delete product ${id} error:`, error);
      throw error;
    }
  },

  // Upload product image
  uploadProductImage: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await axiosInstance.post(
        API_CONFIG.ENDPOINTS.products.list + '/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Upload product image error:', error);
      throw error;
    }
  },

  // Get product image URL
  getProductImageUrl: (imageUrl: string) => {
    if (!imageUrl) return '/images/placeholder-product.jpg';
    
    // If it's already a full URL, return it
    if (imageUrl.startsWith('http')) return imageUrl;
    
    // Use the imageUrl endpoint to construct the full URL
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.products.imageUrl(imageUrl)}`;
  },
  
  // Handle image loading errors
  handleImageError: (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = event.target as HTMLImageElement;
    target.src = '/images/placeholder-product.jpg';
    target.onerror = null; // Prevent infinite loops
  },
  
  // Add category to product
  addCategoryToProduct: async (productId: number | string, categoryId: number | string) => {
    try {
      const response = await axiosInstance.post<AssignProductCategoryResponse>(
        API_CONFIG.ENDPOINTS.products.categories(productId),
        { category_id: categoryId }
      );
      
      // Trigger refresh after successful category assignment
      refreshProductDetail(productId, { source: 'update-category' });
      refreshCategories({ source: 'product-assignment', id: categoryId });
      
      return response.data;
    } catch (error) {
      console.error(`Add category ${categoryId} to product ${productId} error:`, error);
      throw error;
    }
  },
  
  // Remove category from product
  removeCategoryFromProduct: async (productId: number | string, categoryId: number | string) => {
    try {
      const response = await axiosInstance.delete<DeleteProductCategoryResponse>(
        API_CONFIG.ENDPOINTS.products.removeCategory(productId, categoryId)
      );
      
      // Trigger refresh after successful category removal
      refreshProductDetail(productId, { source: 'update-category' });
      refreshCategories({ source: 'product-removal', id: categoryId });
      
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
        { params: { featured: true, limit } }
      );
      return response.data;
    } catch (error) {
      console.error('Get featured products error:', error);
      throw error;
    }
  },

  // Get flash sale products
  getFlashSaleProducts: async (limit = 6) => {
    try {
      const response = await axiosInstance.get<ProductsResponse>(
        API_CONFIG.ENDPOINTS.products.list,
        { params: { flash_sale: true, limit } }
      );
      return response.data;
    } catch (error) {
      console.error('Get flash sale products error:', error);
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (categoryId: number | string, page = 1, limit = 12) => {
    try {
      const response = await axiosInstance.get<ProductsResponse>(
        API_CONFIG.ENDPOINTS.products.list,
        { params: { category_id: categoryId, page, limit } }
      );
      return response.data;
    } catch (error) {
      console.error(`Get products by category ${categoryId} error:`, error);
      throw error;
    }
  },

  // Get products by vendor
  getProductsByVendor: async (vendorId: number | string) => {
    try {
      const response = await axiosInstance.get<ProductsResponse>(
        API_CONFIG.ENDPOINTS.products.list,
        { params: { vendor_id: vendorId, limit: 10000 } } // Use a higher limit to ensure all vendor products are returned
      );
      return response.data;
    } catch (error) {
      console.error(`Get products by vendor ${vendorId} error:`, error);
      throw error;
    }
  },

  // Search products
  searchProducts: async (query: string, page = 1, limit = 12) => {
    try {
      const response = await axiosInstance.get<ProductsResponse>(
        API_CONFIG.ENDPOINTS.products.list,
        { params: { search: query, page, limit } }
      );
      return response.data;
    } catch (error) {
      console.error(`Search products with query "${query}" error:`, error);
      throw error;
    }
  },
  
  // Get related products (products in the same category)
  getRelatedProducts: async (productId: number | string, limit = 4) => {
    try {
      // First get the product to find its categories
      const product = await productService.getProduct(productId);
      
      if (product.categories && product.categories.length > 0) {
        // Use the first category to find related products
        const categoryId = product.categories[0].id;
        
        // Get products from this category, excluding the current product
        const response = await axiosInstance.get<ProductsResponse>(
          API_CONFIG.ENDPOINTS.products.list,
          { 
            params: { 
              category_id: categoryId, 
              limit: limit + 1 // Get one extra to filter out current product
            } 
          }
        );
        
        // Filter out the current product
        const relatedProducts = response.data.products.filter(
          p => p.id.toString() !== productId.toString()
        ).slice(0, limit);
        
        return {
          ...response.data,
          products: relatedProducts
        };
      }
      
      // If no categories, get random products excluding current one
      const response = await axiosInstance.get<ProductsResponse>(
        API_CONFIG.ENDPOINTS.products.list,
        { params: { limit: limit + 1 } }
      );
      
      // Filter out the current product
      const relatedProducts = response.data.products.filter(
        p => p.id.toString() !== productId.toString()
      ).slice(0, limit);
      
      return {
        ...response.data,
        products: relatedProducts
      };
    } catch (error) {
      console.error(`Get related products for ${productId} error:`, error);
      throw error;
    }
  }
};

export default productService;
