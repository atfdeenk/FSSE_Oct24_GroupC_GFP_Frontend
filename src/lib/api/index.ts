// src/lib/api/index.ts
// Main API module export
// Aligned with actual API usage in the project

import { api } from './endpoints';
import { apiGet, apiPost, apiPut, apiDelete, handleApiError, ApiRequestError, BASE_URL } from './methods';
import * as apiTypes from './types';

// Re-export the BASE_URL to maintain compatibility with existing code
export { BASE_URL };

// Re-export everything for easy imports
export {
  api,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  handleApiError,
  ApiRequestError,
};

// Re-export all types from the types module
export type {
  ApiResponse,
  ApiError,
  PaginationParams,
  SearchParams,
  RequestParams,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UserProfile,
  UsersResponse,
  Product,
  ProductsResponse,
  ProductImagesResponse,
  Category,
  CategoriesResponse,
  CartResponse,
  CartItem,
  CartItemsResponse,
  Order,
  OrdersResponse,
  UpdateOrderStatusResponse,
  Feedback,
  FeedbackResponse,
  AssignProductCategoryResponse,
  DeleteProductCategoryResponse,
} from './types';

// Default export for convenience
export default api;
