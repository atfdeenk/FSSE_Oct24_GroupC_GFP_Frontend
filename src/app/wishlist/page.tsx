"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header, Footer, SelectionControls } from '@/components';
import { isAuthenticated } from "@/lib/auth";
import wishlistService, { WishlistItem } from "@/services/api/wishlist";
import productService from "@/services/api/products";
import { useCart } from '@/hooks/useCart';
import { LoadingOverlay } from '@/components/ui';
import { showSuccess, showError } from '@/utils/toast';
import { formatCurrency } from '@/utils/format';
import { getProductImageUrl, handleProductImageError } from "@/utils/imageUtils";
import { Product } from "@/types/apiResponses";
import { isProductInStock, hasInStockProperty } from "@/utils/products";

// Extended wishlist item with product details
interface WishlistItemWithDetails extends WishlistItem {
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

  const [filterBy, setFilterBy] = useState<'all' | 'inStock' | 'outOfStock'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'priceAsc' | 'priceDesc' | 'nameAsc'>('default');

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

      // Remove from selected items if it was selected
      if (selectedItems.has(id)) {
        const newSelectedItems = new Set(selectedItems);
        newSelectedItems.delete(id);
        setSelectedItems(newSelectedItems);
      }

      // Show success message
      showSuccess(`${itemToRemove.name || 'Item'} removed from wishlist`);

