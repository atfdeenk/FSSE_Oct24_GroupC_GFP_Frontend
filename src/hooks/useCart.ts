import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCartWithDetails } from '@/services/cartLogic';
import cartService from '@/services/api/cart';
import { CartItemWithDetails } from '@/types/cart';
import { isAuthenticated } from '@/lib/auth';

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

  const updateQuantity = useCallback(async (id: number | string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      setLoading(true);
      await cartService.updateCartItem(id, { quantity: newQuantity });
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err) {
      setError(`Error updating quantity for item ${id}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (id: number | string) => {
    try {
      setLoading(true);
      await cartService.removeFromCart(id);
      setCartItems(prevItems => prevItems.filter(item => item.id !== id));
      setSelectedItems(prevSelected => {
        const newSelected = new Set(prevSelected);
        newSelected.delete(id);
        return newSelected;
      });
    } catch (err) {
      setError(`Error removing item ${id} from cart`);
    } finally {
      setLoading(false);
    }
  }, []);

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
    toggleSelectItem,
    selectAllItems,
    clearAllSelections,
  };
}
