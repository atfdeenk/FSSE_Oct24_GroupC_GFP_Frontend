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
