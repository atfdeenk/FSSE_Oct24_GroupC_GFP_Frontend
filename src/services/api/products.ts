// src/services/api/products.ts
import axiosInstance from './axios';
import { API_CONFIG } from './config';
import { toast } from 'react-hot-toast';
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
  slug?: string; // Added based on API requirements
  discount_percentage?: number;
  featured?: boolean;
  flash_sale?: boolean;
  category_ids?: number[]; // Changed to match API format
  is_approved?: boolean;
  rejected?: boolean | null;
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
  slug?: string; // Added based on API requirements
  discount_percentage?: number;
  featured?: boolean;
  flash_sale?: boolean;
  category_ids?: number[]; // Added to match API format
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

  // Helper function to generate a unique slug with timestamp suffix
  generateUniqueSlug: (name: string) => {
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `${baseSlug}-${Date.now().toString().slice(-6)}`;
  },

  // Create a new product
  createProduct: async (productData: CreateProductData): Promise<ProductResponse> => {
    try {
      console.log('Creating product with data:', JSON.stringify(productData, null, 2));
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
    } catch (error: any) {
      console.error('Create product error:', error);
      
      // Handle 409 Conflict error (likely due to duplicate slug)
      if (error.response && error.response.status === 409) {
        console.log('Conflict detected, retrying with unique slug...');
        
        // Generate a new unique slug with timestamp
        if (productData.name) {
          const uniqueSlug = `${productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString().slice(-6)}`;
          
          // Update the product data with the new slug
          const updatedProductData = {
            ...productData,
            slug: uniqueSlug
          };
          
          console.log('Retrying with updated data:', JSON.stringify(updatedProductData, null, 2));
          
          // Retry the request with the new slug
          return productService.createProduct(updatedProductData);
        }
      }
      
      // Log detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        
        // Show more specific error message to the user
        if (error.response.data && error.response.data.message) {
          toast.error(`Failed to create product: ${error.response.data.message}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        toast.error('Network error: Please check your connection');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        toast.error(`Error: ${error.message}`);
      }
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
  getFeaturedProducts: async (limit = 1000) => {
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
  getFlashSaleProducts: async (limit = 1000) => {
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
  getProductsByCategory: async (categoryId: number | string, page = 1, limit = 1000) => {
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

  // Get products by vendor - uses direct vendor_id filtering only
  getProductsByVendor: async (vendorId: number | string) => {
    try {
      console.log(`=== Starting getProductsByVendor for vendor ${vendorId} ===`);
      
      // Convert vendorId to number for consistent comparison
      const numericVendorId = typeof vendorId === 'string' ? parseInt(vendorId) : vendorId;
      console.log(`Normalized vendor ID: ${numericVendorId}`);
      
      // Use direct vendor_id filtering with a high limit
      console.log(`Fetching products with vendor_id=${numericVendorId}`);
      
      // Make the API request with vendor_id filter
      const response = await axiosInstance.get<ProductsResponse>(
        API_CONFIG.ENDPOINTS.products.list,
        { 
          params: { 
            vendor_id: numericVendorId,
            page: 1,
            limit: 100 // Use a high limit to get all vendor products at once
          } 
        }
      );
      
      // Extract products from the response
      const vendorProducts = response.data.products || [];
      
      console.log(`Server returned ${vendorProducts.length} products for vendor ${vendorId}`);
      
      // Log all vendor products for debugging
      vendorProducts.forEach(product => {
        console.log(`Product: ID: ${product.id}, Name: ${product.name}, Vendor ID: ${product.vendor_id}`);
      });
      
      // Sort products by ID in descending order (newest first)
      vendorProducts.sort((a, b) => {
        const idA = typeof a.id === 'string' ? parseInt(a.id) : a.id;
        const idB = typeof b.id === 'string' ? parseInt(b.id) : b.id;
        return idB - idA; // Descending order
      });
      
      // Return in the same format as the API would
      const result = {
        products: vendorProducts,
        total: vendorProducts.length,
        page: 1,
        limit: vendorProducts.length,
        pages: 1
      };
      
      console.log(`=== Completed getProductsByVendor with ${vendorProducts.length} products ===`);
      return result;
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
