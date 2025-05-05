/**
 * Events utility for managing application-wide events
 * This allows different components to communicate with each other
 * without direct dependencies
 */

// Event types
export const REFRESH_EVENTS = {
  CART: 'cart-refresh',
  WISHLIST: 'wishlist-refresh',
  BALANCE: 'balance-refresh',
  USER: 'user-refresh'
};

export interface RefreshEventDetail {
  source?: string;
  showToast?: boolean;
  [key: string]: any;
}

// Trigger a refresh event
export function refreshCart(detail: RefreshEventDetail = {}) {
  const event = new CustomEvent(REFRESH_EVENTS.CART, { detail });
  window.dispatchEvent(event);
}

export function refreshWishlist(detail: RefreshEventDetail = {}) {
  const event = new CustomEvent(REFRESH_EVENTS.WISHLIST, { detail });
  window.dispatchEvent(event);
}

export function refreshBalance(detail: RefreshEventDetail = {}) {
  const event = new CustomEvent(REFRESH_EVENTS.BALANCE, { detail });
  window.dispatchEvent(event);
}

export function refreshUser(detail: RefreshEventDetail = {}) {
  const event = new CustomEvent(REFRESH_EVENTS.USER, { detail });
  window.dispatchEvent(event);
}

// Listen for refresh events
export function onRefresh(
  eventName: string, 
  callback: (detail?: RefreshEventDetail) => void
): () => void {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<RefreshEventDetail>;
    callback(customEvent.detail);
  };
  
  window.addEventListener(eventName, handler);
  
  // Return cleanup function
  return () => {
    window.removeEventListener(eventName, handler);
  };
}
