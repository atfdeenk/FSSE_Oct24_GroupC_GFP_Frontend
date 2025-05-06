"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCart } from '@/hooks/useCart';
import Link from "next/link";
import { Header, Footer, SelectionControls } from "@/components";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import PromoCodeInput from "@/components/PromoCodeInput";
import OrderSummary from "@/components/OrderSummary";
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import BalanceDisplay from '@/components/ui/BalanceDisplay';
import EmptyState from "@/components/EmptyState";
import SellerGroup from "@/components/SellerGroup";
import { PROMO_CODES } from "@/constants/promoCodes";
import { isAuthenticated } from "@/lib/auth";
import { calculateSubtotal, calculateDiscount, calculateTotal } from '@/utils/cartUtils';
import { formatCurrency } from '@/utils/format';
import { CartItemWithDetails } from '@/types/cart';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const {
    cartItems,
    setCartItems,
    selectedItems,
    setSelectedItems,
    loading,
    fetchCart,
    updateQuantity,
    removeItem,
    toggleSelectItem,
    selectAllItems,
    clearAllSelections,
    clearCart,
  } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [showSelectionBar, setShowSelectionBar] = useState(false);
  const [showClearCartModal, setShowClearCartModal] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login?redirect=cart');
      return;
    }

    fetchCart();
    
    // Load promo code from localStorage if it exists
    const savedPromoCode = localStorage.getItem('promoCode');
    const savedPromoDiscount = localStorage.getItem('promoDiscount');
    
    if (savedPromoCode) {
      setPromoCode(savedPromoCode);
    }
    
    if (savedPromoDiscount) {
      setPromoDiscount(Number(savedPromoDiscount));
    }
  }, [fetchCart]);

  // Show selection bar when items are selected
  useEffect(() => {
    if (selectedItems.size > 0) {
      setShowSelectionBar(true);
    } else {
      // Add a small delay before hiding to allow for animations
      const timer = setTimeout(() => setShowSelectionBar(false), 300);
      return () => clearTimeout(timer);
    }
  }, [selectedItems.size]);

  // Check if all items are selected
  const areAllItemsSelected = cartItems.length > 0 && selectedItems.size === cartItems.length;

  const applyPromoCode = () => {
    setPromoError("");
    const found = PROMO_CODES.find(
      (p) => p.code.toUpperCase() === promoCode.toUpperCase()
    );
    if (found) {
      // Apply percentage discount to subtotal
      const discountAmount = Math.round(subtotal * (found.discount / 100));
      setPromoDiscount(discountAmount);
      
      // Save to localStorage for checkout page
      localStorage.setItem('promoCode', promoCode);
      localStorage.setItem('promoDiscount', discountAmount.toString());
      
      toast.success(`Promo code applied: ${found.discount}% discount`);
    } else {
      setPromoError("Invalid promo code");
      setPromoDiscount(0);
      // Clear from localStorage
      localStorage.removeItem('promoCode');
      localStorage.removeItem('promoDiscount');
    }
  };

  // Group cart items by seller
  const itemsBySeller = useMemo(() => {
    const grouped: Record<string, CartItemWithDetails[]> = {};
    
    cartItems.forEach(item => {
      // Use vendor_id or seller as the key, fallback to 'Unknown Seller'
      const sellerKey = item.seller || 
                       (typeof item.vendor_id === 'string' ? item.vendor_id : `Seller #${item.vendor_id}`) || 
                       'Unknown Seller';
      
      if (!grouped[sellerKey]) {
        grouped[sellerKey] = [];
      }
      
      grouped[sellerKey].push(item);
    });
    
    return grouped;
  }, [cartItems]);

  // Get all seller names for display
  const sellerNames = useMemo(() => Object.keys(itemsBySeller), [itemsBySeller]);
  
  // Calculate subtotal, discount, total using centralized utils
  const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
  const subtotal = calculateSubtotal(selectedCartItems);
  // Use the promoDiscount directly as it's already the calculated amount, not a percentage
  const discount = promoDiscount;
  const total = calculateTotal(subtotal, discount);
  const totalCartValue = calculateSubtotal(cartItems);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />
      <main className="flex-grow py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Your Cart</h1>
              <p className="text-white/60">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                {selectedItems.size > 0 && (
                  <span className="ml-2 text-amber-400">
                    ({selectedItems.size} selected for checkout)
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {cartItems.length > 0 && (
                <button
                  onClick={() => setShowClearCartModal(true)}
                  className="text-red-400 hover:text-white hover:bg-red-500/20 flex items-center gap-2 transition-colors text-sm border border-red-500/30 px-4 py-2 rounded-full self-start"
                  disabled={loading}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear Cart
                </button>
              )}
              
              <Link 
                href="/products" 
                className="text-white/70 hover:text-white flex items-center gap-2 group transition-colors text-sm bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full self-start"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>

          {loading ? (
            <LoadingOverlay message="Loading your cart..." />
          ) : cartItems.length === 0 ? (
            <div className="bg-neutral-900/40 backdrop-blur-sm rounded-lg border border-white/5 shadow-xl p-8 md:p-12 text-center animate-fade-in">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-amber-800/20 rounded-full animate-pulse"></div>
                <svg className="w-full h-full text-white/30 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Your cart is empty</h2>
              <p className="text-white/60 max-w-md mx-auto mb-8">Your cart is currently empty. Browse our products and add items to your cart.</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/products" 
                  className="inline-flex items-center justify-center gap-2 bg-amber-500 text-black px-6 py-3 rounded-md font-bold hover:bg-amber-400 transition-all shadow-lg hover:shadow-amber-500/20 hover:translate-y-[-2px]"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Browse Products
                </Link>
                
                <Link 
                  href="/wishlist" 
                  className="inline-flex items-center justify-center gap-2 bg-white/5 text-white px-6 py-3 rounded-md font-medium hover:bg-white/10 transition-all border border-white/10"
                >
                  <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  View Wishlist
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
                    {/* Cart Items Grouped by Seller */}
                    {sellerNames.map(sellerName => (
                      <SellerGroup
                        key={sellerName}
                        seller={sellerName}
                        items={itemsBySeller[sellerName]}
                        selectedItems={selectedItems}
                        loading={loading}
                        onToggleSelect={toggleSelectItem}
                        onUpdateQuantity={updateQuantity}
                        onRemoveItem={removeItem}
                      />
                    ))}
                  </ul>
                  {cartItems.length > 0 && selectedItems.size > 0 && (
                    <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-black/90 border-t border-white/10 flex justify-between items-center mt-6 backdrop-blur-sm rounded-b-lg shadow-lg animate-slide-up">
                      <div className="text-white/80 text-sm">
                        <span className="font-medium text-amber-400">{selectedItems.size}</span> items selected
                        <span className="ml-2 hidden sm:inline-block">({formatCurrency(subtotal)})</span>
                      </div>
                      <button
                        className="bg-amber-500 text-black px-4 py-2 rounded-md font-medium hover:bg-amber-400 transition-all shadow-lg hover:shadow-amber-500/20 hover:translate-y-[-2px] flex items-center gap-2"
                        disabled={selectedItems.size === 0}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Proceed to Checkout
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <OrderSummary
                  selectedItemsCount={selectedItems.size}
                  totalItemsCount={cartItems.length}
                  subtotal={subtotal}
                  discount={discount}
                  total={total}
                  totalCartValue={totalCartValue}
                  promoDiscount={promoDiscount}
                  promoError={promoError}
                  onApplyPromo={applyPromoCode}
                  promoCode={promoCode}
                  setPromoCode={setPromoCode}
                >
                  <PromoCodeInput
                    value={promoCode}
                    onChange={setPromoCode}
                    onApply={applyPromoCode}
                    error={promoError}
                    successMessage={promoDiscount > 0 ? "Promo code applied successfully!" : undefined}
                    disabled={loading}
                    onRemove={promoDiscount > 0 ? () => {
                      setPromoCode("");
                      setPromoDiscount(0);
                      setPromoError("");
                      // Clear from localStorage
                      localStorage.removeItem('promoCode');
                      localStorage.removeItem('promoDiscount');
                    } : undefined}
                  />
                  <button
                    className={`w-full py-3 rounded-sm font-bold transform hover:translate-y-[-2px] transition-all duration-300 shadow-lg ${selectedItems.size > 0 ? 'bg-amber-500 text-black hover:bg-amber-400 hover:shadow-amber-500/20' : 'bg-neutral-700 text-white/50 cursor-not-allowed'}`}
                    disabled={selectedItems.size === 0}
                    onClick={() => {
                      if (selectedItems.size > 0) {
                        // Store selected items in both localStorage keys to ensure compatibility
                        const selectedIds = Array.from(selectedItems);
                        console.log('Storing selected items for checkout:', selectedIds);
                        localStorage.setItem('checkoutSelectedItems', JSON.stringify(selectedIds));
                        localStorage.setItem('cartSelectedItems', JSON.stringify(selectedIds));
                        
                        // Force a synchronization of the cart state
                        setSelectedItems(new Set(selectedIds));
                        
                        // Add a small delay to ensure localStorage is updated before navigation
                        setTimeout(() => {
                          // Navigate to checkout
                          router.push('/checkout');
                        }, 200);
                      } else {
                        toast.error('Please select items to checkout');
                      }
                    }}
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
                  {/* Balance Display */}
                  <div className="mt-6">
                    <BalanceDisplay orderTotal={total} showSufficiency={true} />
                  </div>
                  
                  <div className="mt-6 p-4 bg-black/30 rounded-sm border border-white/5">
                    <h3 className="text-white text-sm font-medium mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Secure Checkout
                    </h3>
                    <p className="text-white/60 text-xs">Your payment information is processed securely. We do not store credit card details.</p>
                  </div>
                </OrderSummary>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Confirmation Modal for clearing cart */}
      <ConfirmationModal
        isOpen={showClearCartModal}
        onClose={() => setShowClearCartModal(false)}
        onConfirm={clearCart}
        title="Clear Your Cart"
        message="Are you sure you want to remove all items from your cart? This action cannot be undone."
        confirmText="Clear Cart"
        cancelText="Keep Items"
        type="danger"
      />
    </div>
  );
}
