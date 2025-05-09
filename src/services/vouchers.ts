/**
 * Client-side voucher management service
 * 
 * Since there's no dedicated endpoint for vouchers, this service
 * manages vouchers locally using localStorage and applies discounts
 * to products from specific vendors.
 * 
 * Supports applying multiple vouchers from different sellers simultaneously.
 * 
 * IMPROVED VERSION: Fixed issues with voucher removal and price reset
 */

import { Product } from '@/types';
import { toast } from 'react-hot-toast';

// Voucher types
export interface Voucher {
  id: string;
  code: string;
  vendorId: number | string;
  discountPercentage: number;
  maxDiscount?: number;
  minPurchase?: number;
  productIds?: number[]; // Specific product IDs this voucher applies to
  expiryDate: Date;
  isActive: boolean;
  description?: string;
  createdAt: Date;
}

// Storage keys for vouchers
const VOUCHERS_STORAGE_KEY = 'bumibrew_vouchers';
const APPLIED_VOUCHERS_KEY = 'bumibrew_applied_vouchers';
const VOUCHER_DISCOUNT_KEY = 'voucherDiscount';
const USE_SELLER_VOUCHERS_KEY = 'useSellerVouchers';
const VOUCHER_DISCOUNT_DETAILS_KEY = 'voucherDiscountDetails';

// Get all vouchers from localStorage
export const getAllVouchers = (): Voucher[] => {
  try {
    const vouchersJson = localStorage.getItem(VOUCHERS_STORAGE_KEY);
    if (!vouchersJson) return [];
    
    const vouchers = JSON.parse(vouchersJson);
    
    // Convert string dates back to Date objects
    return vouchers.map((v: any) => ({
      ...v,
      expiryDate: new Date(v.expiryDate),
      createdAt: new Date(v.createdAt || Date.now())
    }));
  } catch (error) {
    console.error('Error getting vouchers:', error);
    return [];
  }
};

// Get vouchers for a specific vendor
export const getVendorVouchers = (vendorId: number | string): Voucher[] => {
  const allVouchers = getAllVouchers();
  const numericVendorId = typeof vendorId === 'string' ? parseInt(vendorId) : vendorId;
  
  return allVouchers.filter(voucher => {
    const voucherVendorId = typeof voucher.vendorId === 'string' ? 
      parseInt(voucher.vendorId) : voucher.vendorId;
    return voucherVendorId === numericVendorId;
  });
};

