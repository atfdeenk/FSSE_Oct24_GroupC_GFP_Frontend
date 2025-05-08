import { roleBasedCartService as cartService } from '@/services/roleBasedServices';
import productService from './api/products';
import usersService from './api/users';
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
    cartResponse.data.items.map(async (item: ApiCartItem) => {
      try {
        const product = await productService.getProduct(item.product_id);
        
        // Try to get the seller's name from the users API
        let sellerName = `Coffee Seller ${product?.vendor_id || 'Unknown'}`;
        if (product?.vendor_id) {
          try {
            // Try to get all users first since the API might not support getting a single user by ID
            const usersResponse = await usersService.getUsers();
            if (usersResponse.success && usersResponse.data) {
              // Find the user with the matching vendor ID
              const vendorUser = usersResponse.data.find(user => user.id === product.vendor_id);
              if (vendorUser) {
                sellerName = vendorUser.username || sellerName;
                // Store additional seller information
                return {
                  ...item,
                  name: product?.name || 'Product not found',
                  image_url: product?.image_url || '',
                  seller: sellerName,
                  seller_city: vendorUser.city,
                  seller_image: vendorUser.image_url,
                  vendor_id: product?.vendor_id,
                  unit_price: product?.price || 0,
                  product_id: item.product_id,
                  inStock: isProductInStock(product)
                };
              }
            }
          } catch (userError) {
            console.log('Could not fetch seller details:', userError);
            // Fallback to default seller name format
          }
        }
        
        return {
          ...item,
          name: product?.name || 'Product not found',
          image_url: product?.image_url || '',
          seller: sellerName,
          vendor_id: product?.vendor_id,
          unit_price: product?.price || 0,
          product_id: item.product_id,
          inStock: isProductInStock(product)
        };
      } catch (error) {
        return {
          ...item,
          name: 'Product not found',
          image_url: '',
          seller: 'Coffee Seller (Unknown)',
          vendor_id: null,
          unit_price: 0,
          product_id: item.product_id
        };
      }
    })
  );
  return itemsWithDetails;
}
