// src/config/api.ts
// Centralized API configuration

/**
 * API environment configuration
 */
export const API_CONFIG = {
  // Base URLs for different environments
  BASE_URLS: {
    development: {
      browser: '/api/',
      node: 'https://indirect-yasmin-ananana-483e9951.koyeb.app/'
    },
    production: {
      browser: '/api/',
      node: 'https://indirect-yasmin-ananana-483e9951.koyeb.app/'
    },
    test: {
      browser: '/api/',
      node: 'https://indirect-yasmin-ananana-483e9951.koyeb.app/'
    }
  },
  
  // Request timeouts in milliseconds
  TIMEOUTS: {
    default: 30000,    // 30 seconds
    short: 10000,      // 10 seconds
    long: 60000,       // 60 seconds
    upload: 120000,    // 120 seconds
    development: 60000 // 60 seconds in development mode
  },
  
  // Cache durations in milliseconds
  CACHE_DURATIONS: {
    default: 5 * 60 * 1000,    // 5 minutes
    short: 60 * 1000,          // 1 minute
    long: 30 * 60 * 1000,      // 30 minutes
    session: 24 * 60 * 60 * 1000  // 24 hours
  },
  
  // Retry configuration
  RETRY: {
    maxRetries: 3,
    baseDelay: 1000,  // 1 second
    maxDelay: 5000    // 5 seconds
  },
  
  // Headers that should be included in every request
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  // Endpoints configuration
  ENDPOINTS: {
    auth: {
      login: 'login',
      register: 'register',
      me: 'me',
      users: 'users'
    },
    products: {
      list: 'products',
      detail: (id: string | number) => `products/${id}`,
      images: (id: string | number) => `products/${id}/images`,
      categories: {
        assign: (productId: string | number) => `products/${productId}/categories`,
        remove: (productId: string | number, categoryId: string | number) => 
          `products/${productId}/categories/${categoryId}`
      }
    },
    categories: {
      list: 'categories',
      detail: (id: string | number) => `categories/${id}`
    },
    cart: {
      get: 'cart',
      items: 'cart/items',
      item: (id: string | number) => `cart/items/${id}`
    },
    feedback: {
      list: 'feedback',
      detail: (id: string | number) => `feedback/${id}`,
      byProduct: (productId: string | number) => `feedback/product/${productId}`,
      byUser: (userId: string | number) => `feedback/user/${userId}`
    },
    orders: {
      list: 'orders',
      detail: (id: string | number) => `orders/${id}`,
      status: (id: string | number) => `orders/${id}/status`
    }
  }
};

/**
 * Get the current environment
 */
export function getEnvironment(): 'development' | 'production' | 'test' {
  return (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development';
}

/**
 * Get the base URL based on environment and runtime context
 */
export function getBaseUrl(): string {
  const env = getEnvironment();
  const isNodeEnvironment = typeof window === 'undefined';
  
  return isNodeEnvironment 
    ? API_CONFIG.BASE_URLS[env].node
    : API_CONFIG.BASE_URLS[env].browser;
}

/**
 * Get the full URL for an endpoint
 */
export function getEndpointUrl(endpoint: string): string {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${getBaseUrl()}${cleanEndpoint}`;
}

export default API_CONFIG;
