// src/services/api/config.ts
// Centralized API configuration

/**
 * API environment configuration
 */
export const API_CONFIG = {
  // Base URLs for different environments
  BASE_URL: 'https://indirect-yasmin-ananana-483e9951.koyeb.app',
  
  // Request timeouts in milliseconds
  TIMEOUTS: {
    default: 30000,    // 30 seconds
    short: 10000,      // 10 seconds
    long: 60000        // 60 seconds
  },
  
  // Default headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  // Endpoints configuration
  ENDPOINTS: {
    // Auth endpoints
    auth: {
      login: '/login',
      register: '/register',
      me: '/me',
      users: '/users',
      user: (id: string | number) => `/users/${id}`
    },
    
    // Categories endpoints
    categories: {
      list: '/categories',
      detail: (id: string | number) => `/categories/${id}`
    },
    
    // Products endpoints
    products: {
      list: '/products',
      detail: (id: string | number) => `/products/${id}`,
      imageUrl: (imageUrl: string) => `/products/upload/${imageUrl}`,
      categories: (id: string | number) => `/products/${id}/categories`,
      removeCategory: (productId: string | number, categoryId: string | number) => 
        `/products/${productId}/categories/${categoryId}`,
      images: (id: string | number) => `/products/upload/{images_url}`
    },
    
    // Cart endpoints
    cart: {
      get: '/cart',
      items: '/cart/items',
      item: (id: string | number) => `/cart/items/${id}`
    },
    
    // Feedback/review endpoints
    feedback: {
      list: '/feedback',
      detail: (id: string | number) => `/feedback/${id}`,
      byProduct: (productId: string | number) => `/feedback/product/${productId}`,
      byUser: (userId: string | number) => `/feedback/user/${userId}`
    },
    
    // Order endpoints
    orders: {
      list: '/orders',
      detail: (id: string | number) => `/orders/${id}`,
      status: (id: string | number) => `/orders/${id}/status`
    }
  }
};
