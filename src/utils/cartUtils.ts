import { CartItem } from '@/types';

export function calculateSubtotal(items: CartItem[] | any[]) {
  return items.reduce((sum, item) => {
    // Support both CartItem (price) and CartItemWithDetails (unit_price)
    const price = typeof item.unit_price === 'number' ? item.unit_price : (item.price || 0);
    const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
    return sum + price * quantity;
  }, 0);
}

export function calculateDiscount(subtotal: number, discountPercent: number) {
  return subtotal * (discountPercent / 100);
}

export function calculateTotal(subtotal: number, discount: number) {
  return subtotal - discount;
}
