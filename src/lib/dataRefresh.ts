// src/lib/dataRefresh.ts
/**
 * Utility for handling data refresh after CRUD operations
 * Follows the project's principles of clean code, DRY, and centralization
 */

// Event names for different data types that might need refreshing
export const REFRESH_EVENTS = {
  PROFILE: 'refresh:profile',
  PRODUCTS: 'refresh:products',
  PRODUCT_DETAIL: 'refresh:product-detail',
  CATEGORIES: 'refresh:categories',
  CART: 'refresh:cart',
  ORDERS: 'refresh:orders',
  FEEDBACK: 'refresh:feedback',
  WISHLIST: 'refresh:wishlist'
};

// Type for refresh event detail
export interface RefreshEventDetail {
  id?: string | number;         // Optional ID for specific item refresh
  source?: string;              // Source of the refresh (e.g., 'create', 'update', 'delete')
  metadata?: any;               // Any additional metadata
  shouldRefreshPage?: boolean;  // Whether to refresh the entire page after the operation
}

/**
 * Trigger a refresh event for a specific data type
 * @param eventType The type of data to refresh
 * @param detail Optional details about what triggered the refresh
 */
export const triggerRefresh = (
  eventType: string, 
  detail: RefreshEventDetail = {}
): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // Dispatch the event for components to listen to
    const event = new CustomEvent(eventType, { detail });
    window.dispatchEvent(event);
    console.log(`Dispatched ${eventType} event`, detail);
    
    // If shouldRefreshPage is true, refresh the entire page
    if (detail.shouldRefreshPage) {
      console.log('Refreshing page as requested after data update');
      // Use a small timeout to ensure the event is processed first
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }
  } catch (error) {
    console.error(`Error dispatching ${eventType} event:`, error);
  }
};

/**
 * Register a listener for a refresh event
 * @param eventType The type of data to listen for refreshes on
 * @param callback Function to call when the event is triggered
 * @returns A cleanup function to remove the listener
 */
export const onRefresh = (
  eventType: string,
  callback: (detail: RefreshEventDetail) => void
): () => void => {
  if (typeof window === 'undefined') return () => {};
  
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<RefreshEventDetail>;
    callback(customEvent.detail);
  };
  
  window.addEventListener(eventType, handler);
  
  // Return a cleanup function
  return () => {
    window.removeEventListener(eventType, handler);
  };
};

/**
 * Utility to refresh profile data after CRUD operations
 */
export const refreshProfile = (detail: RefreshEventDetail = {}): void => {
  triggerRefresh(REFRESH_EVENTS.PROFILE, detail);
};

/**
 * Utility to refresh products data after CRUD operations
 */
export const refreshProducts = (detail: RefreshEventDetail = {}): void => {
  triggerRefresh(REFRESH_EVENTS.PRODUCTS, detail);
};

/**
 * Utility to refresh a specific product's details after CRUD operations
 */
export const refreshProductDetail = (productId: string | number, detail: RefreshEventDetail = {}): void => {
  triggerRefresh(REFRESH_EVENTS.PRODUCT_DETAIL, { ...detail, id: productId });
};

/**
 * Utility to refresh categories data after CRUD operations
 */
export const refreshCategories = (detail: RefreshEventDetail = {}): void => {
  triggerRefresh(REFRESH_EVENTS.CATEGORIES, detail);
};

/**
 * Utility to refresh cart data after CRUD operations
 */
export const refreshCart = (detail: RefreshEventDetail = {}): void => {
  triggerRefresh(REFRESH_EVENTS.CART, detail);
};

/**
 * Utility to refresh orders data after CRUD operations
 */
export const refreshOrders = (detail: RefreshEventDetail = {}): void => {
  triggerRefresh(REFRESH_EVENTS.ORDERS, detail);
};

/**
 * Utility to refresh feedback/reviews data after CRUD operations
 */
export const refreshFeedback = (detail: RefreshEventDetail = {}): void => {
  triggerRefresh(REFRESH_EVENTS.FEEDBACK, detail);
};

/**
 * Utility to refresh wishlist data after CRUD operations
 */
export const refreshWishlist = (detail: RefreshEventDetail = {}): void => {
  triggerRefresh(REFRESH_EVENTS.WISHLIST, detail);
};

export default {
  REFRESH_EVENTS,
  triggerRefresh,
  onRefresh,
  refreshProfile,
  refreshProducts,
  refreshProductDetail,
  refreshCategories,
  refreshCart,
  refreshOrders,
  refreshFeedback,
  refreshWishlist
};
