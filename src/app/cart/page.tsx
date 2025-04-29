"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header, Footer, SelectionControls } from "@/components";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import cartService from "@/services/api/cart";
import productService from "@/services/api/products";
import { getProductImageUrl, handleProductImageError } from "@/utils/imageUtils";
import { isProductInStock } from "@/utils/products";
import { CartItem as ApiCartItem } from "@/types/apiResponses";

// Extended cart item with product details
interface CartItemWithDetails extends ApiCartItem {
  name?: string;
  image_url?: string;
  seller?: string;
  unit_price: number;
  product_id: number | string;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login?redirect=cart');
      return;
    }

    // Reset selected items when component mounts
    setSelectedItems(new Set());

    // Fetch cart items from API
    const fetchCart = async () => {
      setLoading(true);
      try {
        console.log('Fetching cart...');
        const cartResponse = await cartService.getCart();
        console.log('Cart response:', cartResponse);

        // If cart is empty, we'll just show the empty state
        if (!cartResponse?.data?.items?.length) {
          console.log('Cart is empty');
        }

        if (cartResponse && cartResponse.data && cartResponse.data.items && cartResponse.data.items.length > 0) {
          console.log('Processing cart items:', cartResponse.data.items);
          // Fetch product details for each cart item
          const itemsWithDetails = await Promise.all(
            cartResponse.data.items.map(async (item) => {
              try {
                console.log('Fetching product details for:', item.product_id);
                const product = await productService.getProduct(item.product_id);
                console.log('Product details:', product);
                return {
                  ...item,
                  name: product?.name || 'Product not found',
                  image_url: product?.image_url || '',
                  seller: `Vendor ID: ${product?.vendor_id || 'Unknown'}`,
                  unit_price: item.price || 0,
                  product_id: item.product_id,
                  inStock: isProductInStock(product)
                };
              } catch (error) {
                console.error(`Error fetching product ${item.product_id}:`, error);
                return {
                  ...item,
                  name: 'Product not found',
                  image_url: '',
                  seller: 'Unknown vendor',
                  unit_price: item.price || 0,
                  product_id: item.product_id
                };
              }
            })
          );

          console.log('Setting cart items:', itemsWithDetails);
          setCartItems(itemsWithDetails);

          // Select all items by default
          const allItemIds = new Set(itemsWithDetails.map(item => item.id));
          setSelectedItems(allItemIds);
        } else {
          console.log('No cart items found');
          setCartItems([]);
          setSelectedItems(new Set());
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [router]);

  const updateQuantity = async (id: number | string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      setLoading(true);
      await cartService.updateCartItem(id, { quantity: newQuantity });

      // Update local state
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error(`Error updating quantity for item ${id}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (id: number | string) => {
    try {
      setLoading(true);
      await cartService.removeFromCart(id);

      // Update local state
      setCartItems(prevItems => prevItems.filter(item => item.id !== id));

      // Remove from selected items
      setSelectedItems(prevSelected => {
        const newSelected = new Set(prevSelected);
        newSelected.delete(id);
        return newSelected;
      });
    } catch (error) {
      console.error(`Error removing item ${id} from cart:`, error);
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
    const allItemIds = new Set(cartItems.map(item => item.id));
    setSelectedItems(allItemIds);
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedItems(new Set());
  };

  // Check if all items are selected
  const areAllItemsSelected = cartItems.length > 0 && selectedItems.size === cartItems.length;

  const applyPromoCode = () => {
    setPromoError("");

    // Mock promo code validation
    if (promoCode.toUpperCase() === "WELCOME10") {
      setPromoDiscount(10); // 10% discount
    } else if (promoCode.toUpperCase() === "BUMI25") {
      setPromoDiscount(25); // 25% discount
    } else {
      setPromoError("Invalid promo code");
      setPromoDiscount(0);
    }
  };

  // Calculate subtotal from selected cart items
  const subtotal = cartItems.reduce((sum, item) => {
    // Only include selected items in the subtotal
    if (selectedItems.has(item.id)) {
      const price = typeof item.unit_price === 'number' ? item.unit_price : 0;
      const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
      return sum + (price * quantity);
    }
    return sum;
  }, 0);

  // Calculate total from all cart items (for display purposes)
  const totalCartValue = cartItems.reduce((sum, item) => {
    const price = typeof item.unit_price === 'number' ? item.unit_price : 0;
    const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
    return sum + (price * quantity);
  }, 0);
  const discount = subtotal * (promoDiscount / 100);
  const total = subtotal - discount;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />

      <main className="flex-grow py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Your Cart</h1>
          <p className="text-white/60 mb-8">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-16 bg-neutral-900/80 backdrop-blur-sm rounded-sm border border-white/10 shadow-lg transform transition-all duration-300 hover:border-amber-500/30">
              <div className="animate-fade-in-down">
                <svg className="w-20 h-20 text-white/30 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h2 className="text-2xl font-bold text-white mb-3">Your cart is empty</h2>
                <p className="text-white/70 mb-8 max-w-md mx-auto">Looks like you haven't added any items to your cart yet. Discover our local artisan products and add your favorites!</p>
                <Link href="/products" className="bg-amber-500 text-black px-8 py-3 rounded-sm font-medium hover:bg-amber-400 transition-colors inline-block shadow-lg hover:shadow-amber-500/20">
                  Explore Products
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-neutral-900/80 backdrop-blur-sm rounded-sm border border-white/10 overflow-hidden shadow-lg">
                  <div className="p-4 border-b border-white/10 bg-black/30">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-medium text-white">Shopping Cart</h2>
                        <span className="text-white/60 text-sm">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <SelectionControls
                          onSelectAll={selectAllItems}
                          onDeselectAll={clearAllSelections}
                          selectedCount={selectedItems.size}
                          totalCount={cartItems.length}
                          buttonOnly={true}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <ul className="divide-y divide-white/10">
                    {cartItems.map((item) => (
                      <div key={item.id} className={`group p-4 bg-neutral-900/80 backdrop-blur-sm rounded-sm border overflow-hidden shadow-lg transition-all duration-300 hover:border-amber-500/20 animate-fade-in ${selectedItems.has(item.id) ? 'border-amber-500/50' : 'border-white/10'}`}>
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

                          <div className="w-16 h-16 bg-neutral-800 rounded-sm overflow-hidden mr-4 flex-shrink-0">
                            <Link href={`/products/${item.product_id}`} className="block w-full h-full">
                              <img
                                src={getProductImageUrl(item.image_url || '')}
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                onError={handleProductImageError}
                              />
                            </Link>
                          </div>

                          <div className="flex-grow mr-4">
                            <Link
                              href={`/products/${item.product_id}`}
                              className="text-white font-medium hover:text-amber-400 transition-colors block mb-1"
                            >
                              {item.name}
                            </Link>
                            <div className="text-white/60 text-xs">{item.seller}</div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <button
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                className="w-7 h-7 flex items-center justify-center rounded-l-sm bg-black/50 text-white/70 hover:text-white hover:bg-black/70 transition-colors"
                                disabled={loading}
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>

                              <div className="w-10 h-7 flex items-center justify-center bg-black/30 text-white border-x border-white/5 text-sm">
                                {item.quantity}
                              </div>

                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-r-sm bg-black/50 text-white/70 hover:text-white hover:bg-black/70 transition-colors"
                                disabled={loading}
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>

                            <div className="text-amber-500 font-bold w-24 text-right">
                              {formatCurrency(item.unit_price * item.quantity)}
                            </div>

                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-white/40 hover:text-red-400 transition-colors w-8 h-8 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50"
                              disabled={loading}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </ul>
                  {cartItems.length > 0 && (
                    <div className="p-4 border-t border-white/10 bg-black/20 flex justify-between items-center">
                      <Link href="/products" className="text-amber-500 hover:text-amber-400 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Continue Shopping
                      </Link>
                      <div className="flex items-center gap-4">
                        <span className="text-white/60 text-sm">
                          <span className="font-medium text-white">{selectedItems.size}</span> of {cartItems.length} selected
                          {selectedItems.size > 0 && (
                            <span className="ml-2">Subtotal: <span className="text-amber-500 font-medium">{formatCurrency(subtotal)}</span></span>
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-neutral-900/80 backdrop-blur-sm rounded-sm border border-white/10 sticky top-24 shadow-lg animate-fade-in">
                  <div className="p-6 border-b border-white/10 bg-black/30">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold text-white">Order Summary</h2>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between">
                        <span className="text-white/70">Subtotal ({selectedItems.size} {selectedItems.size === 1 ? 'item' : 'items'})</span>
                        <span className="text-white font-medium">{formatCurrency(subtotal)}</span>
                      </div>

                      {selectedItems.size < cartItems.length && (
                        <div className="flex justify-between text-white/50">
                          <span>Unselected items</span>
                          <span>{formatCurrency(totalCartValue - subtotal)}</span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-white/70">Shipping</span>
                        <span className="text-green-400 font-medium">Free</span>
                      </div>

                      {promoDiscount > 0 && (
                        <div className="flex justify-between text-amber-400">
                          <span>Discount ({promoDiscount}%)</span>
                          <span>-{formatCurrency(discount)}</span>
                        </div>
                      )}

                      <div className="pt-4 border-t border-white/10 flex justify-between">
                        <span className="text-white font-bold">Total</span>
                        <span className="text-amber-500 font-bold text-xl">{formatCurrency(total)}</span>
                      </div>
                    </div>

                    {/* Promo Code */}
                    <div className="mb-8">
                      <label className="block text-white/70 text-sm mb-2">Promo Code</label>
                      <div className="flex">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="bg-black/50 border border-white/10 rounded-l-sm px-4 py-2 w-full text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                          placeholder="Enter code"
                        />
                        <button
                          onClick={applyPromoCode}
                          className="bg-amber-500 text-black px-4 py-2 rounded-r-sm font-medium hover:bg-amber-400 transition-colors shadow-lg hover:shadow-amber-500/20"
                        >
                          Apply
                        </button>
                      </div>
                      {promoError && <p className="text-red-400 text-sm mt-1 animate-fade-in">{promoError}</p>}
                      {promoDiscount > 0 && <p className="text-amber-400 text-sm mt-1 animate-fade-in flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Promo code applied successfully!
                      </p>}
                    </div>

                    <button
                      className={`w-full py-3 rounded-sm font-bold transform hover:translate-y-[-2px] transition-all duration-300 shadow-lg ${selectedItems.size > 0 ? 'bg-amber-500 text-black hover:bg-amber-400 hover:shadow-amber-500/20' : 'bg-neutral-700 text-white/50 cursor-not-allowed'}`}
                      disabled={selectedItems.size === 0}
                    >
                      {selectedItems.size > 0 ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-7 h-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <rect x="6" y="10" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                            <path d="M9 10V8a3 3 0 016 0v2" stroke="currentColor" strokeWidth="2" fill="none" />
                          </svg>
                          Proceed to Checkout
                        </span>
                      ) : 'Select Items to Checkout'}
                    </button>

                    <div className="mt-6 p-4 bg-black/30 rounded-sm border border-white/5">
                      <h3 className="text-white text-sm font-medium mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Secure Checkout
                      </h3>
                      <p className="text-white/60 text-xs">Your payment information is processed securely. We do not store credit card details.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
