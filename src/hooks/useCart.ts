"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCartWithDetails } from '@/services/cartLogic';
import cartService from '@/services/api/cart';
import { CartItemWithDetails } from '@/types/cart';
import { isAuthenticated } from '@/lib/auth';
import { showSuccess, showError } from '@/utils/toast';
import { REFRESH_EVENTS, onRefresh, RefreshEventDetail } from '@/lib/dataRefresh';

// Flag to prevent duplicate toasts
let isRefreshingFromApi = false;

export function useCart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      if (!isAuthenticated()) {
        router.push('/login?redirect=cart');
        return;
      }
      const cartResponse = await cartService.getCart();
      const itemsWithDetails = await fetchCartWithDetails();
      setCartItems(itemsWithDetails);
      setSelectedItems(new Set(itemsWithDetails.map(item => item.id)));
    } catch (err) {
      setError('Failed to fetch cart');
      setCartItems([]);
      setSelectedItems(new Set());
    } finally {
      setLoading(false);
    }
  }, [router]);
  
  // Function to handle refresh events from the API
  const handleApiRefresh = useCallback((detail: RefreshEventDetail = {}) => {
    console.log('Cart refresh event detected in useCart hook, refreshing cart data', detail);
    
    // Set the refreshing flag based on the showToast flag in the event detail
    // If showToast is false or not specified, we're refreshing from API and should suppress toasts
    isRefreshingFromApi = detail.showToast === true ? false : true;
    
    fetchCart().finally(() => {
      // Reset the flag after a short delay to ensure toasts don't overlap
      setTimeout(() => {
        isRefreshingFromApi = false;
      }, 300);
    });
  }, [fetchCart]);

  useEffect(() => {
    // Initial cart fetch
    fetchCart();
    
    // Listen for cart refresh events
    const cleanup = onRefresh(REFRESH_EVENTS.CART, handleApiRefresh);
    
    return cleanup;
  }, [fetchCart, handleApiRefresh]);

  // Add to cart with count check
  // Helper: deep compare cart items (product_id and quantity)
  function areCartItemsIdentical(before: any[], after: any[]): boolean {
    if (before.length !== after.length) return false;
    const sortById = (arr: any[]) => [...arr].sort((a, b) => a.product_id - b.product_id);
    const sortedBefore = sortById(before);
    const sortedAfter = sortById(after);
    return sortedBefore.every((item, idx) =>
      item.product_id === sortedAfter[idx].product_id &&
      item.quantity === sortedAfter[idx].quantity
    );
  }

  // Using centralized toast system from @/utils/toast

  const addToCartWithCountCheck = useCallback(async (itemData: { product_id: number | string; quantity: number }) => {
    setLoading(true);
    try {
      // Get before-cart info
      const beforeCart = await cartService.getCart();
      const beforeItems = Array.isArray(beforeCart.data?.items) ? beforeCart.data.items : [];

      // Add to cart
      const response = await cartService.addToCart(itemData);

      // Get product name for toast
      let productName = '';
      let productDetails = null;
      try {
        productDetails = await (await import('@/services/api/products')).default.getProduct(itemData.product_id);
        productName = productDetails?.name || '';
      } catch (e) {
        productName = '';
      }
      // Get after-cart info
      const afterCart = await cartService.getCart();
      const afterItems = Array.isArray(afterCart.data?.items) ? afterCart.data.items : [];

      if (!areCartItemsIdentical(beforeItems, afterItems)) {
        // Toast notifications are now handled by the cart service
        
        // Update cart items locally instead of fetching again
        // Find the newly added item or the updated item
        const newItem = afterItems.find((item: any) => 
          !beforeItems.some((beforeItem: any) => beforeItem.id === item.id)
        );
        
        if (newItem && productDetails) {
          // If it's a new item and we have product details, add it to the local state
          setCartItems(prevItems => [
            ...prevItems,
            {
              ...newItem,
              name: productDetails.name,
              price: productDetails.price,
              image_url: productDetails.image_url,
              currency: productDetails.currency,
              vendor_id: productDetails.vendor_id,
              product: productDetails
            }
          ]);
          
          // Add to selected items
          setSelectedItems(prev => {
            const newSet = new Set(prev);
            newSet.add(newItem.id);
            return newSet;
          });
        } else {
          // If we couldn't find the new item or don't have product details, fall back to fetching
          fetchCart();
        }
      } else {
        // Error toast is now handled by the cart service
        setError(response.error || `Failed to add${productName ? ` ${productName}` : ''} to cart (cart unchanged)`);
      }
    } catch (err: any) {
      // Error toast is now handled by the cart service
      setError(err?.message || 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const updateQuantity = useCallback(async (id: number | string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      // Optimistic UI update - update the UI immediately before API call completes
      let updatedItem = cartItems.find(item => item.id === id);
      let productName = updatedItem?.name || '';
      
      // Update the cart items state immediately
      setCartItems(prevItems => {
        return prevItems.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        );
      });
      
      // Make the API call in the background
      const response = await cartService.updateCartItem(id, { quantity: newQuantity });
      
      // Toast notifications are now handled by the cart service
      // No need to show toasts here
      
      // If the API call failed, revert to the original state
      if (!response.success) {
        setError(`Error updating quantity for item ${id}`);
        // Error toast is now handled by the cart service
        fetchCart(); // Revert to server state
      }
    } catch (err) {
      setError(`Error updating quantity for item ${id}`);
      // Error toast is now handled by the cart service
      fetchCart(); // Revert to server state
    } finally {
      setLoading(false);
    }
  }, [cartItems, fetchCart]);

  const removeItem = useCallback(async (id: number | string) => {
    try {
      // Get item details before removing
      let itemToRemove = cartItems.find(item => item.id === id);
      let productName = itemToRemove?.name || '';
      let quantity = itemToRemove?.quantity || '';
      
      // Store the original items in case we need to revert
      const originalItems = [...cartItems];
      const originalSelected = new Set(selectedItems);
      
      // Optimistic UI update - update the UI immediately before API call completes
      setCartItems(prevItems => prevItems.filter(item => item.id !== id));
      setSelectedItems(prevSelected => {
        const newSelected = new Set(prevSelected);
        newSelected.delete(id);
        return newSelected;
      });
      
      // Make the API call in the background
      const response = await cartService.removeFromCart(id);
      
      // Toast notifications are now handled by the cart service
      // No need to show toasts here
      
      // If the API call failed, revert to the original state
      if (!response.success) {
        setError(`Error removing item ${id} from cart`);
        // Error toast is now handled by the cart service
        setCartItems(originalItems);
        setSelectedItems(originalSelected);
      }
    } catch (err) {
      setError(`Error removing item ${id} from cart`);
      // Error toast is now handled by the cart service
      fetchCart(); // Revert to server state
    } finally {
      setLoading(false);
    }
  }, [cartItems, selectedItems]);

  // Selection logic
  const toggleSelectItem = useCallback((id: string | number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAllItems = useCallback(() => {
    setSelectedItems(new Set(cartItems.map(item => item.id)));
  }, [cartItems]);

  const clearAllSelections = useCallback(() => {
    setSelectedItems(new Set());
  }, []);



  return {
    cartItems,
    setCartItems,
    selectedItems,
    setSelectedItems,
    loading,
    error,
    fetchCart,
    updateQuantity,
    removeItem,
    addToCartWithCountCheck,
    toggleSelectItem,
    selectAllItems,
    clearAllSelections,

  };
}
