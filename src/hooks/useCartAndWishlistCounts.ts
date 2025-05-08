import { useState, useEffect, useCallback } from 'react';
import { fetchCartAndWishlistCounts } from '@/utils/fetchCounts';
import { REFRESH_EVENTS, onRefresh } from '@/lib/dataRefresh';
import { getCurrentUser } from '@/lib/auth';

export function useCartAndWishlistCounts(isLoggedIn: boolean) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isCustomer, setIsCustomer] = useState(true); // Default to true for non-logged in users
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Check user role on mount
  useEffect(() => {
    const checkUserRole = async () => {
      if (isLoggedIn) {
        try {
          const user = await getCurrentUser();
          setUserRole(user?.role || null);
          // Only customers should fetch cart/wishlist data
          setIsCustomer(user?.role === 'customer');
        } catch (error) {
          console.error('Error fetching user role:', error);
          setIsCustomer(true); // Default to showing cart functionality if role check fails
        }
      } else {
        setUserRole(null);
        setIsCustomer(true); // Non-logged in users should see cart functionality
      }
    };
    
    checkUserRole();
  }, [isLoggedIn]);

  // Function to fetch counts that can be reused
  const fetchCounts = useCallback(async () => {
    if (!isLoggedIn || !isCustomer) {
      setCartCount(0);
      setWishlistCount(0);
      return;
    }
    
    try {
      const { cartCount, wishlistCount } = await fetchCartAndWishlistCounts(isLoggedIn);
      setCartCount(cartCount);
      setWishlistCount(wishlistCount);
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  }, [isLoggedIn, isCustomer]);

  // Initial fetch on mount or when login status changes
  useEffect(() => {
    fetchCounts();
  }, [isLoggedIn, fetchCounts]);

  // Listen for cart refresh events
  useEffect(() => {
    if (!isLoggedIn) return;
    
    // Set up event listeners for cart and wishlist changes
    const cartCleanup = onRefresh(REFRESH_EVENTS.CART, () => {
      console.log('Cart refresh event detected, updating count');
      fetchCounts();
    });
    
    const wishlistCleanup = onRefresh(REFRESH_EVENTS.WISHLIST, () => {
      console.log('Wishlist refresh event detected, updating count');
      fetchCounts();
    });
    
    // Also listen for profile refresh events as they might affect the cart/wishlist
    const profileCleanup = onRefresh(REFRESH_EVENTS.PROFILE, () => {
      console.log('Profile refresh event detected, updating counts');
      fetchCounts();
    });
    
    return () => {
      cartCleanup();
      wishlistCleanup();
      profileCleanup();
    };
  }, [isLoggedIn, fetchCounts]);

  return { cartCount, wishlistCount, refreshCounts: fetchCounts };
}
