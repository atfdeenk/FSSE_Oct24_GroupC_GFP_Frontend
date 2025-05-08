// Centralized cart logic for add-to-cart UX feedback
// Returns: { success: boolean, error: string|null }
import { roleBasedCartService as cartService } from '@/services/roleBasedServices';

export async function addProductToCart(productId: number | string, quantity: number = 1): Promise<{ success: boolean; error: string | null }> {
  try {
    const { success, error } = await cartService.addToCart({ product_id: productId, quantity });
    return { success, error };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to add to cart' };
  }
}
