"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import wishlistService, { WishlistItem } from "@/services/api/wishlist";
import productService from "@/services/api/products";
import cartService from "@/services/api/cart";
import { getProductImageUrl, handleProductImageError } from "@/utils/imageUtils";
import { Product } from "@/types/apiResponses";

// Extended wishlist item with product details
interface WishlistItemWithDetails extends WishlistItem {
  name?: string;
  price?: number;
  image_url?: string;
  seller?: string;
  inStock?: boolean;
}

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItemWithDetails[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login?redirect=wishlist');
      return;
    }
    
    // Reset selected items when component mounts
    setSelectedItems(new Set());

    // Fetch wishlist items from API
    const fetchWishlist = async () => {
      setLoading(true);
      try {
        console.log('Fetching wishlist...');
        const wishlistResponse = await wishlistService.getWishlist();
        console.log('Wishlist response:', wishlistResponse);
        
        if (wishlistResponse && wishlistResponse.data && wishlistResponse.data.items) {
          // Get product details for each wishlist item
          const wishlistItems = wishlistResponse.data.items;
          console.log('Wishlist items:', wishlistItems);
          
          if (wishlistItems.length === 0) {
            setWishlistItems([]);
            setLoading(false);
            return;
          }
          
          const itemsWithDetails = await Promise.all(
            wishlistItems.map(async (item) => {
              try {
                console.log(`Fetching product details for product_id: ${item.product_id}`);
                const productResponse = await productService.getProduct(item.product_id);
                console.log(`Product response for ${item.product_id}:`, productResponse);
                
                if (productResponse) {
                  return {
                    ...item,
                    name: productResponse.name || 'Product not found',
                    price: productResponse.price || 0,
                    image_url: productResponse.image_url || '',
                    seller: `Vendor ID: ${productResponse.vendor_id || 'Unknown'}`,
                    inStock: (productResponse.stock_quantity || 0) > 0
                  };
                }
                return item;
              } catch (error) {
                console.error(`Error fetching product ${item.product_id}:`, error);
                return item;
              }
            })
          );
          
          console.log('Items with details:', itemsWithDetails);
          setWishlistItems(itemsWithDetails);
          
          // Select all items by default
          const allItemIds = new Set(itemsWithDetails.map(item => item.id));
          setSelectedItems(allItemIds);
        } else {
          console.log('No wishlist items found');
          setWishlistItems([]);
          setSelectedItems(new Set());
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setWishlistItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [router]);

  const removeItem = async (id: number | string) => {
    try {
      setLoading(true);
      await wishlistService.removeFromWishlist(id);
      
      // Update local state
      setWishlistItems(prevItems => prevItems.filter(item => item.id !== id));
      
      // Remove from selected items
      setSelectedItems(prevSelected => {
        const newSelected = new Set(prevSelected);
        newSelected.delete(id);
        return newSelected;
      });
    } catch (error) {
      console.error(`Error removing item ${id} from wishlist:`, error);
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle selection of an item
  const toggleSelectItem = (id: number | string) => {
    setSelectedItems(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  };
  
  // Select all items
  const selectAllItems = () => {
    const allItemIds = new Set(wishlistItems.map(item => item.id));
    setSelectedItems(allItemIds);
  };
  
  // Clear all selections
  const clearAllSelections = () => {
    setSelectedItems(new Set());
  };
  
  // Check if all items are selected
  const areAllItemsSelected = wishlistItems.length > 0 && selectedItems.size === wishlistItems.length;
  
  // Toggle order summary visibility
  const toggleOrderSummary = () => {
    setShowOrderSummary(prev => !prev);
  };

  const addToCart = async (productId: number | string) => {
    try {
      setLoading(true);
      await cartService.addToCart({
        product_id: productId,
        quantity: 1
      });
      alert('Product added to cart!');
    } catch (error) {
      console.error(`Error adding product ${productId} to cart:`, error);
      alert('Failed to add product to cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Calculate total price of selected items
  const calculateSelectedTotal = () => {
    return wishlistItems.reduce((sum, item) => {
      if (selectedItems.has(item.id)) {
        return sum + (item.price || 0);
      }
      return sum;
    }, 0);
  };
  
  // Calculate total price of all items
  const calculateTotalValue = () => {
    return wishlistItems.reduce((sum, item) => sum + (item.price || 0), 0);
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
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
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
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-medium text-white">Saved Items</h2>
                    <span className="text-white/60 text-sm">{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={selectAllItems}
                      className={`text-sm ${areAllItemsSelected ? 'text-amber-400' : 'text-white/70 hover:text-amber-400'} transition-colors`}
                    >
                      Select All
                    </button>
                    {selectedItems.size > 0 && (
                      <button 
                        onClick={clearAllSelections}
                        className="text-sm text-white/70 hover:text-amber-400 transition-colors"
                      >
                        Clear
                      </button>
                    )}
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
                
                {/* Order Summary Panel */}
                {showOrderSummary && (
                  <div className="mt-4 p-4 bg-black/30 rounded-sm border border-white/5 animate-fade-in">
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
                    
                    {selectedItems.size > 0 && (
                      <button
                        onClick={() => {
                          const selectedIds = Array.from(selectedItems);
                          selectedIds.forEach(id => addToCart(id));
                        }}
                        className="w-full mt-4 bg-amber-500 text-black py-2 rounded-sm text-sm font-medium hover:bg-amber-400 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/20 transform hover:translate-y-[-2px]"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Add Selected to Cart
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlistItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`group bg-neutral-900/80 backdrop-blur-sm rounded-sm border overflow-hidden shadow-lg transition-all duration-300 hover:border-amber-500/20 animate-fade-in ${selectedItems.has(item.id) ? 'border-amber-500/50' : 'border-white/10'}`}
                    style={{animationDelay: `${index * 100}ms`}}
                  >
                    <div className="relative">
                      <Link href={`/products/${item.product_id}`}>
                        <div className="h-56 overflow-hidden bg-neutral-800">
                          {item.image_url ? (
                            <img 
                              src={getProductImageUrl(item.image_url)} 
                              alt={item.name || 'Product'} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              onError={handleProductImageError}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-white/30">
                              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        {!item.inStock && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <span className="bg-red-500/80 text-white px-3 py-1 rounded-sm text-sm font-medium">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </Link>
                      <div className="absolute top-3 right-3 flex space-x-2">
                        <label className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center cursor-pointer hover:bg-black/80 transition-all duration-300">
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
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white/70 hover:text-red-400 hover:bg-black/80 transition-all duration-300"
                          aria-label="Remove from wishlist"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <Link 
                          href={`/products/${item.product_id}`}
                          className="block text-white font-medium hover:text-amber-400 transition-colors"
                        >
                          {item.name || 'Product'}
                        </Link>
                        <span className="text-amber-500 font-bold ml-2">{formatCurrency(item.price || 0)}</span>
                      </div>
                      <p className="text-white/60 text-sm mb-4">{item.seller || 'Unknown vendor'}</p>
                      
                      {item.inStock ? (
                        <button
                          onClick={() => addToCart(item.product_id)}
                          className="w-full bg-amber-500 text-black py-2 rounded-sm text-sm font-medium hover:bg-amber-400 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/20 transform hover:translate-y-[-2px]"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Add to Cart
                        </button>
                      ) : (
                        <button
                          className="w-full bg-neutral-800 text-white/50 py-2 rounded-sm text-sm font-medium cursor-not-allowed flex items-center justify-center gap-2"
                          disabled
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Unavailable
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
