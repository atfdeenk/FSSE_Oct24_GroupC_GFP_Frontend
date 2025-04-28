// src/utils/products.ts
import { Product } from '../types/apiResponses';

/**
 * Check if a product is in stock
 * @param product The product to check
 * @param minQuantity Minimum quantity required to be considered in stock (default: 1)
 * @returns Boolean indicating if the product is in stock
 */
export const isProductInStock = (product: Product | undefined, minQuantity: number = 1): boolean => {
  if (!product) return false;
  return product.stock_quantity >= minQuantity;
};

/**
 * Type guard to check if an object has the inStock property
 * @param item The object to check
 * @returns Type predicate indicating if the object has the inStock property
 */
export const hasInStockProperty = <T extends object>(item: T): item is T & { inStock: boolean } => {
  return 'inStock' in item;
};

/**
 * Filter an array of items to only include those that are in stock
 * @param items Array of items that may have inStock property
 * @returns Array of items that have inStock property and are in stock
 */
export const filterInStockItems = <T extends object>(items: T[]): (T & { inStock: boolean })[] => {
  return items
    .filter(hasInStockProperty)
    .filter(item => item.inStock);
};
