import { CartItem as ApiCartItem } from './apiResponses';

export interface CartItemWithDetails extends ApiCartItem {
  name?: string;
  image_url?: string;
  seller?: string;
  unit_price: number;
  product_id: number | string;
}
