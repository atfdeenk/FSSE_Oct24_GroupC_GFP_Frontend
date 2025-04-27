// src/lib/api/index.ts
// Centralized API service with improved error handling and type safety

// Import methods
import { 
  apiGet, 
  apiPost, 
  apiPut, 
  apiDelete, 
  apiPatch, 
  handleApiError, 
  ApiRequestError, 
  BASE_URL 
} from './methods';

// Import endpoints
import * as endpoints from './endpoints';

// Re-export types
export * from './types';

// Re-export interceptors
export * from './interceptors';

// Re-export params
export * from './params';

// Re-export the BASE_URL and API methods to maintain compatibility with existing code
export { 
  BASE_URL,
  apiGet, 
  apiPost, 
  apiPut, 
  apiDelete, 
  apiPatch, 
  handleApiError, 
  ApiRequestError 
};

// Create a consolidated API object for backward compatibility
export const api = {
  // Auth endpoints
  login: endpoints.login,
  register: endpoints.register,
  me: endpoints.getMe,
  users: endpoints.getUsers,
  userById: (id: string | number, options?: RequestInit) => endpoints.getUsers(undefined, { ...options, metadata: { userId: id } }),
  
  // Product endpoints
  products: endpoints.getProducts,
  productById: endpoints.getProduct,
  createProduct: endpoints.createProduct,
  updateProduct: endpoints.updateProduct,
  deleteProduct: endpoints.deleteProduct,
  productImages: endpoints.getProductImages,
  uploadProductImage: endpoints.uploadProductImage,
  
  // Category endpoints
  categories: endpoints.getCategories,
  categoryById: endpoints.getCategory,
  createCategory: endpoints.createCategory,
  updateCategory: endpoints.updateCategory,
  deleteCategory: endpoints.deleteCategory,
  
  // Product-Category relationship endpoints
  assignProductCategory: endpoints.assignCategoryToProduct,
  deleteProductCategory: endpoints.deleteProductCategory,
  
  // Cart endpoints
  cart: endpoints.getCart,
  cartItems: endpoints.getCartItems,
  addCartItem: endpoints.addCartItem,
  updateCartItem: endpoints.updateCartItem,
  deleteCartItem: endpoints.deleteCartItem,
  
  // Order endpoints
  orders: endpoints.getOrders,
  getOrder: endpoints.getOrder,
  createOrder: endpoints.createOrder,
  updateOrderStatus: endpoints.updateOrderStatus,
  
  // Feedback endpoints
  feedback: endpoints.getFeedback,
  feedbackById: endpoints.getFeedbackById,
  feedbackByProduct: endpoints.getFeedbackByProduct,
  feedbackByUser: endpoints.getFeedbackByUser,
  createFeedback: endpoints.createFeedback,
  updateFeedback: endpoints.updateFeedback,
  deleteFeedback: endpoints.deleteFeedback,
  
  // Also include the raw API methods for direct use
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  apiPatch,
  handleApiError,
  ApiRequestError,
};

// Export all endpoints directly as well
export * from './endpoints';

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
