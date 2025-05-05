// Centralized exports for types
export * from './apiResponses';

// Re-export order types with explicit naming to avoid conflicts
import {
  Order as ExtendedOrder,
  OrderItem as ExtendedOrderItem,
  OrderResponse as ExtendedOrderResponse,
  OrdersResponse as ExtendedOrdersResponse,
  ShippingAddress,
  CreateOrderRequest,
  ProcessPaymentRequest,
  ProcessPaymentResponse
} from './order';

// Export the extended versions that we'll use in the checkout flow
export type {
  ExtendedOrder as CheckoutOrder,
  ExtendedOrderItem as CheckoutOrderItem,
  ExtendedOrderResponse as CheckoutOrderResponse,
  ExtendedOrdersResponse as CheckoutOrdersResponse,
  ShippingAddress,
  CreateOrderRequest,
  ProcessPaymentRequest,
  ProcessPaymentResponse
};

// Add more exports as needed
