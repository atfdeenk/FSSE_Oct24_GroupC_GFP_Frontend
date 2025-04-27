// src/utils/formatting/currency.ts
// Currency formatting utilities

/**
 * Format a number as Indonesian Rupiah
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatRupiah(
  amount: number, 
  options: { 
    minimumFractionDigits?: number; 
    maximumFractionDigits?: number;
    compact?: boolean;
  } = {}
): string {
  const { 
    minimumFractionDigits = 0, 
    maximumFractionDigits = 0,
    compact = false
  } = options;

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits,
    maximumFractionDigits,
    notation: compact ? 'compact' : 'standard',
  }).format(amount);
}

/**
 * Parse a currency string to a number
 * @param currencyString - The currency string to parse
 * @returns Parsed number or null if invalid
 */
export function parseCurrency(currencyString: string): number | null {
  if (!currencyString) return null;
  
  // Remove currency symbol, dots, and replace comma with dot
  const normalized = currencyString
    .replace(/[^\d,.-]/g, '')  // Remove non-numeric chars except comma, dot, and minus
    .replace(/\./g, '')        // Remove dots (thousand separators in ID format)
    .replace(/,/g, '.');       // Replace comma with dot for decimal

  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Format a discount percentage
 * @param percentage - The percentage value (0-100)
 * @returns Formatted percentage string
 */
export function formatDiscount(percentage: number): string {
  if (percentage <= 0) return '';
  return `-${percentage}%`;
}
