"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from '@/hooks/useCart';
import Link from "next/link";
import { Header, Footer, SelectionControls } from "@/components";
import PromoCodeInput from "@/components/PromoCodeInput";
import CartItem from "@/components/CartItem";
import OrderSummary from "@/components/OrderSummary";
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import EmptyState from "@/components/EmptyState";
import { PROMO_CODES } from "@/constants/promoCodes";
import { isAuthenticated } from "@/lib/auth";
import { calculateSubtotal, calculateDiscount, calculateTotal } from '@/utils/cartUtils';
import { formatCurrency } from '@/utils/format';

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
  } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login?redirect=cart');
      return;
    }

    fetchCart();
  }, [fetchCart]);


  // Check if all items are selected
  const areAllItemsSelected = cartItems.length > 0 && selectedItems.size === cartItems.length;

  const applyPromoCode = () => {
    setPromoError("");
    const found = PROMO_CODES.find(
      (p) => p.code.toUpperCase() === promoCode.toUpperCase()
    );
    if (found) {
      setPromoDiscount(found.discount);
    } else {
      setPromoError("Invalid promo code");
      setPromoDiscount(0);
    }
  };

  // Calculate subtotal, discount, total using centralized utils
  const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
  const subtotal = calculateSubtotal(selectedCartItems);
  const discount = calculateDiscount(subtotal, promoDiscount);
  const total = calculateTotal(subtotal, discount);
  const totalCartValue = calculateSubtotal(cartItems);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />
      <main className="flex-grow py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Your Cart</h1>
          <p className="text-white/60 mb-8">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>

          {loading ? (
            <LoadingOverlay message="Loading your cart..." />
          ) : cartItems.length === 0 ? (
            <EmptyState message="Your cart is empty">
              <svg className="w-20 h-20 text-white/30 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-white/70 mb-8 max-w-md mx-auto">Looks like you haven't added any items to your cart yet. Discover our local artisan products and add your favorites!</p>
              <Link href="/products" className="bg-amber-500 text-black px-8 py-3 rounded-sm font-medium hover:bg-amber-400 transition-colors inline-block shadow-lg hover:shadow-amber-500/20">
                Explore Products
              </Link>
            </EmptyState>
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
                      <CartItem
                        key={item.id}
                        item={item}
                        selected={selectedItems.has(item.id)}
                        loading={loading}
                        onSelect={toggleSelectItem}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeItem}
                      />
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
                    } : undefined}
                  />
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
                </OrderSummary>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
