import cartService from "@/services/api/cart";
import wishlistService from "@/services/api/wishlist";

/**
 * Fetches the cart and wishlist item counts in parallel.
 * Returns { cartCount, wishlistCount } with 0 as fallback on error.
 */
export async function fetchCartAndWishlistCounts(isLoggedIn: boolean): Promise<{ cartCount: number; wishlistCount: number }> {
  if (!isLoggedIn) {
    return { cartCount: 0, wishlistCount: 0 };
  }
  try {
    const [cartResponse, wishlistResponse] = await Promise.all([
      cartService.getCart(),
      wishlistService.getWishlist(),
    ]);
    return {
      cartCount: cartResponse?.data?.items?.length || 0,
      wishlistCount: wishlistResponse?.data?.items?.length || 0,
    };
  } catch (error: any) {
    // Improved error logging
    if (error.response) {
      console.error("Error fetching cart/wishlist counts:", {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    return { cartCount: 0, wishlistCount: 0 };
  }
}