      // Call API
      await wishlistService.removeFromWishlist(id);
    } catch (error) {
      showError('Failed to remove item from wishlist');

      // Revert optimistic update on error
      fetchWishlist();
    }
  };

  // Toggle selection of an item
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
    let filtered = [...wishlistItems];

    // Apply filter
    if (filterBy === 'inStock') {
      filtered = filtered.filter(item => item.inStock);
    } else if (filterBy === 'outOfStock') {
      filtered = filtered.filter(item => !item.inStock);
    }

    // Apply sort
    if (sortBy === 'priceAsc') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'priceDesc') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'nameAsc') {
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return filtered;
  }, [wishlistItems, filterBy, sortBy]);

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

      <main className="flex-grow py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Your Wishlist</h1>
          <p className="text-white/60 mb-8">{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later</p>

          {loading ? (
            <LoadingOverlay message="Loading your wishlist..." />
          ) : wishlistItems.length === 0 ? (
            <div className="text-center py-16 bg-neutral-900/80 backdrop-blur-sm rounded-sm border border-white/10 shadow-lg transform transition-all duration-300 hover:border-amber-500/30">
              <div className="animate-fade-in-down">
                <svg className="w-20 h-20 text-white/30 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h2 className="text-2xl font-bold text-white mb-3">Your wishlist is empty</h2>
                <p className="text-white/70 mb-8 max-w-md mx-auto">Discover our local artisan products and save your favorites for later!</p>
                <Link href="/products" className="bg-amber-500 text-black px-8 py-3 rounded-sm font-medium hover:bg-amber-400 transition-all duration-300 inline-block shadow-lg hover:shadow-amber-500/20">
                  Explore Products
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6 bg-neutral-900/80 backdrop-blur-sm rounded-sm border border-white/10 p-4 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-medium text-white">Saved Items</h2>
                    <span className="text-white/60 text-sm">{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}</span>
                  </div>
                  {/* <div className="flex items-center gap-4"> */}
                  {/* update edit */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      {/* Filter dropdown */}
                      <div className="relative">
                        <select
                          value={filterBy}
                          onChange={(e) => setFilterBy(e.target.value as 'all' | 'inStock' | 'outOfStock')}
                          // className="bg-amber-500 text-white font-semibold shadow-sm border border-amber-500 rounded-md px-3 py-2 pr-8 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 hover:bg-amber-600 transition-colors"
                          // update edit //
                          className="w-36 sm:w-40 bg-amber-500 text-white font-semibold shadow-sm border border-amber-500 rounded-md px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 hover:bg-amber-600 transition-colors"
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
                          // className="bg-amber-500 text-white font-semibold shadow-sm border border-amber-500 rounded-md px-3 py-2 pr-8 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 hover:bg-amber-600 transition-colors"
                          // update edit //
                          className="w-36 sm:w-48 bg-amber-500 text-white font-semibold shadow-sm border border-amber-500 rounded-md px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 hover:bg-amber-600 transition-colors"
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
                    </div>  
                    <div className="flex items-center gap-2">
                      {/* Selection controls */}
                      <div className="flex items-center">
                        <SelectionControls
                          onSelectAll={selectAllItems}
                          onDeselectAll={clearAllSelections}
                          selectedCount={selectedItems.size}
                          totalCount={wishlistItems.length}
                          buttonOnly={true}
                        />
                      </div>

                      <button
                        onClick={toggleOrderSummary}
                        className="text-sm text-white/70 hover:text-amber-400 transition-colors flex items-center gap-1"
                      >
                        {showOrderSummary ? (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Hide Summary
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            Show Summary
                          </>
                        )}
                      </button>
                    </div>
                  </div>              
                </div>
                {/* Order Summary Panel */}
                {showOrderSummary && (
                  <div className="mt-6 p-5 bg-neutral-900/80 rounded-md border border-white/5 animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-white font-medium text-lg">Order Summary</h3>
                      <span className="text-white/60 text-sm">{selectedItems.size} of {wishlistItems.length} selected</span>
                    </div>

                    <div className="space-y-3 text-sm">
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

                      <div className="pt-3 border-t border-white/10 flex justify-between">
                        <span className="text-white font-medium">Total value</span>
                        <span className="text-amber-500 font-medium">{formatCurrency(totalValue)}</span>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col sm:flex-row gap-3">
                      {selectedItems.size > 0 && (
                        <button
                          onClick={addSelectedToCart}
                          className="bg-amber-500 text-black py-2.5 px-2 rounded-md text-sm font-medium hover:bg-amber-400 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/20 transform hover:translate-y-[-2px]"
                          disabled={selectedItems.size === 0}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Add Selected to Cart
                        </button>
                      )}
                      <button
                        onClick={() => router.push('/cart')}
                        className="bg-white/10 text-white py-2.5 px-2 rounded-md text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        View Cart
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
                {getFilteredItems().length > 0 ? (
                  getFilteredItems().map((item, index) => (
                    <div
                      key={item.id}
                      className={`group bg-neutral-900/80 backdrop-blur-sm rounded-md border overflow-hidden shadow-lg transition-all duration-300 hover:border-amber-500/20 animate-fade-in ${selectedItems.has(item.id) ? 'border-amber-500/50' : 'border-white/10'}`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="p-4">
                        <div className="flex items-center">
                          <label className="mr-4 w-5 h-5 relative flex items-center justify-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={selectedItems.has(item.id)}
                              onChange={() => toggleSelectItem(item.id)}
                            />
                            <svg className={`w-5 h-5 ${selectedItems.has(item.id) ? 'text-amber-500' : 'text-white/40'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </label>

                          <div className="w-16 h-16 bg-neutral-800 rounded-md overflow-hidden mr-4 flex-shrink-0">
                            <Link href={`/products/${item.product_id}`} className="block w-full h-full">
                              {item.image_url ? (
                                <img
                                  src={getProductImageUrl(item.image_url)}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                  onError={handleProductImageError}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-white/30">
                                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </Link>
                          </div>

                          <div className="flex-grow mr-4">
                            <Link
                              href={`/products/${item.product_id}`}
                              className="text-white font-medium hover:text-amber-400 transition-colors block mb-1"
                            >
                              {item.name || 'Product'}
                            </Link>
                            <div className="text-white/60 text-xs">{item.seller || 'Unknown vendor'}</div>
                            {item.inStock ? (
                              <div className="mt-2 text-xs text-green-400 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                In Stock
                              </div>
                            ) : (
                              <div className="mt-2 text-xs text-red-400 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Out of Stock
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col items-end space-y-2">
                            <div className="text-amber-500 font-bold">{formatCurrency(item.price || 0)}</div>

                            <div className="flex space-x-2">
                              <button
                                onClick={() => addToCart(item.product_id)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${addingToCart.has(item.product_id) ? 'bg-amber-700 text-white/70' : item.inStock ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30' : 'bg-neutral-800 text-white/30 cursor-not-allowed'}`}
                                disabled={!item.inStock || addingToCart.has(item.product_id)}
                                title="Add to Cart"
                              >
                                {addingToCart.has(item.product_id) ? (
                                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                )}
                              </button>

                              <button
                                onClick={() => removeItem(item.id)}
                                className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-black/50 transition-all duration-300"
                                aria-label="Remove from wishlist"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                    <svg className="w-16 h-16 text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <h3 className="text-xl font-medium text-white mb-2">Your wishlist is empty</h3>
                    <p className="text-white/60 max-w-md mb-6">Items you add to your wishlist will appear here. Start exploring our products to find something you like!</p>
                    <Link href="/products" className="bg-amber-500 text-black px-6 py-2.5 rounded-md font-medium hover:bg-amber-400 transition-all duration-300 inline-flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                      </svg>
                      Browse Products
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
