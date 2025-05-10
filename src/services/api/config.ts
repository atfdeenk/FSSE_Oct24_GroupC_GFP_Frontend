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
      allUsers: '/users/all',
      admins: '/users/admins',
      customers: '/users/customers',
      sellers: '/users/sellers',
      user: (id: string | number) => `/users/${id}`,
      balance: '/users/me/balance'
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
    },
    
    // Cart endpoints
    cart: {
      get: '/cart',  // GET for retrieving cart
      add: '/cart/items', // POST for adding items
      items: '/cart/items', // GET for retrieving cart items, POST for adding items
      item: (id: string | number) => `/cart/items/${id}`, // PATCH for updating, DELETE for removing
      update: (id: string | number) => `/cart/items/${id}`, // PATCH for updating
      delete: (id: string | number) => `/cart/items/${id}` // DELETE for removing
    },

    // Wishlist endpoints
    wishlist: {
      list: '/wishlist/',  // GET for retrieving wishlist
      add: '/wishlist/add', // POST for adding items
      remove: '/wishlist/remove', // POST for removing items
      clear: '/wishlist/clear', // POST for clearing wishlist
      item: (id: string | number) => `/wishlist/${id}` // DELETE for removing specific item
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
    },
    
    // Balance top-up endpoints
    topup: {
      request: '/users/me/request-topup',  // For users to request top-ups
      list: '/topup-requests',    // For admins to get all requests
      detail: (id: string | number) => `/topup-requests/${id}`,
      approve: (id: string | number) => `/request-topup/${id}/approve`,
      reject: (id: string | number) => `/request-topup/${id}/reject`
    },
    
    // Voucher endpoints
    vouchers: {
      list: '/vouchers',  // GET for retrieving vendor's vouchers
      detail: (id: string | number) => `/vouchers/${id}`,  // GET, PUT, DELETE for specific voucher
      create: '/vouchers',  // POST to create a new voucher
      update: (id: string | number) => `/vouchers/${id}`,  // PUT to update a voucher
      delete: (id: string | number) => `/vouchers/${id}`,  // DELETE to remove a voucher
      deactivate: (id: string | number) => `/vouchers/${id}/deactivate`,  // PATCH to deactivate a voucher
      byCode: (code: string) => `/vouchers/code/${code}`  // GET voucher by code (for customers)
    }
  }
};
