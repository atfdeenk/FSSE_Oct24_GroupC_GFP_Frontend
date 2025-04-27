// src/services/api/orders.ts
import axiosInstance from './axios';
import { API_CONFIG } from './config';
import { 
  Order, 
  OrderResponse, 
  OrdersResponse 
} from '../../types/apiResponses';

// Types for order requests
export interface OrderFilters {
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status?: 'pending' | 'paid' | 'failed';
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface CreateOrderData {
  items: Array<{
    product_id: number | string;
    quantity: number;
  }>;
  shipping_address: string;
  payment_method: string;
}

export interface UpdateOrderStatusData {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

// Order service with Axios
const orderService = {
  // Get all orders with optional filters
  getOrders: async (filters?: OrderFilters) => {
    try {
      const response = await axiosInstance.get<OrdersResponse>(
        API_CONFIG.ENDPOINTS.orders.list,
        { params: filters }
      );
      return response.data;
    } catch (error) {
      console.error('Get orders error:', error);
      throw error;
    }
  },

  // Get a single order by ID
  getOrder: async (id: number | string) => {
    try {
      const response = await axiosInstance.get<OrderResponse>(
        API_CONFIG.ENDPOINTS.orders.detail(id)
      );
      return response.data;
    } catch (error) {
      console.error(`Get order ${id} error:`, error);
      throw error;
    }
  },

  // Create a new order
  createOrder: async (orderData: CreateOrderData) => {
    try {
      const response = await axiosInstance.post<OrderResponse>(
        API_CONFIG.ENDPOINTS.orders.list,
        orderData
      );
      return response.data;
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (id: number | string, statusData: UpdateOrderStatusData) => {
    try {
      const response = await axiosInstance.patch<OrderResponse>(
        API_CONFIG.ENDPOINTS.orders.status(id),
        statusData
      );
      return response.data;
    } catch (error) {
      console.error(`Update order ${id} status error:`, error);
      throw error;
    }
  },

  // Cancel an order
  cancelOrder: async (id: number | string) => {
    try {
      const response = await axiosInstance.patch<OrderResponse>(
        API_CONFIG.ENDPOINTS.orders.status(id),
        { status: 'cancelled' }
      );
      return response.data;
    } catch (error) {
      console.error(`Cancel order ${id} error:`, error);
      throw error;
    }
  }
};

export default orderService;
