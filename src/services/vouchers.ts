/**
 * Client-side voucher management service
 * 
 * Since there's no dedicated endpoint for vouchers, this service
 * manages vouchers locally using localStorage and applies discounts
 * to products from specific vendors.
 */

import { Product } from '@/types';

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

// Storage key for vouchers
const VOUCHERS_STORAGE_KEY = 'bumibrew_vouchers';

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

export default {
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
  generateVoucherCode
};
