"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header, Footer } from '@/components';
import { isAuthenticated } from "@/lib/auth";
import { roleBasedWishlistService as wishlistService } from "@/services/roleBasedServices";
import { WishlistItem as WishlistItemType } from "@/services/api/wishlist";
import productService from "@/services/api/products";
import { useCart } from '@/hooks/useCart';
import { LoadingOverlay } from '@/components/ui';
import WishlistItemComponent from '@/components/ui/WishlistItem';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { getProductImageUrl, handleProductImageError } from "@/utils/imageUtils";
import { showSuccess, showError } from '@/utils/toast';
import { formatCurrency } from '@/utils/format';
import { Product } from "@/types/apiResponses";
import { isProductInStock, hasInStockProperty } from "@/utils/products";

// Extended wishlist item with product details
interface WishlistItemWithDetails extends WishlistItemType {
  id: string | number;
  product_id: string | number;
  name?: string;
  price?: number;
  image_url?: string;
  seller?: string;
  inStock?: boolean;
  category?: string;
  rating?: number;
}

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItemWithDetails[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showOrderSummary, setShowOrderSummary] = useState(true);
  const [addingToCart, setAddingToCart] = useState<Set<string | number>>(new Set());
  const [showClearWishlistModal, setShowClearWishlistModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | number | null>(null);
  const [showRemoveItemModal, setShowRemoveItemModal] = useState(false);

  const [filterBy, setFilterBy] = useState<'all' | 'inStock' | 'outOfStock'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'priceAsc' | 'priceDesc' | 'nameAsc'>('default');
  const [searchQuery, setSearchQuery] = useState('');

  const { addToCartWithCountCheck } = useCart();
  // Using centralized toast system from @/utils/toast

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const wishlistResponse = await wishlistService.getWishlist();

      if (wishlistResponse?.data?.items) {
        const wishlistItems = wishlistResponse.data.items;

        if (wishlistItems.length === 0) {
          setWishlistItems([]);
          return;
        }

        const itemsWithDetails = await Promise.all(
          wishlistItems.map(async (item) => {
            try {
              const productResponse = await productService.getProduct(item.product_id);
              if (productResponse) {
                return {
                  ...item,
                  name: productResponse.name,
                  price: productResponse.price,
                  image_url: productResponse.image_url,
                  seller: productResponse.vendor_id.toString(),
                  inStock: isProductInStock(productResponse),
                  category: productResponse.categories?.[0]?.name,
                  rating: 4.5 // Placeholder for now
                };
              }
              return item;
            } catch (error) {
              return item;
            }
          })
        );

        setWishlistItems(itemsWithDetails);

        // Select all in-stock items by default
        const inStockItemIds = new Set(
          itemsWithDetails
            .filter(hasInStockProperty)
            .filter(item => item.inStock)
            .map(item => item.id)
        );
        setSelectedItems(inStockItemIds);
      } else {
        setWishlistItems([]);
        setSelectedItems(new Set());
      }
    } catch (error) {
      setWishlistItems([]);
      showError('Failed to load your wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login?redirect=wishlist');
      return;
    }

    fetchWishlist();
  }, [router, fetchWishlist]);

  const removeItem = async (id: number | string) => {
    try {
      const itemToRemove = wishlistItems.find(item => item.id === id);
      if (!itemToRemove) return;

      // Optimistic UI update
      setWishlistItems(prev => prev.filter(item => item.id !== id));

      // Remove from selected items
      setSelectedItems(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(id);
        return newSelected;
      });

      const response = await wishlistService.removeFromWishlist(id);
      if (response.success) {
        showSuccess(`${itemToRemove.name || 'Item'} removed from wishlist`);
      } else {
        // If API call fails, revert the optimistic update
        fetchWishlist();
        showError('Failed to remove item from wishlist');
      }
    } catch (error) {
      fetchWishlist(); // Revert to server state
      showError('Failed to remove item from wishlist');
    }
  };

  // Confirm removal of an item
  const confirmRemoveItem = (id: number | string) => {
    setItemToRemove(id);
    setShowRemoveItemModal(true);
  };

  // Handle confirmed removal
  const handleConfirmedRemoval = () => {
    if (itemToRemove !== null) {
      removeItem(itemToRemove);
      setItemToRemove(null);
    }
    setShowRemoveItemModal(false);
  };

  // Clear the entire wishlist
  const clearWishlist = async () => {
    try {
      setLoading(true);

      // Store original items in case we need to revert
      const originalItems = [...wishlistItems];
      const originalSelected = new Set(selectedItems);

      // Optimistic UI update
      setWishlistItems([]);
      setSelectedItems(new Set());

      // Remove each item one by one (API doesn't have bulk delete)
      const removePromises = originalItems.map(item =>
        wishlistService.removeFromWishlist(item.id)
      );

      const results = await Promise.allSettled(removePromises);
      const allSuccessful = results.every(result => result.status === 'fulfilled');

      if (allSuccessful) {
        showSuccess('Wishlist cleared successfully');
      } else {
        // If any API call fails, revert the optimistic update
        setWishlistItems(originalItems);
        setSelectedItems(originalSelected);
        showError('Failed to clear wishlist');
      }
    } catch (error) {
      fetchWishlist(); // Revert to server state
      showError('Failed to clear wishlist');
    } finally {
      setLoading(false);
      setShowClearWishlistModal(false);
    }
  };

  const toggleSelectItem = (id: number | string) => {
    setSelectedItems(prev => {
      const newSelectedItems = new Set(prev);
      if (newSelectedItems.has(id)) {
        newSelectedItems.delete(id);
      } else {
        newSelectedItems.add(id);
      }
      return newSelectedItems;
    });
  };

  // Select all items based on current filter
  const selectAllItems = () => {
    const filteredItems = getFilteredItems();
    const itemIds = new Set(filteredItems.map(item => item.id));
    setSelectedItems(itemIds);
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedItems(new Set());
  };

  // Get filtered items based on current filter
  const getFilteredItems = useCallback(() => {
    // Filter and sort items
    const filteredItems = wishlistItems.filter(item => {
      // First apply search filter if present
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = item.name?.toLowerCase().includes(query);
        const categoryMatch = item.category?.toLowerCase().includes(query);
        if (!nameMatch && !categoryMatch) return false;
      }
      
      // Then apply stock filter
      if (filterBy === 'inStock') return item.inStock;
      if (filterBy === 'outOfStock') return !item.inStock;
      return true;
    });

    const sortedItems = [...filteredItems].sort((a, b) => {
      if (sortBy === 'priceAsc') {
        return (a.price || 0) - (b.price || 0);
      } else if (sortBy === 'priceDesc') {
        return (b.price || 0) - (a.price || 0);
      } else if (sortBy === 'nameAsc') {
        return (a.name || '').localeCompare(b.name || '');
      }
      return 0;
    });

    return sortedItems;
  }, [wishlistItems, filterBy, sortBy, searchQuery]);

  // Check if all items are selected
  const areAllItemsSelected = wishlistItems.length > 0 && selectedItems.size === wishlistItems.length;

  // Toggle order summary visibility
  const toggleOrderSummary = () => {
    setShowOrderSummary(prev => !prev);
  };

  const addToCart = async (productId: number | string) => {
    try {
      setAddingToCart(prev => new Set(prev).add(productId));
      const itemToAdd = wishlistItems.find(item => item.product_id === productId);
      if (!itemToAdd) return;
      await addToCartWithCountCheck({ product_id: productId, quantity: 1 });
      const event = new CustomEvent('cart-updated');
      window.dispatchEvent(event);
    } finally {
      setAddingToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // Using centralized formatCurrency utility from @/utils/format

  // Calculate total price of selected items
  const calculateSelectedTotal = useCallback(() => {
    return wishlistItems.reduce((total, item) => {
      if (selectedItems.has(item.id)) {
        return total + (item.price || 0);
      }
      return total;
    }, 0);
  }, [wishlistItems, selectedItems]);

  // Calculate total price of all items
  const calculateTotalValue = useCallback(() => {
    return wishlistItems.reduce((total, item) => total + (item.price || 0), 0);
  }, [wishlistItems]);

  // Add all selected items to cart
  const addSelectedToCart = async () => {
    const selectedIds = Array.from(selectedItems);
    if (selectedIds.length === 0) return;
    for (const id of selectedIds) {
      const item = wishlistItems.find(item => item.id === id);
      if (item && item.inStock) {
        await addToCart(item.product_id);
      }
    }
  };

  const selectedTotal = calculateSelectedTotal();
  const totalValue = calculateTotalValue();

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />

      <main className="flex-grow py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Your Wishlist</h1>
              <p className="text-white/60">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
                {selectedItems.size > 0 && (
                  <span className="ml-2 text-amber-400">
                    ({selectedItems.size} selected)
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
              {wishlistItems.length > 0 && (
                <button
                  onClick={() => setShowClearWishlistModal(true)}
                  className="text-red-400 hover:text-white hover:bg-red-500/20 flex items-center gap-2 transition-colors text-sm border border-red-500/30 px-4 py-2 rounded-full self-start"
                  disabled={loading}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear Wishlist
                </button>
              )}
              
              <Link 
                href="/products" 
                className="text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-colors text-sm border border-white/20 px-4 py-2 rounded-full"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>

          {loading ? (
            <LoadingOverlay message="Loading your wishlist..." />
          ) : wishlistItems.length === 0 ? (
            <div className="text-center py-16 bg-neutral-900/80 backdrop-blur-sm rounded-md border border-white/10 shadow-lg transform transition-all duration-300 hover:border-amber-500/30">
              <div className="animate-fade-in-down">
                <svg className="w-20 h-20 text-white/30 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h2 className="text-2xl font-bold text-white mb-3">Your wishlist is empty</h2>
                <p className="text-white/70 mb-8 max-w-md mx-auto">Discover our local artisan products and save your favorites for later!</p>
                <Link href="/products" className="bg-amber-500 text-black px-8 py-3 rounded-md font-medium hover:bg-amber-400 transition-all duration-300 inline-block shadow-lg hover:shadow-amber-500/20">
                  Explore Products
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6 bg-neutral-900/80 backdrop-blur-sm rounded-md border border-white/10 p-4 shadow-lg">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-medium text-white">Saved Items</h2>
                    <span className="text-white/60 text-sm">{getFilteredItems().length} of {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} shown</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Search input */}
                    <div className="relative w-full sm:w-auto">
                      <input
                        type="text"
                        placeholder="Search wishlist..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-black/30 text-white border border-white/20 rounded-full px-4 py-2 pr-10 text-sm w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Filter dropdown */}
                    <div className="relative">
                      <select
                        value={filterBy}
                        onChange={(e) => setFilterBy(e.target.value as 'all' | 'inStock' | 'outOfStock')}
                        className="bg-neutral-800 text-white border border-white/20 rounded-full px-3 py-2 pr-8 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                      >
                        <option value="all">All items</option>
                        <option value="inStock">In stock</option>
                        <option value="outOfStock">Out of stock</option>
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Sort dropdown */}
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'default' | 'priceAsc' | 'priceDesc' | 'nameAsc')}
                        className="bg-neutral-800 text-white border border-white/20 rounded-full px-3 py-2 pr-8 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                      >
                        <option value="default">Default sorting</option>
                        <option value="priceAsc">Price: Low to high</option>
                        <option value="priceDesc">Price: High to low</option>
                        <option value="nameAsc">Name: A to Z</option>
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Selection controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={selectAllItems}
                        className="text-white/70 hover:text-amber-400 transition-colors text-sm border border-white/20 px-3 py-1.5 rounded-full"
                        title="Select all items"
                      >
                        Select All
                      </button>
                      <button
                        onClick={clearAllSelections}
                        className="text-white/70 hover:text-amber-400 transition-colors text-sm border border-white/20 px-3 py-1.5 rounded-full"
                        title="Clear all selections"
                      >
                        Clear Selection
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order Summary Panel */}
                {selectedItems.size > 0 && (
                  <div className="mt-6 p-4 bg-neutral-800/50 rounded-md border border-white/10 animate-fade-in">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-white font-medium">Order Summary</h3>
                      <span className="text-white/60 text-sm">{selectedItems.size} of {wishlistItems.length} selected</span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">Selected items</span>
                        <span className="text-white">{formatCurrency(selectedTotal)}</span>
                      </div>

                      {selectedItems.size < wishlistItems.length && (
                        <div className="flex justify-between text-white/50">
                          <span>Unselected items</span>
                          <span>{formatCurrency(totalValue - selectedTotal)}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-white/10 flex justify-between">
                        <span className="text-white font-medium">Total value</span>
                        <span className="text-amber-500 font-medium">{formatCurrency(totalValue)}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      {selectedItems.size > 0 && (
                        <button
                          onClick={addSelectedToCart}
                          className="bg-amber-500 text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-amber-400 transition-all duration-300 flex items-center gap-2"
                          disabled={selectedItems.size === 0}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Add Selected to Cart
                        </button>
                      )}
                      <Link
                        href="/cart"
                        className="bg-white/10 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        View Cart
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 mt-8">
                {getFilteredItems().length > 0 ? (
                  getFilteredItems().map((item) => (
                    <WishlistItemComponent
                      key={item.id}
                      item={item}
                      selected={selectedItems.has(item.id)}
                      onSelect={toggleSelectItem}
                      onRemove={confirmRemoveItem}
                      onAddToCart={addToCart}
                      isAddingToCart={addingToCart.has(item.product_id)}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center bg-neutral-900/50 backdrop-blur-sm rounded-md border border-white/10">
                    <svg className="w-16 h-16 text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <h3 className="text-xl font-medium text-white mb-2">No items found</h3>
                    <p className="text-white/60 max-w-md mb-6">No items match your current filter criteria. Try adjusting your filters or search terms.</p>
                    <button 
                      onClick={() => {
                        setFilterBy('all');
                        setSearchQuery('');
                        setSortBy('default');
                      }}
                      className="bg-amber-500 text-black px-6 py-2.5 rounded-md font-medium hover:bg-amber-400 transition-all duration-300 inline-flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Confirmation Modal for removing item */}
      <ConfirmationModal
        isOpen={showRemoveItemModal}
        onClose={() => setShowRemoveItemModal(false)}
        onConfirm={handleConfirmedRemoval}
        title="Remove from Wishlist"
        message="Are you sure you want to remove this item from your wishlist?"
        confirmText="Remove"
        cancelText="Cancel"
        type="danger"
      />

      {/* Confirmation Modal for clearing wishlist */}
      <ConfirmationModal
        isOpen={showClearWishlistModal}
        onClose={() => setShowClearWishlistModal(false)}
        onConfirm={clearWishlist}
        title="Clear Your Wishlist"
        message="Are you sure you want to remove all items from your wishlist? This action cannot be undone."
        confirmText="Clear Wishlist"
        cancelText="Keep Items"
        type="danger"
      />
    </div>
  );
}
