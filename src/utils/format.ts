/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: 'IDR')
 * @param locale - The locale to use for formatting (default: 'id-ID')
 * @param options - Additional Intl.NumberFormat options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'IDR',
  locale: string = 'id-ID',
  options: Partial<Intl.NumberFormatOptions> = {}
) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options
  }).format(amount);
}

/**
 * Format a price with a specific product currency
 * @param price - The price to format
 * @param productCurrency - The product's currency (optional)
 * @returns Formatted price string
 */
export function formatProductPrice(price: number, productCurrency?: string) {
  return formatCurrency(price, productCurrency || 'IDR');
}

/**
 * Format a date string with consistent formatting
 * @param dateString - The date string to format
 * @param format - The format style to use: 'short', 'medium', 'long', or 'full'
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @param options - Additional Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string | Date,
  format: 'short' | 'medium' | 'long' | 'full' = 'long',
  locale: string = 'en-US',
  options: Partial<Intl.DateTimeFormatOptions> = {}
) {
  const date = dateString instanceof Date ? dateString : new Date(dateString);
  
  // Predefined format options
  const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
    short: { year: 'numeric', month: 'numeric', day: 'numeric' },
    medium: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    full: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
  };
  
  return new Intl.DateTimeFormat(locale, {
    ...formatOptions[format],
    ...options
  }).format(date);
}

/**
 * Format a date with time
 * @param dateString - The date string to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns Formatted date and time string
 */
export function formatDateTime(dateString: string | Date, locale: string = 'en-US') {
  return formatDate(dateString, 'long', locale, {
    hour: '2-digit',
    minute: '2-digit'
  });
}