// Create a new voucher
export const createVoucher = (voucher: Omit<Voucher, 'id' | 'createdAt'>): Voucher => {
  const allVouchers = getAllVouchers();
  
  // Generate a unique ID
  const newVoucher: Voucher = {
    ...voucher,
    id: `voucher_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date()
  };
  
  // Save to localStorage
  localStorage.setItem(VOUCHERS_STORAGE_KEY, JSON.stringify([...allVouchers, newVoucher]));
  
  return newVoucher;
};

// Update an existing voucher
export const updateVoucher = (id: string, updates: Partial<Omit<Voucher, 'id' | 'createdAt'>>): Voucher | null => {
  const allVouchers = getAllVouchers();
  const voucherIndex = allVouchers.findIndex(v => v.id === id);
  
  if (voucherIndex === -1) return null;
  
  // Update the voucher
  const updatedVoucher = {
    ...allVouchers[voucherIndex],
    ...updates
  };
  
  allVouchers[voucherIndex] = updatedVoucher;
  
  // Save to localStorage
  localStorage.setItem(VOUCHERS_STORAGE_KEY, JSON.stringify(allVouchers));
  
  return updatedVoucher;
};

// Delete a voucher
export const deleteVoucher = (id: string): boolean => {
  const allVouchers = getAllVouchers();
  const filteredVouchers = allVouchers.filter(v => v.id !== id);
  
  if (filteredVouchers.length === allVouchers.length) {
    return false; // Voucher not found
  }
  
  // Save to localStorage
  localStorage.setItem(VOUCHERS_STORAGE_KEY, JSON.stringify(filteredVouchers));
  
  return true;
};

// Get a voucher by its code
export const getVoucherByCode = (code: string): Voucher | null => {
  const allVouchers = getAllVouchers();
  const voucher = allVouchers.find(v => 
    v.code.toLowerCase() === code.toLowerCase()
  );
  
  return voucher || null;
};

// Check if a voucher is valid
export const isVoucherValid = (voucher: Voucher | string): boolean => {
  if (typeof voucher === 'string') {
    const foundVoucher = getVoucherByCode(voucher);
    if (!foundVoucher) return false;
    voucher = foundVoucher;
  }
  
  return voucher.isActive && new Date(voucher.expiryDate) > new Date();
};

// Apply voucher discount to products
export const applyVoucherToProducts = (
  products: Product[], 
  voucherCode: string
): Product[] => {
  const voucher = getVoucherByCode(voucherCode);
  if (!voucher || !isVoucherValid(voucher)) return products;
  
  return products.map(product => {
    // Only apply to products from the voucher's vendor
    const productVendorId = typeof product.vendor_id === 'string' ? 
      parseInt(product.vendor_id) : product.vendor_id;
    
    const voucherVendorId = typeof voucher.vendorId === 'string' ? 
      parseInt(voucher.vendorId) : voucher.vendorId;
    
    // Check if this product is eligible for the voucher
    const isEligibleVendor = productVendorId === voucherVendorId;
    
    // If voucher has specific product IDs, check if this product is included
    const isEligibleProduct = !voucher.productIds || 
      voucher.productIds.includes(typeof product.id === 'string' ? parseInt(product.id) : product.id);
    
    if (isEligibleVendor && isEligibleProduct) {
      // Calculate discount
      let discountAmount = (product.price * voucher.discountPercentage) / 100;
      
      // Apply max discount cap if specified
      if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
        discountAmount = voucher.maxDiscount;
      }
      
      // Return product with updated discount_percentage
      return {
        ...product,
        discount_percentage: voucher.discountPercentage
      };
    }
    
    return product;
  });
};

// Get active vouchers for a specific product
export const getVouchersForProduct = (
  productId: number | string, 
  vendorId: number | string
): Voucher[] => {
  const allVouchers = getAllVouchers();
  const numericProductId = typeof productId === 'string' ? parseInt(productId) : productId;
  const numericVendorId = typeof vendorId === 'string' ? parseInt(vendorId) : vendorId;
  
  return allVouchers.filter(voucher => {
    const voucherVendorId = typeof voucher.vendorId === 'string' ? 
      parseInt(voucher.vendorId) : voucher.vendorId;
      
    // Check if voucher is active and not expired
    const isActive = voucher.isActive && new Date(voucher.expiryDate) > new Date();
    
    // Check if voucher is for this vendor
    const isVendorMatch = voucherVendorId === numericVendorId;
    
    // Check if voucher applies to this product (either no specific products or includes this product)
    const isProductMatch = !voucher.productIds || 
      voucher.productIds.includes(numericProductId);
    
    return isActive && isVendorMatch && isProductMatch;
  });
};

// Apply a voucher to a specific product
export const applyVoucherToProduct = (
  product: Product,
  voucherId: string
): Product => {
  const allVouchers = getAllVouchers();
  const voucher = allVouchers.find(v => v.id === voucherId);
  
  if (!voucher) return product;
  
  // Check if product is eligible for this voucher
  const productVendorId = typeof product.vendor_id === 'string' ? 
    parseInt(product.vendor_id) : product.vendor_id;
  
  const voucherVendorId = typeof voucher.vendorId === 'string' ? 
    parseInt(voucher.vendorId) : voucher.vendorId;
  
  const productId = typeof product.id === 'string' ? parseInt(product.id) : product.id;
  
  const isEligibleVendor = productVendorId === voucherVendorId;
  const isEligibleProduct = !voucher.productIds || voucher.productIds.includes(productId);
  
  if (isEligibleVendor && isEligibleProduct) {
    return {
      ...product,
      discount_percentage: voucher.discountPercentage
    };
  }
  
  return product;
};

// Generate a unique voucher code
export const generateVoucherCode = (prefix = 'BUMI'): string => {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${randomPart}`;
};

// Get all currently applied vouchers
export const getAppliedVouchers = (): {[vendorId: string]: string} => {
  try {
    const appliedVouchersJson = localStorage.getItem(APPLIED_VOUCHERS_KEY);
    if (!appliedVouchersJson) return {};
    
    return JSON.parse(appliedVouchersJson);
  } catch (error) {
    console.error('Error getting applied vouchers:', error);
    return {};
  }
};

// Apply a voucher for a specific vendor
export const applyVoucherForVendor = (vendorId: string | number, voucherCode: string): boolean => {
  const voucher = getVoucherByCode(voucherCode);
  if (!voucher || !isVoucherValid(voucher)) return false;
  
  // Check if this voucher belongs to the specified vendor
  const voucherVendorId = typeof voucher.vendorId === 'string' ? 
    voucher.vendorId : voucher.vendorId.toString();
  const normalizedVendorId = typeof vendorId === 'string' ? 
    vendorId : vendorId.toString();
    
  if (voucherVendorId !== normalizedVendorId) return false;
  
  // Get current applied vouchers
  const appliedVouchers = getAppliedVouchers();
  
  // Add or update the voucher for this vendor
  appliedVouchers[normalizedVendorId] = voucher.id;
  
  // Save to localStorage
  localStorage.setItem(APPLIED_VOUCHERS_KEY, JSON.stringify(appliedVouchers));
  
  // Calculate the discount for this voucher and store it
  // This helps ensure the discount persists across page refreshes
  const allItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
  const vendorItems = allItems.filter((item: any) => {
    const itemVendorId = typeof item.vendor_id === 'string' ? 
      item.vendor_id : item.vendor_id?.toString();
    return itemVendorId === normalizedVendorId;
  });
  
  // Calculate applicable subtotal for this vendor
  let applicableSubtotal = 0;
  vendorItems.forEach((item: any) => {
    // Check if product-specific voucher applies to this item
    if (voucher.productIds && voucher.productIds.length > 0) {
      const productId = typeof item.product_id === 'string' ? 
        parseInt(item.product_id) : (item.product_id || item.id);
      
      if (!voucher.productIds.includes(productId)) return;
    }
    
    // Add to applicable subtotal
    const price = item.price || 0;
    const quantity = item.quantity || 1;
    applicableSubtotal += price * quantity;
  });
  
  // Calculate discount
  let discountAmount = Math.round(applicableSubtotal * (voucher.discountPercentage / 100));
  
  // Apply max discount cap if set
  if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
    discountAmount = voucher.maxDiscount;
  }
  
  // Store the discount amount
  const currentDiscount = parseInt(localStorage.getItem('voucherDiscount') || '0');
  const newTotalDiscount = currentDiscount + discountAmount;
  localStorage.setItem('voucherDiscount', newTotalDiscount.toString());
  localStorage.setItem('useSellerVouchers', 'true');
  
  console.log('Applied voucher with discount calculation:', {
    vendorId: normalizedVendorId,
    voucherCode,
    applicableSubtotal,
    discountPercentage: voucher.discountPercentage,
    discountAmount,
    totalDiscount: newTotalDiscount
  });
  
  return true;
};

