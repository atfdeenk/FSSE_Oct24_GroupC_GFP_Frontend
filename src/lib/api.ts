// src/lib/api.ts
// Centralized API service for https://indirect-yasmin-ananana-483e9951.koyeb.app/
// This file now serves as a compatibility layer for the new modular API structure

// Import from the new modular API structure
import { 
  api as modularApi, 
  apiGet as modularApiGet, 
  apiPost as modularApiPost, 
  BASE_URL 
} from './api/index';

// Re-export the BASE_URL to maintain compatibility
export { BASE_URL };

// Re-export the apiGet and apiPost functions with the same interface
export async function apiGet<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // Ensure leading slash is handled correctly for backward compatibility
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return modularApiGet<T>(cleanEndpoint, options);
}

export async function apiPost<T>(endpoint: string, body: any, options?: RequestInit): Promise<T> {
  // Ensure leading slash is handled correctly for backward compatibility
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return modularApiPost<T>(cleanEndpoint, body, options);
}

// --- Centralized API Endpoints ---
// Create a compatibility layer that matches the original API interface

export const api = {
  // Auth
  login: (body: any, options?: RequestInit) => modularApi.login(body, options),
  register: (body: any, options?: RequestInit) => modularApi.register(body, options),
  me: (options?: RequestInit) => modularApi.me(options),
  users: (options?: RequestInit) => modularApi.users(options),
  userById: (id: string, options?: RequestInit) => modularApi.userById(id, options),

  // Categories
  categories: (options?: RequestInit) => modularApi.categories(options),
  categoryById: (id: string, options?: RequestInit) => modularApi.categoryById(id, options),

  // Assign categories and delete
  assignProductCategory: (productId: string, body: any, options?: RequestInit) => 
    modularApi.assignProductCategory(productId, body, options),
  deleteProductCategory: (productId: string, categoryId: string, options?: RequestInit) => 
    modularApi.deleteProductCategory(productId, categoryId, options),

  // Products
  products: (options?: RequestInit) => modularApi.products(options),
  productById: (id: string, options?: RequestInit) => modularApi.productById(id, options),

  // Product images
  productImages: (id: string, options?: RequestInit) => modularApi.productImages(id, options),

  // Cart
  cart: (options?: RequestInit) => modularApi.cart(options),
  cartItems: (options?: RequestInit) => modularApi.cartItems(options),
  cartItemById: (id: string, options?: RequestInit) => apiGet(`cart/items/${id}`, options), // Not in modular API

  // Feedback/review
  feedback: (options?: RequestInit) => modularApi.feedback(options),
  feedbackById: (id: string, options?: RequestInit) => modularApi.feedbackById(id, options),
  feedbackByProduct: (productId: string, options?: RequestInit) => modularApi.feedbackByProduct(productId, options),
  feedbackByUser: (userId: string, options?: RequestInit) => modularApi.feedbackByUser(userId, options),

  // Orders
  orders: (options?: RequestInit) => modularApi.orders(options),
  orderById: (id: string, options?: RequestInit) => apiGet(`orders/${id}`, options), // Not in modular API
  updateOrderStatus: (id: string, body: any, options?: RequestInit) => modularApi.updateOrderStatus(id, body, options),
};

// Usage: import { api } from '@/lib/api'; then use api.login(), api.products(), etc.
