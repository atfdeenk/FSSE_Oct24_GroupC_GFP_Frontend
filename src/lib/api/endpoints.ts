// src/lib/api/endpoints.ts
// Type-safe API endpoints aligned with actual API usage in the test scripts

import { apiGet, apiPost, apiPut, apiDelete } from './methods';
import {
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
  DeleteProductCategoryResponse
} from './types';

/**
 * Centralized API endpoints with proper typing
 * Matches the actual API usage in the test scripts
 */
export const api = {
  // Auth endpoints
  login: (body: LoginRequest, options?: RequestInit) => 
    apiPost<LoginResponse>('login', body, options),
  
  register: (body: RegisterRequest, options?: RequestInit) => 
    apiPost<RegisterResponse>('register', body, options),
  
  me: (options?: RequestInit) => 
    apiGet<UserProfile>('me', options),
  
  users: (options?: RequestInit) => 
    apiGet<UsersResponse>('users', options),
  
  userById: (id: string, options?: RequestInit) => 
    apiGet<UserProfile>(`users/${id}`, options),

  // Categories endpoints
  categories: (options?: RequestInit) => 
    apiGet<CategoriesResponse>('categories', options),
  
  categoryById: (id: string, options?: RequestInit) => 
    apiGet<Category>(`categories/${id}`, options),

  // Products endpoints
  products: (options?: RequestInit) => 
    apiGet<ProductsResponse>('products', options),
  
  productById: (id: string, options?: RequestInit) => 
    apiGet<Product>(`products/${id}`, options),
  
  productImages: (id: string, options?: RequestInit) => 
    apiGet<ProductImagesResponse>(`products/${id}/images`, options),

  // Product-category management
  assignProductCategory: (productId: string, body: { category_id: number }, options?: RequestInit) => 
    apiPost<AssignProductCategoryResponse>(`products/${productId}/categories`, body, options),
  
  deleteProductCategory: (productId: string, categoryId: string, options?: RequestInit) => 
    apiDelete<DeleteProductCategoryResponse>(`products/${productId}/categories/${categoryId}`, options),

  // Cart endpoints
  cart: (options?: RequestInit) => 
    apiGet<CartResponse>('cart', options),
  
  cartItems: (options?: RequestInit) => 
    apiGet<CartItemsResponse>('cart/items', options),
  
  // Orders endpoints
  orders: (options?: RequestInit) => 
    apiGet<OrdersResponse>('orders', options),
  
  updateOrderStatus: (id: string, body: { status: string }, options?: RequestInit) => 
    apiPut<UpdateOrderStatusResponse>(`orders/${id}/status`, body, options),

  // Feedback/review endpoints
  feedback: (options?: RequestInit) => 
    apiGet<FeedbackResponse>('feedback', options),
  
  feedbackById: (id: string, options?: RequestInit) => 
    apiGet<Feedback>(`feedback/${id}`, options),
  
  feedbackByProduct: (productId: string, options?: RequestInit) => 
    apiGet<FeedbackResponse>(`feedback/product/${productId}`, options),
  
  feedbackByUser: (userId: string, options?: RequestInit) => 
    apiGet<FeedbackResponse>(`feedback/user/${userId}`, options)
};
