// src/lib/api/types.ts
// Centralized API types for better type safety and consistency
// Aligned with actual API responses from src/scripts/types/apiResponses.ts

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  success?: boolean;
  error?: string;
  message?: string;
}

/**
 * API error structure
 */
export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Search parameters
 */
export interface SearchParams {
  query?: string;
  filter?: Record<string, any>;
}

/**
 * Common request parameters
 */
export interface RequestParams extends PaginationParams, SearchParams {
  [key: string]: any;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user?: UserProfile;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'Admin' | 'Seller' | 'Customer';
}

export interface RegisterResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  phone: string;
  image_url: string;
}

export interface UsersResponse {
  users: UserProfile[];
  total: number;
  page: number;
  limit: number;
}

// Product types
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  stock_quantity: number;
  unit_quantity: string;
  location: string;
  vendor_id: number;
  image_url: string;
  discount_percentage: number;
  featured: boolean;
  flash_sale: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export type ProductImagesResponse = string[];

// Category types
export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  vendor_id: number;
  image_url: string | null;
}

export type CategoriesResponse = Category[];

export interface AssignProductCategoryResponse {
  message: string;
}

export interface DeleteProductCategoryResponse {
  msg: string;
  text?: () => Promise<string>; // Added for compatibility with test scripts
}

// Cart types
export interface CartResponse {
  cart_id: number;
  user_id: number;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
}

export type CartItemsResponse = CartItem[];

// Order types
export interface Order {
  id: number;
  user_id: number;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateOrderStatusResponse {
  status: string;
  message?: string;
}

// Feedback types
export interface Feedback {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
}

export type FeedbackResponse = Feedback[];