// Remove a voucher for a specific vendor
export const removeVoucherForVendor = (vendorId: string | number): boolean => {
  try {
    const appliedVouchers = getAppliedVouchers();
    
    // Check if there's a voucher applied for this vendor
    if (!appliedVouchers[vendorId]) {
      return false;
    }
    
    // Get the voucher that's being removed for logging
    const voucherId = appliedVouchers[vendorId];
    const allVouchers = getAllVouchers();
    const voucher = allVouchers.find(v => v.id === voucherId);
    
    // Remove the voucher
    delete appliedVouchers[vendorId];
    
    // Save to localStorage
    localStorage.setItem(APPLIED_VOUCHERS_KEY, JSON.stringify(appliedVouchers));
    
    // Reset discount calculations if this was the last voucher
    if (Object.keys(appliedVouchers).length === 0) {
      resetVoucherDiscounts();
    } else {
      // Recalculate discounts with remaining vouchers
      try {
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        calculateTotalVoucherDiscount(cartItems);
      } catch (e) {
        console.error('Error recalculating voucher discounts:', e);
        resetVoucherDiscounts();
      }
    }
    
    // Notify about voucher removal
    if (voucher) {
      toast.success(`Removed ${voucher.code} voucher`);
    } else {
      toast.success('Removed voucher');
    }
    
    // Dispatch event to notify components that vouchers have changed
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vouchersChanged'));
    }
    
    return true;
  } catch (error) {
    console.error('Error removing voucher:', error);
    resetVoucherDiscounts(); // Safety reset on error
    return false;
  }
};

