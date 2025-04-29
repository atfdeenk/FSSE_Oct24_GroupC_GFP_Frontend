import cartService from '@/services/api/cart';
import productService from '@/services/api/products';
import { isProductInStock } from '@/utils/products';
import { CartItem as ApiCartItem } from '@/types/apiResponses';

export interface CartItemWithDetails extends ApiCartItem {
  name?: string;
  image_url?: string;
  seller?: string;
  unit_price: number;
  product_id: number | string;
  inStock?: boolean;
}

/**
 * Fetches the cart and enriches each item with product details.
 */
export async function fetchCartWithDetails() {
  const cartResponse = await cartService.getCart();
  if (!cartResponse?.data?.items?.length) {
    return [];
  }
  const itemsWithDetails = await Promise.all(
    cartResponse.data.items.map(async (item) => {
      try {
        const product = await productService.getProduct(item.product_id);
        return {
          ...item,
          name: product?.name || 'Product not found',
          image_url: product?.image_url || '',
          seller: `Vendor ID: ${product?.vendor_id || 'Unknown'}`,
          unit_price: product?.price || 0,
          product_id: item.product_id,
          inStock: isProductInStock(product)
        };
      } catch (error) {
        return {
          ...item,
          name: 'Product not found',
          image_url: '',
          seller: 'Unknown vendor',
          unit_price: 0,
          product_id: item.product_id
        };
      }
    })
  );
  return itemsWithDetails;
}
