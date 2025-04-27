// src/lib/api/endpoints.ts
// Centralized API endpoints with improved error handling and type safety
// Aligned with actual API usage in the project

// Import API methods directly from the file to avoid circular dependencies
import { 
  apiGet, 
  apiPost, 
  apiPut, 
  apiDelete, 
  apiPatch,
  EnhancedRequestOptions
} from './methods';
import type { ApiResponse } from './types';
import { API_CONFIG } from '@/config/api';
import * as Params from './params';

// Use the enhanced request options from methods.ts
type RequestOptions = EnhancedRequestOptions;

// Auth endpoints
export async function login(
  credentials: Params.LoginParams, 
  options?: RequestOptions
): Promise<ApiResponse<any>> {
  const validCredentials = Params.validateParams(Params.LoginParamsSchema, credentials);
  // Set rawResponse to true for backward compatibility with the auth service
  return apiPost<ApiResponse<any>>(
    API_CONFIG.ENDPOINTS.auth.login, 
    validCredentials, 
    { ...options, rawResponse: false }
  );
}

export async function register(
  userData: Params.RegisterParams, 
  options?: RequestOptions
): Promise<ApiResponse<any>> {
  const validUserData = Params.validateParams(Params.RegisterParamsSchema, userData);
  return apiPost<ApiResponse<any>>(API_CONFIG.ENDPOINTS.auth.register, validUserData, options);
}

export async function getMe(options?: RequestOptions): Promise<ApiResponse<any>> {
  // Set rawResponse to true for backward compatibility with the auth service
  return apiGet<ApiResponse<any>>(
    API_CONFIG.ENDPOINTS.auth.me, 
    { ...options, rawResponse: false }
  );
}

export async function getUsers(
  params?: Params.ListQueryParams,
  options?: RequestOptions
): Promise<ApiResponse<any>> {
  // Convert params to query string if provided
  const queryParams = params ? new URLSearchParams() : undefined;
  if (params && queryParams) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'filters' && typeof value === 'object') {
          // Handle filters object separately
          Object.entries(value).forEach(([filterKey, filterValue]) => {
            if (Array.isArray(filterValue)) {
              filterValue.forEach(v => queryParams.append(`filter[${filterKey}]`, String(v)));
            } else {
              queryParams.append(`filter[${filterKey}]`, String(filterValue));
            }
          });
        } else {
          queryParams.append(key, String(value));
        }
      }
    });
  }
  
  const endpoint = queryParams ? 
    `${API_CONFIG.ENDPOINTS.auth.users}?${queryParams.toString()}` : 
    API_CONFIG.ENDPOINTS.auth.users;
  
  return apiGet<ApiResponse<any>>(endpoint, options);
}

// Product endpoints
export async function getProducts(
  params?: Params.ListQueryParams,
  options?: RequestOptions
): Promise<ApiResponse<any>> {
  // Convert params to query string if provided
  const queryParams = params ? new URLSearchParams() : undefined;
  if (params && queryParams) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'filters' && typeof value === 'object') {
          // Handle filters object separately
          Object.entries(value).forEach(([filterKey, filterValue]) => {
            if (Array.isArray(filterValue)) {
              filterValue.forEach(v => queryParams.append(`filter[${filterKey}]`, String(v)));
            } else {
              queryParams.append(`filter[${filterKey}]`, String(filterValue));
            }
          });
        } else {
          queryParams.append(key, String(value));
        }
      }
    });
  }
  
  const endpoint = queryParams ? 
    `${API_CONFIG.ENDPOINTS.products.list}?${queryParams.toString()}` : 
    API_CONFIG.ENDPOINTS.products.list;
  
  return apiGet<ApiResponse<any>>(endpoint, options);
}

export async function getProduct(id: string | number, options?: RequestOptions): Promise<ApiResponse<any>> {
  return apiGet<ApiResponse<any>>(API_CONFIG.ENDPOINTS.products.detail(id), options);
}

export async function createProduct(
  productData: Params.CreateProductParams, 
  options?: RequestOptions
): Promise<ApiResponse<any>> {
  const validProductData = Params.validateParams(Params.CreateProductParamsSchema, productData);
  return apiPost<ApiResponse<any>>(API_CONFIG.ENDPOINTS.products.list, validProductData, options);
}

export async function updateProduct(
  id: string | number, 
  productData: Params.UpdateProductParams, 
  options?: RequestOptions
): Promise<ApiResponse<any>> {
  const validProductData = Params.validateParams(Params.UpdateProductParamsSchema, productData);
  return apiPut<ApiResponse<any>>(API_CONFIG.ENDPOINTS.products.detail(id), validProductData, options);
}

export async function deleteProduct(id: string | number, options?: RequestOptions): Promise<ApiResponse<any>> {
  return apiDelete<ApiResponse<any>>(API_CONFIG.ENDPOINTS.products.detail(id), options);
}

