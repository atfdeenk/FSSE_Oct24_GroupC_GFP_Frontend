// src/services/api/index.ts
// Centralized exports for API services

import axiosInstance from './axios';
import { authService } from './auth';
import productService from './products';
import categoryService from './categories';
import orderService from './orders';
import cartService from './cart';
import feedbackService from './feedback';
import apiVoucherService from './vouchers';
import { API_CONFIG } from './config';

// Export all API services
export {
  axiosInstance,
  authService,
  productService,
  categoryService,
  orderService,
  cartService,
  feedbackService,
  apiVoucherService,
  API_CONFIG
};

// Default export for convenience
export default {
  auth: authService,
  products: productService,
  categories: categoryService,
  orders: orderService,
  cart: cartService,
  feedback: feedbackService,
  vouchers: apiVoucherService,
  config: API_CONFIG,
  axios: axiosInstance
};
