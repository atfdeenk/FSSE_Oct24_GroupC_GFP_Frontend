// src/lib/api.ts
// Centralized API service for https://indirect-yasmin-ananana-483e9951.koyeb.app/
// Add all API-related functions here for clean, DRY, and maintainable code.

export const BASE_URL = "/api/";

export async function apiGet<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const res = await fetch(BASE_URL + cleanEndpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(`API GET ${endpoint} failed: ${res.status}`);
  }
  return res.json();
}

export async function apiPost<T>(endpoint: string, body: any, options?: RequestInit): Promise<T> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const res = await fetch(BASE_URL + cleanEndpoint, {
    method: 'POST',
    body: JSON.stringify(body),
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(`API POST ${endpoint} failed: ${res.status}`);
  }
  return res.json();
}

// --- Centralized API Endpoints ---

export const api = {
  // Auth
  login: (body: any, options?: RequestInit) => apiPost('/login', body, options),
  register: (body: any, options?: RequestInit) => apiPost('/register', body, options),
  me: (options?: RequestInit) => apiGet('/me', options),
  users: (options?: RequestInit) => apiGet('/users', options),
  userById: (id: string, options?: RequestInit) => apiGet(`/users/${id}`, options),

  // Categories
  categories: (options?: RequestInit) => apiGet('/categories', options),
  categoryById: (id: string, options?: RequestInit) => apiGet(`/categories/${id}`, options),

  // Assign categories and delete
  assignProductCategory: (productId: string, body: any, options?: RequestInit) => apiPost(`/products/${productId}/categories`, body, options),
  deleteProductCategory: (productId: string, categoryId: string, options?: RequestInit) => fetch(BASE_URL + `products/${productId}/categories/${categoryId}`, { method: 'DELETE', ...(options || {}) }),

  // Products
  products: (options?: RequestInit) => apiGet('/products', options),
  productById: (id: string, options?: RequestInit) => apiGet(`/products/${id}`, options),

  // Product images
  productImages: (id: string, options?: RequestInit) => apiGet(`/products/${id}/images`, options),

  // Cart
  cart: (options?: RequestInit) => apiGet('/cart', options),
  cartItems: (options?: RequestInit) => apiGet('/cart/items', options),
  cartItemById: (id: string, options?: RequestInit) => apiGet(`/cart/items/${id}`, options),

  // Feedback/review
  feedback: (options?: RequestInit) => apiGet('/feedback', options),
  feedbackById: (id: string, options?: RequestInit) => apiGet(`/feedback/${id}`, options),
  feedbackByProduct: (productId: string, options?: RequestInit) => apiGet(`/feedback/product/${productId}`, options),
  feedbackByUser: (userId: string, options?: RequestInit) => apiGet(`/feedback/user/${userId}`, options),

  // Orders
  orders: (options?: RequestInit) => apiGet('/orders', options),
  orderById: (id: string, options?: RequestInit) => apiGet(`/orders/${id}`, options),
  updateOrderStatus: (id: string, body: any, options?: RequestInit) => apiPost(`/orders/${id}/status`, body, options),
};

// Usage: import { api } from '@/lib/api'; then use api.login(), api.products(), etc.
