/**
 * Order types for the checkout and order management features
 */

import { Product } from './apiResponses';

export interface ShippingAddress {
  full_name: string;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  email?: string;
}

export interface OrderItem {
  id?: string | number;
  product_id: string | number;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: string | number;
  user_id?: string | number;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: string;
  payment_method: 'balance' | 'cod' | string;
  payment_status?: 'pending' | 'paid' | 'failed';
  shipping_address: ShippingAddress;
  shipping_method?: string;
  tracking_number?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateOrderRequest {
  items: {
    product_id: string | number;
    quantity: number;
    price: number;
  }[];
  shipping_address: ShippingAddress;
  payment_method: 'balance' | 'cod';
  notes?: string;
  subtotal: number;
  discount: number;
  total: number;
}

export interface OrderResponse {
  success?: boolean;
  data?: Order;
  message?: string;
  error?: string;
  // New API response format
  msg?: string;
  order_id?: number | string;
  items?: Array<{
    image_url?: string;
    product_id: number | string;
    product_name?: string;
    quantity: number;
    unit_price: number;
    vendor_id?: number | string;
  }>;
}

export interface OrdersResponse {
  success: boolean;
  data?: Order[];
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
  error?: string;
}

export interface ProcessPaymentRequest {
  amount: number;
  order_id: string | number;
}

export interface ProcessPaymentResponse {
  success: boolean;
  data?: {
    transaction_id: string | number;
    amount: number;
    status: string;
    timestamp: string;
  };
  message?: string;
  error?: string;
}
