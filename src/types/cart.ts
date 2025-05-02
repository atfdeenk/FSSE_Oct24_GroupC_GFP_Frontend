import { CartItem as ApiCartItem } from './apiResponses';

export interface CartItemWithDetails extends ApiCartItem {
  name?: string;
  image_url?: string;
  seller?: string;
  seller_city?: string;
  seller_image?: string | null;
  vendor_id?: string | number;
  unit_price: number;
  product_id: number | string;
}
