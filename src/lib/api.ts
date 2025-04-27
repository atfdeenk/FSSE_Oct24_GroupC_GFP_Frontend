// src/lib/api.ts
// Centralized API service for https://indirect-yasmin-ananana-483e9951.koyeb.app/
// This file now serves as a compatibility layer for the new modular API structure

// Import from the new modular API structure
import { 
  api as modularApi, 
  apiGet as modularApiGet, 
  apiPost as modularApiPost, 
  apiPut as modularApiPut,
  apiDelete as modularApiDelete,
  BASE_URL,
  RequestConfig
} from './api/index';

// Re-export the BASE_URL to maintain compatibility
export { BASE_URL };

// Type for request options with timeout
type RequestOptions = RequestInit & { 
  timeout?: number;
  metadata?: Record<string, any>;
};

// Re-export the API functions with the same interface
export async function apiGet<T>(endpoint: string, options?: RequestOptions): Promise<T> {
  // Ensure leading slash is handled correctly for backward compatibility
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return modularApiGet<T>(cleanEndpoint, options);
}

export async function apiPost<T>(endpoint: string, body: any, options?: RequestOptions): Promise<T> {
  // Ensure leading slash is handled correctly for backward compatibility
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return modularApiPost<T>(cleanEndpoint, body, options);
}

export async function apiPut<T>(endpoint: string, body: any, options?: RequestOptions): Promise<T> {
  // Ensure leading slash is handled correctly for backward compatibility
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return modularApiPut<T>(cleanEndpoint, body, options);
}

export async function apiDelete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
  // Ensure leading slash is handled correctly for backward compatibility
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return modularApiDelete<T>(cleanEndpoint, options);
}

// --- Centralized API Endpoints ---
// Create a compatibility layer that matches the original API interface

export const api = {
  // Auth
  login: (body: any, options?: RequestOptions) => modularApi.login(body, options),
  register: (body: any, options?: RequestOptions) => modularApi.register(body, options),
  me: (options?: RequestOptions) => modularApi.me(options),
  users: (options?: RequestOptions) => modularApi.users(undefined, options),
  userById: (id: string, options?: RequestOptions) => modularApi.userById(id, options),

  // Categories
  categories: (options?: RequestOptions) => modularApi.categories(undefined, options),
  categoryById: (id: string, options?: RequestOptions) => modularApi.categoryById(id, options),

  // Assign categories and delete
  assignProductCategory: (productId: string, body: any, options?: RequestOptions) => 
    modularApi.assignProductCategory(productId, body.categoryId, options),
  deleteProductCategory: (productId: string, categoryId: string, options?: RequestOptions) => 
    modularApi.deleteProductCategory(productId, categoryId, options),

  // Products
  products: (options?: RequestOptions) => modularApi.products(undefined, options),
  productById: (id: string, options?: RequestOptions) => modularApi.productById(id, options),

  // Product images
  productImages: (id: string, options?: RequestOptions) => modularApi.productImages(id, options),

  // Cart
  cart: (options?: RequestOptions) => modularApi.cart(options),
  cartItems: (options?: RequestOptions) => modularApi.cartItems(options),
  cartItemById: (id: string, options?: RequestOptions) => apiGet(`cart/items/${id}`, options), // Not in modular API

  // Feedback/review
  feedback: (options?: RequestOptions) => modularApi.feedback(undefined, options),
  feedbackById: (id: string, options?: RequestOptions) => modularApi.feedbackById(id, options),
  feedbackByProduct: (productId: string, options?: RequestOptions) => modularApi.feedbackByProduct(productId, options),
  feedbackByUser: (userId: string, options?: RequestOptions) => modularApi.feedbackByUser(userId, options),

  // Orders
  orders: (options?: RequestOptions) => modularApi.orders(undefined, options),
  orderById: (id: string, options?: RequestOptions) => modularApi.getOrder(id, options),
  updateOrderStatus: (id: string, body: any, options?: RequestOptions) => modularApi.updateOrderStatus(id, body, options),
};

// Usage: import { api } from '@/lib/api'; then use api.login(), api.products(), etc.
