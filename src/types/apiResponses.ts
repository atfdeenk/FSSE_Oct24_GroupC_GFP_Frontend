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
// Base user interface with minimal fields returned by /users endpoint
export interface BaseUser {
  id: number | string;
  email: string;
  username: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

// Extended user interface with all fields returned by /me endpoint
export interface User extends Partial<BaseUser> {
  id: number | string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

// The API returns a user object directly for the /me endpoint
export type UserResponse = User;

// The /users endpoint returns an array of BaseUser objects
export type UsersResponse = BaseUser[];

// Auth responses
export interface AuthData {
  user: User;
  token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
}

// Internal interface for standardizing API responses in our application
export interface AuthResponse {
  success: boolean;
  data: AuthData;
  message: string;
}

// The API returns just an access_token on successful login
export interface LoginResponse {
  access_token: string;
  msg?: string;
}

// The API returns a message on successful registration
export interface RegisterResponse {
  msg: string;
}

// Category types
export interface Category {
  id: number | string;
  name: string;
  slug: string;
  image_url: string | null;
  parent_id: number | string | null;
  vendor_id: number | string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// The API returns a category object directly, not wrapped in a response object
export interface CategoryResponse extends Category {}

// The API returns an array of categories directly
export type CategoriesResponse = Category[];

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
  product_id: number | string;
  quantity: number;
  unit_price: number;
  id?: number | string;
  order_id?: number | string;
  subtotal?: number;
  product?: Product;
}

// Basic order interface returned by /orders endpoint
export interface BasicOrder {
  id: number | string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: string; // API returns as string, not number
  created_at: string;
}

// Full order interface returned by /orders/:id endpoint
export interface Order extends Partial<BasicOrder> {
  id: number | string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items?: OrderItem[];
  user_id?: number | string;
  shipping_address?: string;
  shipping_method?: string;
  total_amount?: string; // API returns as string, not number
  payment_method?: string;
  payment_status?: 'pending' | 'paid' | 'failed';
  created_at?: string;
  updated_at?: string;
}

export interface OrderResponse {
  order: Order;
}

// The /orders endpoint returns an array of BasicOrder objects
export type OrdersResponse = BasicOrder[];

// Cart types
// Raw API response from GET /cart
// export interface CartMetaResponse {
//   cart_id: number | string;
//   user_id: number | string;
//   message: string;
// }

// Raw API response from GET /cart/items
// export interface CartItemsResponse {
//   items: Array<{
//     id: number | string;
//     product_id: number | string;
//     quantity: number;
//   }>;
//   message: string;
// }

// Normalized/merged cart types for frontend use
export interface CartItem {
  id: number | string;
  product_id: number | string;
  user_id?: number | string;
  quantity: number;
  price?: number;
  subtotal?: number;
  product?: Product;
}

// Unified cart object used in the app after merging /cart and /cart/items
export interface Cart {
  id?: number | string;
  user_id?: number | string;
  items: CartItem[];
  total: number;
}

// Unified cart response for frontend (not a direct API response)
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

export interface OrderResponse {
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
