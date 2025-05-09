/**
 * Utility functions for working with localStorage
 * Following the project's principles of clean code, centralization, and DRY
 */

// Keys used for localStorage
export const STORAGE_KEYS = {
  PROMO_CODE: 'bumibrew_promo_code',
  PROMO_DISCOUNT: 'bumibrew_promo_discount',
  CART_CALCULATIONS: 'bumibrew_cart_calculations',
  CHECKOUT_DATA: 'checkout_additional_data',
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  CART_ITEMS: 'cart_items',
  APPLIED_VOUCHERS: 'applied_vouchers',
};

/**
 * Type definition for cart calculations
 */
export interface CartCalculations {
  subtotal: number;
  discount: number;
  promoDiscount: number;
  voucherDiscount: number;
  ecoPackagingCost: number;
  carbonOffsetCost: number;
  total: number;
  timestamp: number;
}

/**
 * Save cart calculations to localStorage
 */
export const saveCartCalculations = (calculations: Omit<CartCalculations, 'timestamp'>) => {
  try {
    const data: CartCalculations = {
      ...calculations,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.CART_CALCULATIONS, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving cart calculations to localStorage:', error);
    return false;
  }
};

/**
 * Get cart calculations from localStorage
 */
export const getCartCalculations = (): CartCalculations | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CART_CALCULATIONS);
    if (!data) return null;
    return JSON.parse(data) as CartCalculations;
  } catch (error) {
    console.error('Error getting cart calculations from localStorage:', error);
    return null;
  }
};

/**
 * Save promo code to localStorage
 */
export const savePromoCode = (code: string) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROMO_CODE, code);
    return true;
  } catch (error) {
    console.error('Error saving promo code to localStorage:', error);
    return false;
  }
};

/**
 * Get promo code from localStorage
 */
export const getPromoCode = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEYS.PROMO_CODE) || '';
  } catch (error) {
    console.error('Error getting promo code from localStorage:', error);
    return '';
  }
};

/**
 * Save promo discount to localStorage
 */
export const savePromoDiscount = (discount: number) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROMO_DISCOUNT, discount.toString());
    return true;
  } catch (error) {
    console.error('Error saving promo discount to localStorage:', error);
    return false;
  }
};

/**
 * Get promo discount from localStorage
 */
export const getPromoDiscount = (): number => {
  try {
    const discount = localStorage.getItem(STORAGE_KEYS.PROMO_DISCOUNT);
    return discount ? parseFloat(discount) : 0;
  } catch (error) {
    console.error('Error getting promo discount from localStorage:', error);
    return 0;
  }
};

/**
 * Clear all cart and checkout related data from localStorage
 */
export const clearCartAndCheckoutData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.PROMO_CODE);
    localStorage.removeItem(STORAGE_KEYS.PROMO_DISCOUNT);
    localStorage.removeItem(STORAGE_KEYS.CART_CALCULATIONS);
    localStorage.removeItem(STORAGE_KEYS.CHECKOUT_DATA);
    localStorage.removeItem(STORAGE_KEYS.APPLIED_VOUCHERS);
    return true;
  } catch (error) {
    console.error('Error clearing cart and checkout data from localStorage:', error);
    return false;
  }
};
