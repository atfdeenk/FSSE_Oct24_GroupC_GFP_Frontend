/**
 * Centralized API Response Types
 * 
 * This file contains all the response types for the API endpoints.
 * It helps maintain consistency and provides a single source of truth
 * for the structure of API responses throughout the application.
 */

// Common response structures
export interface BaseResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends BaseResponse {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Auth responses
export interface AuthResponse extends BaseResponse {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  user?: UserResponse;
}

export interface UserResponse {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  image_url?: string;
  bank_account?: string;
  bank_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RegisterResponse extends BaseResponse {
  user: UserResponse;
}

export interface LoginResponse extends AuthResponse {}

export interface MeResponse extends UserResponse {}

export interface UsersResponse extends PaginatedResponse<UserResponse> {}

// Product responses
export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  image_url: string;
  location: string;
  seller_id: number;
  seller_name?: string;
  categories?: CategoryResponse[];
  created_at?: string;
  updated_at?: string;
}

export interface ProductsResponse extends PaginatedResponse<ProductResponse> {}

export interface CategoryResponse {
  id: number;
  name: string;
  description?: string;
}

export interface CategoriesResponse extends PaginatedResponse<CategoryResponse> {}

// Cart responses
export interface CartItemResponse {
  id: number;
  product_id: number;
  product: ProductResponse;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface CartResponse extends BaseResponse {
  id: number;
  user_id: number;
  items: CartItemResponse[];
  total: number;
  created_at?: string;
  updated_at?: string;
}

// Order responses
export interface OrderItemResponse {
  id: number;
  product_id: number;
  product: ProductResponse;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderResponse extends BaseResponse {
  id: number;
  user_id: number;
  items: OrderItemResponse[];
  total: number;
  status: string;
  payment_status: string;
  shipping_address: string;
  shipping_method: string;
  tracking_number?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrdersResponse extends PaginatedResponse<OrderResponse> {}

// Review responses
export interface ReviewResponse {
  id: number;
  user_id: number;
  user_name: string;
  product_id: number;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ReviewsResponse extends PaginatedResponse<ReviewResponse> {}

// Feedback responses
export interface FeedbackResponse {
  id: number;
  user_id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface FeedbacksResponse extends PaginatedResponse<FeedbackResponse> {}

// Product category responses
export interface AssignProductCategoryResponse extends BaseResponse {
  product_id: number;
  category_id: number;
}

export interface DeleteProductCategoryResponse extends BaseResponse {
  product_id: number;
  category_id: number;
}
