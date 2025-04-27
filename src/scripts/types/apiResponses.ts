// src/scripts/types/apiResponses.ts
// Types for all API endpoint responses used in testApi.ts

export interface MeResponse {
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

export interface Order {
  id: number;
  user_id: number;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  // Add more fields if needed
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  vendor_id: number;
  image_url: string | null;
}

export type CategoriesResponse = Category[];

export interface CartResponse {
  cart_id: number;
  user_id: number;
  // Add more fields if needed
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  // Add more fields if needed
}

export type CartItemsResponse = CartItem[];

export interface Feedback {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
}

export type FeedbackResponse = Feedback[];

export interface AssignProductCategoryResponse {
  message: string;
}

export interface DeleteProductCategoryResponse {
  msg: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  // Add more fields if needed
}

export interface UsersResponse {
  users: MeResponse[];
  total: number;
  page: number;
  limit: number;
}

export type UserByIdResponse = MeResponse;

export type CategoryByIdResponse = Category;
export type ProductByIdResponse = Product;
export type ProductImagesResponse = string[];
export type FeedbackByIdResponse = Feedback;

export interface UpdateOrderStatusResponse {
  status: string;
  message?: string;
}