export async function getProductImages(id: string | number, options?: RequestOptions): Promise<ApiResponse<any>> {
  return apiGet<ApiResponse<any>>(API_CONFIG.ENDPOINTS.products.images(id), options);
}

export async function uploadProductImage(
  id: string | number, 
  imageData: FormData, 
  options?: RequestOptions
): Promise<ApiResponse<any>> {
  // Special case for FormData - don't stringify the body
  // Create a new headers object without Content-Type
  const headers = new Headers(options?.headers);
  headers.delete('Content-Type'); // Let the browser set this for FormData
  
  const imageOptions = {
    ...options,
    headers
  };
  
  return apiPost<ApiResponse<any>>(API_CONFIG.ENDPOINTS.products.images(id), imageData, imageOptions);
}

// Category endpoints
export async function getCategories(
  params?: Params.ListQueryParams,
  options?: RequestOptions
): Promise<ApiResponse<any>> {
  // Convert params to query string if provided
  const queryParams = params ? new URLSearchParams() : undefined;
  if (params && queryParams) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'filters' && typeof value === 'object') {
          // Handle filters object separately
          Object.entries(value).forEach(([filterKey, filterValue]) => {
            if (Array.isArray(filterValue)) {
              filterValue.forEach(v => queryParams.append(`filter[${filterKey}]`, String(v)));
            } else {
              queryParams.append(`filter[${filterKey}]`, String(filterValue));
            }
          });
        } else {
          queryParams.append(key, String(value));
        }
      }
    });
  }
  
  const endpoint = queryParams ? 
    `${API_CONFIG.ENDPOINTS.categories.list}?${queryParams.toString()}` : 
    API_CONFIG.ENDPOINTS.categories.list;
  
  return apiGet<ApiResponse<any>>(endpoint, options);
}

export async function getCategory(id: string | number, options?: RequestOptions): Promise<ApiResponse<any>> {
  return apiGet<ApiResponse<any>>(API_CONFIG.ENDPOINTS.categories.detail(id), options);
}

export async function createCategory(categoryData: any, options?: RequestOptions): Promise<ApiResponse<any>> {
  return apiPost<ApiResponse<any>>(API_CONFIG.ENDPOINTS.categories.list, categoryData, options);
}

export async function updateCategory(id: string | number, categoryData: any, options?: RequestOptions): Promise<ApiResponse<any>> {
  return apiPut<ApiResponse<any>>(API_CONFIG.ENDPOINTS.categories.detail(id), categoryData, options);
}

export async function deleteCategory(id: string | number, options?: RequestOptions): Promise<ApiResponse<any>> {
  return apiDelete<ApiResponse<any>>(API_CONFIG.ENDPOINTS.categories.detail(id), options);
}

// Product-Category relationship endpoints
export async function assignCategoryToProduct(
  productId: string | number, 
  categoryId: string | number, 
  options?: RequestOptions
): Promise<ApiResponse<any>> {
  return apiPost<ApiResponse<any>>(
    API_CONFIG.ENDPOINTS.products.categories.assign(productId), 
    { categoryId }, 
    options
  );
}

export async function deleteProductCategory(
  productId: string | number, 
  categoryId: string | number, 
  options?: RequestOptions
): Promise<ApiResponse<any>> {
  return apiDelete<ApiResponse<any>>(
    API_CONFIG.ENDPOINTS.products.categories.remove(productId, categoryId), 
    options
  );
}

// Cart endpoints
export async function getCart(options?: RequestOptions): Promise<ApiResponse<any>> {
  return apiGet<ApiResponse<any>>(API_CONFIG.ENDPOINTS.cart.get, options);
}

export async function getCartItems(options?: RequestOptions): Promise<ApiResponse<any>> {
  return apiGet<ApiResponse<any>>(API_CONFIG.ENDPOINTS.cart.items, options);
}

export async function addCartItem(
  itemData: Params.CartItemParams, 
  options?: RequestOptions
): Promise<ApiResponse<any>> {
  const validItemData = Params.validateParams(Params.CartItemParamsSchema, itemData);
  return apiPost<ApiResponse<any>>(API_CONFIG.ENDPOINTS.cart.items, validItemData, options);
}

export async function updateCartItem(
  id: string | number, 
  itemData: { quantity: number }, 
  options?: RequestOptions
): Promise<ApiResponse<any>> {
  return apiPut<ApiResponse<any>>(API_CONFIG.ENDPOINTS.cart.item(id), itemData, options);
}

export async function deleteCartItem(id: string | number, options?: RequestOptions): Promise<ApiResponse<any>> {
  return apiDelete<ApiResponse<any>>(API_CONFIG.ENDPOINTS.cart.item(id), options);
}

