// src/services/api/orders.ts
import axiosInstance from './axios';
import { API_CONFIG } from './config';
import { 
  Order, 
  OrderResponse, 
  OrdersResponse,
  BaseResponse
} from '@/types';

// Types for order requests
export interface OrderFilters {
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status?: 'pending' | 'paid' | 'failed';
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface ShippingAddress {
  full_name: string;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  email: string;
}

export interface OrderItem {
  product_id: number | string;
  quantity: number;
  unit_price: number;
  note?: string;
  eco_packaging?: boolean;
}

export interface CreateOrderData {
  vendor_id?: number | string;
  items: OrderItem[];
  shipping_address?: ShippingAddress;
  payment_method?: 'balance' | 'cod';
  notes?: string;
}

export interface UpdateOrderStatusData {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

// Helper function to format order data for display
export const formatOrderStatus = (status: string): string => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

// Helper function to format payment status for display
export const formatPaymentStatus = (status: string): string => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

// Order service with Axios
const orderService = {
  // Get all orders with optional filters
  getOrders: async (filters?: OrderFilters): Promise<OrdersResponse> => {
    try {
      const response = await axiosInstance.get<OrdersResponse>(
        API_CONFIG.ENDPOINTS.orders.list,
        { params: filters }
      );
      return response.data;
    } catch (error: any) {
      console.error('Get orders error:', error);
      // Return empty orders array on error
      return [];
    }
  },

  // Get a single order by ID
  getOrder: async (id: number | string): Promise<OrderResponse | null> => {
    try {
      const response = await axiosInstance.get<OrderResponse>(
        API_CONFIG.ENDPOINTS.orders.detail(id)
      );
      return response.data;
    } catch (error: any) {
      console.error(`Get order ${id} error:`, error);
      return null;
    }
  },

  // Create a new order
  createOrder: async (orderData: CreateOrderData): Promise<OrderResponse | BaseResponse> => {
    try {
      const response = await axiosInstance.post<OrderResponse>(
        API_CONFIG.ENDPOINTS.orders.list,
        orderData
      );
      return response.data;
    } catch (error: any) {
      console.error('Create order error:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to create order',
        error: error?.message
      };
    }
  },

  // Update order status
  updateOrderStatus: async (id: number | string, statusData: UpdateOrderStatusData): Promise<OrderResponse | BaseResponse> => {
    try {
      const response = await axiosInstance.patch<OrderResponse>(
        API_CONFIG.ENDPOINTS.orders.status(id),
        statusData
      );
      return response.data;
    } catch (error: any) {
      console.error(`Update order ${id} status error:`, error);
      return {
        success: false,
        message: error?.response?.data?.message || `Failed to update order ${id} status`,
        error: error?.message
      };
    }
  },

  // Cancel an order
  cancelOrder: async (id: number | string): Promise<OrderResponse | BaseResponse> => {
    try {
      const response = await axiosInstance.patch<OrderResponse>(
        API_CONFIG.ENDPOINTS.orders.status(id),
        { status: 'cancelled' }
      );
      return response.data;
    } catch (error: any) {
      console.error(`Cancel order ${id} error:`, error);
      return {
        success: false,
        message: error?.response?.data?.message || `Failed to cancel order ${id}`,
        error: error?.message
      };
    }
  },
  
  // Get orders by status
  getOrdersByStatus: async (status: string, page = 1, limit = 10): Promise<OrdersResponse> => {
    try {
      const response = await axiosInstance.get<OrdersResponse>(
        API_CONFIG.ENDPOINTS.orders.list,
        { params: { status, page, limit } }
      );
      return response.data;
    } catch (error: any) {
      console.error(`Get orders by status ${status} error:`, error);
      return [];
    }
  },
  
  // Get order count by status
  getOrderCountByStatus: async (status: string): Promise<number> => {
    try {
      const response = await orderService.getOrdersByStatus(status, 1, 1);
      return response.length || 0;
    } catch (error) {
      console.error(`Get order count by status ${status} error:`, error);
      return 0;
    }
  },
  
  // Calculate order total
  calculateOrderTotal: (order: Order): number => {
    if (!order || !order.items) return 0;
    
    return order.items.reduce((total, item) => {
      const price = typeof item.unit_price === 'number' ? item.unit_price : 0;
      const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
      return total + (price * quantity);
    }, 0);
  }
};

export { orderService as ordersService };
export default orderService;