// Reset all voucher discount data in localStorage
export const resetVoucherDiscounts = (): void => {
  localStorage.removeItem(VOUCHER_DISCOUNT_KEY);
  localStorage.removeItem(USE_SELLER_VOUCHERS_KEY);
  localStorage.removeItem(VOUCHER_DISCOUNT_DETAILS_KEY);
  
  // Dispatch event to notify components that voucher discounts have been reset
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('voucherDiscountCalculated', {
      detail: { amount: 0, details: {} }
    }));
  }
};

// Clear all applied vouchers
export const clearAppliedVouchers = (): void => {
  localStorage.removeItem(APPLIED_VOUCHERS_KEY);
};

// Apply all vouchers to cart items
export const applyAllVouchersToCartItems = (cartItems: any[]): any[] => {
  const appliedVouchers = getAppliedVouchers();
  const allVouchers = getAllVouchers();
  
  // If no applied vouchers, return original items
  if (Object.keys(appliedVouchers).length === 0) return cartItems;
  
  // Group cart items by vendor
  const itemsByVendor: {[vendorId: string]: any[]} = {};
  
  cartItems.forEach(item => {
    const vendorId = typeof item.vendor_id === 'string' ? 
      item.vendor_id : item.vendor_id?.toString();
    
    if (!vendorId) return;
    
    if (!itemsByVendor[vendorId]) {
      itemsByVendor[vendorId] = [];
    }
    
    itemsByVendor[vendorId].push(item);
  });
  
  console.log('Applying vouchers to cart items:', {
    appliedVouchers,
    itemsByVendor
  });
  
  // Apply vouchers to each vendor's items
  return cartItems.map(item => {
    const vendorId = typeof item.vendor_id === 'string' ? 
      item.vendor_id : item.vendor_id?.toString();
    
    if (!vendorId || !appliedVouchers[vendorId]) return item;
    
    const voucherId = appliedVouchers[vendorId];
    const voucher = allVouchers.find(v => v.id === voucherId);
    
    if (!voucher || !isVoucherValid(voucher)) return item;
    
    // Check if product-specific voucher applies to this item
    if (voucher.productIds && voucher.productIds.length > 0) {
      const productId = typeof item.product_id === 'string' ? 
        parseInt(item.product_id) : (item.product_id || item.id);
      
      if (!voucher.productIds.includes(productId)) return item;
    }
    
    // Calculate the item price with discount
    const price = item.price || item.unit_price || 0;
    const quantity = item.quantity || 1;
    const discountPercentage = voucher.discountPercentage;
    const discountAmount = Math.round(price * (discountPercentage / 100)) * quantity;
    
    console.log(`Applied discount to item ${item.id}:`, {
      originalPrice: price,
      quantity,
      discountPercentage,
      discountAmount,
      finalPrice: price - Math.round(price * (discountPercentage / 100))
    });
    
    // Apply discount to item
    return {
      ...item,
      discount_percentage: discountPercentage,
      discount_amount: discountAmount,
      discounted_price: price - Math.round(price * (discountPercentage / 100))
    };
  });
};

