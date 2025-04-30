import { useState, useEffect } from 'react';
import { fetchCartAndWishlistCounts } from '@/utils/fetchCounts';

export function useCartAndWishlistCounts(isLoggedIn: boolean) {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) {
      setCartCount(0);
      setWishlistCount(0);
      return;
    }
    fetchCartAndWishlistCounts(isLoggedIn).then(({ cartCount, wishlistCount }) => {
      setCartCount(cartCount);
      setWishlistCount(wishlistCount);
    });
  }, [isLoggedIn]);

  return { cartCount, wishlistCount };
}
