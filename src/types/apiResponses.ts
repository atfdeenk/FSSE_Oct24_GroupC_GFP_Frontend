/**
 * Centralized API Response Types
 * 
 * This file contains all the response types for the API endpoints.
 * It helps maintain consistency and provides a single source of truth
 * for the structure of API responses throughout the application.
 */

// Common response structures
export interface BaseResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends BaseResponse {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// User types
export interface User {
  id: number | string;
  email: string;
  username?: string;
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
  created_at?: string;
  updated_at?: string;
}

export interface UserResponse extends BaseResponse {
  data: User;
}

export interface UsersResponse extends PaginatedResponse<User> {}

// Auth responses
export interface AuthData {
  user: User;
  token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
}

export interface AuthResponse extends BaseResponse {
  data: AuthData;
}

export interface LoginResponse {
  access_token: string;
  msg?: string;
}

export interface RegisterResponse extends AuthResponse {}

// Category types
export interface Category {
  id: number | string;
  name: string;
  description?: string;
  image?: string;
  parent_id?: number | string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryResponse extends BaseResponse {
  data: Category;
}

export interface CategoriesResponse extends PaginatedResponse<Category> {}

// Product types
export interface Product {
  id: number | string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  currency: string;
  image_url: string;
  location: string;
  vendor_id: number | string;
  slug: string;
  unit_quantity: string;
  discount_percentage: number;
  featured: boolean;
  flash_sale: boolean;
  created_at: string;
  updated_at: string;
  categories?: Category[];
}

export interface ProductResponse extends Product {
  // The API returns the product data directly, not wrapped in a data property
}

export interface ProductsResponse {
  limit: number;
  page: number;
  products: Product[];
  total: number;
  success?: boolean;
  message?: string;
}

// Order types
export interface OrderItem {
  id: number | string;
  product_id: number | string;
  order_id: number | string;
  quantity: number;
  price: number;
  subtotal?: number;
  product?: Product;
}

export interface Order {
  id: number | string;
  user_id: number | string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items?: OrderItem[];
  shipping_address?: string;
  payment_method?: string;
  payment_status?: 'pending' | 'paid' | 'failed';
  created_at?: string;
  updated_at?: string;
}

export interface OrderResponse extends BaseResponse {
  data: Order;
}

export interface OrdersResponse extends PaginatedResponse<Order> {}

// Cart types
export interface CartItem {
  id: number | string;
  product_id: number | string;
  user_id?: number | string;
  quantity: number;
  price?: number;
  subtotal?: number;
  product?: Product;
}

export interface Cart {
  id?: number | string;
  user_id?: number | string;
  items: CartItem[];
  total: number;
}

export interface CartResponse extends BaseResponse {
  data: Cart;
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

export interface OrdersResponse extends PaginatedResponse<Order> {}

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
