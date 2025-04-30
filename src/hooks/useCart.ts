"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCartWithDetails } from '@/services/cartLogic';
import cartService from '@/services/api/cart';
import { CartItemWithDetails } from '@/types/cart';
import { isAuthenticated } from '@/lib/auth';
import { useToast } from '@/context/ToastContext';

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

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

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

  const { showToast, closeToast } = useToast();

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
      try {
        const productDetails = await (await import('@/services/api/products')).default.getProduct(itemData.product_id);
        productName = productDetails?.name || '';
      } catch (e) {
        productName = '';
      }

      // Get after-cart info
      const afterCart = await cartService.getCart();
      const afterItems = Array.isArray(afterCart.data?.items) ? afterCart.data.items : [];

      if (!areCartItemsIdentical(beforeItems, afterItems)) {
        showToast({
          message: `Added ${itemData.quantity}x${productName ? ` ${productName}` : ''} to cart!`,
          type: 'success',
        });
        fetchCart(); // refresh cart state
      } else {
        showToast({
          message: response.error || `Failed to add${productName ? ` ${productName}` : ''} to cart (cart unchanged)`,
          type: 'error',
        });
      }
    } catch (err: any) {
      showToast({
        message: err?.message || 'Failed to add to cart',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const updateQuantity = useCallback(async (id: number | string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      setLoading(true);
      await cartService.updateCartItem(id, { quantity: newQuantity });
      let updatedItem = cartItems.find(item => item.id === id);
      let productName = updatedItem?.name || '';
      // Fallback: fetch product details if not found in state
      if (!productName) {
        try {
          const productDetails = await (await import('@/services/api/products')).default.getProduct(id);
          productName = productDetails?.name || '';
        } catch {}
      }
      let mapped: CartItemWithDetails[] = [];
      setCartItems(prevItems => {
        mapped = prevItems.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        );
        return mapped;
      });
      showToast({
        message: `Updated${productName ? ` ${productName}` : ' item'} to ${newQuantity} pcs`,
        type: 'success',
      });
    } catch (err) {
      setError(`Error updating quantity for item ${id}`);
      showToast({
        message: `Error updating quantity for item ${id}`,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [cartItems]);

  const removeItem = useCallback(async (id: number | string) => {
    try {
      setLoading(true);
      // Get item details before removing
      let itemToRemove = cartItems.find(item => item.id === id);
      let productName = itemToRemove?.name || '';
      let quantity = itemToRemove?.quantity || '';
      // Fallback: fetch product details if not found in state
      if (!productName) {
        try {
          const productDetails = await (await import('@/services/api/products')).default.getProduct(id);
          productName = productDetails?.name || '';
        } catch {}
      }
      await cartService.removeFromCart(id);
      setCartItems(prevItems => prevItems.filter(item => item.id !== id));
      setSelectedItems(prevSelected => {
        const newSelected = new Set(prevSelected);
        newSelected.delete(id);
        return newSelected;
      });
      showToast({
        message: `Removed${productName ? ` ${productName}` : ' item'}${quantity ? ` (${quantity} pcs)` : ''} from cart`,
        type: 'success',
      });
    } catch (err) {
      setError(`Error removing item ${id} from cart`);
      showToast({
        message: `Error removing item ${id} from cart`,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [cartItems]);

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