// Calculate total discount from all applied vouchers
export const calculateTotalVoucherDiscount = (cartItems: any[]): number => {
  const appliedVouchers = getAppliedVouchers();
  const allVouchers = getAllVouchers();
  
  // If no applied vouchers, reset all voucher data and return 0
  if (Object.keys(appliedVouchers).length === 0) {
    console.log('No applied vouchers found, resetting voucher data');
    resetVoucherDiscounts();
    return 0;
  }
  
  // Group cart items by vendor
  const itemsByVendor: {[vendorId: string]: any[]} = {};
  cartItems.forEach(item => {
    const vendorId = typeof item.vendor_id === 'string' ? 
      item.vendor_id : item.vendor_id?.toString();
    if (!vendorId) return;
    if (!itemsByVendor[vendorId]) {
      itemsByVendor[vendorId] = [];
    }
    itemsByVendor[vendorId].push(item);
  });
  
  // Calculate discount for each vendor
  let totalDiscount = 0;
  let discountDetails: {[vendorId: string]: number} = {};
  
  Object.entries(itemsByVendor).forEach(([vendorId, items]) => {
    if (!appliedVouchers[vendorId]) return;
    
    const voucherId = appliedVouchers[vendorId];
    const voucher = allVouchers.find(v => v.id === voucherId);
    
    if (!voucher || !isVoucherValid(voucher)) {
      // Remove invalid vouchers automatically
      removeVoucherForVendor(vendorId);
      return;
    }
    
    // Calculate applicable subtotal for this vendor
    let applicableSubtotal = 0;
    items.forEach(item => {
      // Check if product-specific voucher applies to this item
      if (voucher.productIds && voucher.productIds.length > 0) {
        const productId = typeof item.product_id === 'string' ? 
          parseInt(item.product_id) : (item.product_id || item.id);
        
        if (!voucher.productIds.includes(productId)) return;
      }
      
      // Try to get price from different possible properties
      const price = Number(item.price || 
                        (item.product && item.product.price) || 
                        item.unit_price || 0);
      const quantity = Number(item.quantity || 1);
      applicableSubtotal += price * quantity;
    });
    
    // Check minimum purchase requirement
    if (voucher.minPurchase && applicableSubtotal < voucher.minPurchase) {
      console.log(`Minimum purchase requirement not met for voucher ${voucher.code}`);
      discountDetails[vendorId] = 0;
      return;
    }
    
    // Calculate discount
    let discountAmount = Math.round(applicableSubtotal * (voucher.discountPercentage / 100));
    
    // Apply max discount cap if set
    if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
      discountAmount = voucher.maxDiscount;
    }
    
    totalDiscount += discountAmount;
    discountDetails[vendorId] = discountAmount;
  });
  
  // Store the total discount in localStorage for persistence between pages
  if (typeof window !== 'undefined') {
    localStorage.setItem(VOUCHER_DISCOUNT_KEY, totalDiscount.toString());
    localStorage.setItem(USE_SELLER_VOUCHERS_KEY, 'true');
    localStorage.setItem(VOUCHER_DISCOUNT_DETAILS_KEY, JSON.stringify(discountDetails));
    
    // Log detailed discount calculation for debugging
    console.log('Voucher discount calculation:', {
      totalDiscount,
      discountDetails,
      appliedVouchers,
      cartItemCount: cartItems.length,
      vendorCount: Object.keys(itemsByVendor).length
    });
    
    // Dispatch an event to notify that voucher discounts have been calculated
    window.dispatchEvent(new CustomEvent('voucherDiscountCalculated', {
      detail: { amount: totalDiscount, details: discountDetails }
    }));
  }
  
  return totalDiscount;
};

const voucherService = {
  getAllVouchers,
  getVendorVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  getVoucherByCode,
  isVoucherValid,
  applyVoucherToProducts,
  getVouchersForProduct,
  applyVoucherToProduct,
  generateVoucherCode,
  getAppliedVouchers,
  applyVoucherForVendor,
  removeVoucherForVendor,
  clearAppliedVouchers,
  resetVoucherDiscounts,
  applyAllVouchersToCartItems,
  calculateTotalVoucherDiscount
};

export default voucherService;