// Order endpoints
export async function getOrders(
  params?: Params.ListQueryParams,
  options?: RequestOptions
): Promise<ApiResponse<any>> {
  // Convert params to query string if provided
  const queryParams = params ? new URLSearchParams() : undefined;
  if (params && queryParams) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'filters' && typeof value === 'object') {
          // Handle filters object separately
          Object.entries(value).forEach(([filterKey, filterValue]) => {
            if (Array.isArray(filterValue)) {
              filterValue.forEach(v => queryParams.append(`filter[${filterKey}]`, String(v)));
            } else {
              queryParams.append(`filter[${filterKey}]`, String(filterValue));
            }
          });
        } else {
          queryParams.append(key, String(value));
        }
      }
    });
  }
  
  const endpoint = queryParams ? 
    `${API_CONFIG.ENDPOINTS.orders.list}?${queryParams.toString()}` : 
    API_CONFIG.ENDPOINTS.orders.list;
  
  return apiGet<ApiResponse<any>>(endpoint, options);
}

export async function getOrder(id: string | number, options?: RequestOptions): Promise<ApiResponse<any>> {
  return apiGet<ApiResponse<any>>(API_CONFIG.ENDPOINTS.orders.detail(id), options);
}

export async function createOrder(
  orderData: Params.CreateOrderParams, 
  options?: RequestOptions
): Promise<ApiResponse<any>> {
  const validOrderData = Params.validateParams(Params.CreateOrderParamsSchema, orderData);
  return apiPost<ApiResponse<any>>(API_CONFIG.ENDPOINTS.orders.list, validOrderData, options);
}

export async function updateOrderStatus(
  id: string | number, 
  statusData: { status: string }, 
  options?: RequestOptions
): Promise<ApiResponse<any>> {
  return apiPut<ApiResponse<any>>(API_CONFIG.ENDPOINTS.orders.status(id), statusData, options);
}

// Feedback endpoints
export async function getFeedback(
  params?: Params.ListQueryParams,
  options?: RequestOptions
): Promise<ApiResponse<any>> {
  // Convert params to query string if provided
  const queryParams = params ? new URLSearchParams() : undefined;
  if (params && queryParams) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'filters' && typeof value === 'object') {
          // Handle filters object separately
          Object.entries(value).forEach(([filterKey, filterValue]) => {
            if (Array.isArray(filterValue)) {
              filterValue.forEach(v => queryParams.append(`filter[${filterKey}]`, String(v)));
            } else {
              queryParams.append(`filter[${filterKey}]`, String(filterValue));
            }
          });
        } else {
          queryParams.append(key, String(value));
        }
      }
    });
  }
  
  const endpoint = queryParams ? 
    `${API_CONFIG.ENDPOINTS.feedback.list}?${queryParams.toString()}` : 
    API_CONFIG.ENDPOINTS.feedback.list;
  
  return apiGet<ApiResponse<any>>(endpoint, options);
}

export async function getFeedbackById(id: string | number, options?: RequestOptions): Promise<ApiResponse<any>> {
  return apiGet<ApiResponse<any>>(API_CONFIG.ENDPOINTS.feedback.detail(id), options);
}

export async function getFeedbackByProduct(productId: string | number, options?: RequestOptions): Promise<ApiResponse<any>> {
  return apiGet<ApiResponse<any>>(API_CONFIG.ENDPOINTS.feedback.byProduct(productId), options);
}

export async function getFeedbackByUser(userId: string | number, options?: RequestOptions): Promise<ApiResponse<any>> {
  return apiGet<ApiResponse<any>>(API_CONFIG.ENDPOINTS.feedback.byUser(userId), options);
}

export async function createFeedback(
  feedbackData: Params.CreateFeedbackParams, 
  options?: RequestOptions
): Promise<ApiResponse<any>> {
  const validFeedbackData = Params.validateParams(Params.CreateFeedbackParamsSchema, feedbackData);
  return apiPost<ApiResponse<any>>(API_CONFIG.ENDPOINTS.feedback.list, validFeedbackData, options);
}

export async function updateFeedback(
  id: string | number, 
  feedbackData: Partial<Params.CreateFeedbackParams>, 
  options?: RequestOptions
): Promise<ApiResponse<any>> {
  return apiPut<ApiResponse<any>>(API_CONFIG.ENDPOINTS.feedback.detail(id), feedbackData, options);
}

export async function deleteFeedback(id: string | number, options?: RequestOptions): Promise<ApiResponse<any>> {
  return apiDelete<ApiResponse<any>>(API_CONFIG.ENDPOINTS.feedback.detail(id), options);
}

// Helper function to convert query params to URL search params
export function createQueryString(params: Record<string, any>): string {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      if (key === 'filters' && typeof value === 'object') {
        // Handle filters object separately
        Object.entries(value).forEach(([filterKey, filterValue]) => {
          if (Array.isArray(filterValue)) {
            filterValue.forEach(v => queryParams.append(`filter[${filterKey}]`, String(v)));
          } else {
            queryParams.append(`filter[${filterKey}]`, String(filterValue));
          }
        });
      } else {
        queryParams.append(key, String(value));
      }
    }
  });
  
  return queryParams.toString();
};
