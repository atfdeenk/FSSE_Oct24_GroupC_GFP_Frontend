"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import CheckoutContainer from '@/components/checkout/CheckoutContainer';
import AddressManager from '@/components/checkout/AddressManager';
import CheckoutOptions from '@/components/checkout/CheckoutOptions';
import CheckoutItemList from '@/components/checkout/CheckoutItemList';
import PaymentSection from '@/components/checkout/PaymentSection';
import { useCheckout } from '@/hooks/useCheckout';
import { PROMO_CODES } from '@/constants/promoCodes';
import { Header, Footer } from '@/components';

export default function CheckoutPage() {
  const router = useRouter();
  const checkout = useCheckout();
  
  // Force refresh discount when component mounts
  React.useEffect(() => {
    // Check if we're using seller vouchers
    const useSellerVouchersStr = localStorage.getItem('useSellerVouchers');
    const useVouchers = useSellerVouchersStr === 'true';
    
    if (useVouchers) {
      // Get the saved voucher discount
      const savedVoucherDiscount = localStorage.getItem('voucherDiscount');
      if (savedVoucherDiscount) {
        console.log('Checkout page: Found saved voucher discount', { 
          discount: Number(savedVoucherDiscount) 
        });
        
        // Force a vouchers applied event to ensure the discount is applied
        window.dispatchEvent(new CustomEvent('vouchersApplied'));
      }
    }
  }, []);
  
  // Redirect to login if not authenticated
  React.useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        toast.error('Please log in to access checkout');
        router.push('/login?redirect=/checkout');
      }
    };
    
    checkAuth();
  }, [router]);
  
  // Track checkout steps for progress indicator
  const steps = [
    { id: 'shipping', label: 'Shipping', icon: 'truck' },
    { id: 'payment', label: 'Payment', icon: 'credit-card' },
    { id: 'confirmation', label: 'Confirmation', icon: 'check-circle' }
  ];
  const currentStep = 'shipping';
  
  // Show loading state while fetching cart items
  if (checkout.loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-white text-center py-12">
            <div className="mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
            </div>
            <h2 className="text-xl font-medium mb-2">Loading checkout...</h2>
            <p className="text-white/60 mb-6">Please wait while we prepare your checkout</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Show empty cart message if no items are selected and not loading
  if (checkout.selectedCartItems.length === 0 && !checkout.loading) {
    return (
      <CheckoutContainer isSubmitting={false} title="Checkout">
        <div className="text-white text-center py-12">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
          <p className="text-white/60 mb-6">Add some items to your cart to continue checkout</p>
          <button 
            onClick={() => router.push('/products')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </CheckoutContainer>
    );
  }

  // Main checkout page layout with components
  return (
    <CheckoutContainer isSubmitting={checkout.isSubmitting} title="Checkout">
      {/* Checkout Progress Indicator */}
      <div className="mb-8 overflow-hidden">
        <div className="flex justify-between relative z-10">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isPast = steps.findIndex(s => s.id === currentStep) > index;
            const statusClass = isActive ? 'text-amber-500 border-amber-500' : 
                               isPast ? 'text-green-500 border-green-500' : 'text-white/40 border-white/20';
            
            return (
              <div key={step.id} className={`flex flex-col items-center relative ${index === 0 ? 'pl-0' : ''} ${index === steps.length - 1 ? 'pr-0' : ''}`}>
                <div className={`w-10 h-10 rounded-full border-2 ${statusClass} flex items-center justify-center mb-2 bg-neutral-900 z-10`}>
                  {step.icon === 'truck' && (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 100-4h14a2 2 0 100 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  )}
                  {step.icon === 'credit-card' && (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  )}
                  {step.icon === 'check-circle' && (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm font-medium ${statusClass}`}>{step.label}</span>
              </div>
            );
          })}
        </div>
        
        {/* Progress Line */}
        <div className="relative mt-5">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10"></div>
          <div 
            className="absolute top-0 left-0 h-0.5 bg-amber-500 transition-all duration-500" 
            style={{ width: currentStep === 'shipping' ? '0%' : currentStep === 'payment' ? '50%' : '100%' }}
          ></div>
        </div>
      </div>
      
      {/* Order Summary Banner */}
      <div className="bg-gradient-to-r from-amber-900/30 to-green-900/30 rounded-lg p-4 mb-6 border border-amber-500/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h3 className="text-amber-400 font-medium mb-1">Order Summary</h3>
            <p className="text-white/70 text-sm">
              <span className="font-medium">{checkout.selectedCartItems.length}</span> items from <span className="font-medium">{Object.keys(checkout.groupItemsBySeller(checkout.selectedCartItems)).length}</span> local vendors
            </p>
          </div>
          <div className="flex items-center mt-3 md:mt-0">
            <div className="bg-black/30 rounded-lg px-3 py-1.5 flex items-center mr-3">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-white text-sm">Secure Checkout</span>
            </div>
            <div className="bg-black/30 rounded-lg px-3 py-1.5 flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white text-sm">Fast Processing</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <div className="space-y-6">
            {/* Shipping Information */}
            <div className="bg-neutral-900/80 backdrop-blur-sm rounded-lg shadow-sm border border-white/10 overflow-hidden">
              <div className="bg-green-900/30 px-6 py-4 border-b border-white/10 flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">Shipping Information</h2>
              </div>
              
              <div className="p-6">
                <AddressManager
                  user={null} // We don't need to pass user here as it's handled in the hook
                  savedAddresses={checkout.savedAddresses}
                  selectedAddress={checkout.selectedAddress}
                  showNewAddressForm={checkout.showNewAddressForm}
                  showSavedAddresses={checkout.showSavedAddresses}
                  newAddress={checkout.newAddress}
                  onSelectAddress={checkout.setSelectedAddress}
                  onToggleNewAddressForm={() => checkout.setShowNewAddressForm(!checkout.showNewAddressForm)}
                  onToggleSavedAddresses={() => checkout.setShowSavedAddresses(!checkout.showSavedAddresses)}
                  onAddressChange={checkout.handleAddressChange}
                  onSaveNewAddress={checkout.saveNewAddress}
                />
              </div>
            </div>
            
            {/* Product List */}
            <div className="bg-neutral-900/80 backdrop-blur-sm rounded-lg shadow-sm border border-white/10 overflow-hidden">
              <div className="bg-green-900/30 px-6 py-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-white">Order Items</h2>
                  </div>
                  <div className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm font-medium">
                    {checkout.selectedCartItems.length} {checkout.selectedCartItems.length === 1 ? 'item' : 'items'}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <CheckoutItemList
                  groupedItems={checkout.groupItemsBySeller(checkout.selectedCartItems)}
                  productNotes={checkout.productNotes}
                  onProductNoteChange={(productId: string | number, note: string) => {
                    checkout.setProductNotes({
                      ...checkout.productNotes,
                      [productId]: note
                    });
                  }}
                />

                {/* Eco-friendly Options and Carbon Offset */}
                <CheckoutOptions
                  groupedItems={checkout.groupItemsBySeller(checkout.selectedCartItems)}
                  ecoPackaging={checkout.ecoPackaging}
                  carbonOffset={checkout.carbonOffset}
                  onEcoPackagingChange={(sellerId, checked) => {
                    const newEcoPackaging = { ...checkout.ecoPackaging };
                    newEcoPackaging[sellerId] = checked;
                    checkout.setEcoPackaging(newEcoPackaging);
                  }}
                  onCarbonOffsetChange={(checked) => checkout.setCarbonOffset(checked)}
                  ecoPackagingCost={5000}
                  carbonOffsetCost={3800}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 order-1 lg:order-2">
          {/* Mobile Order Summary Floating Bar - Only visible on mobile */}
          <div className="fixed bottom-0 left-0 right-0 bg-neutral-900/95 backdrop-blur-md border-t border-white/10 p-4 flex justify-between items-center lg:hidden z-50">
            <div>
              <div className="text-sm text-white/60">Total</div>
              <div className="text-lg font-bold text-amber-500">{checkout.total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</div>
              {checkout.discount > 0 && (
                <div className="text-xs text-green-400 mt-1">You saved {checkout.discount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</div>
              )}
            </div>
            <button
              onClick={() => {
                // Scroll to payment section
                const paymentSection = document.getElementById('payment-section');
                if (paymentSection) {
                  paymentSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-500 transition-colors flex items-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              Proceed to Payment
            </button>
          </div>
          
          <div id="payment-section" className="sticky top-20">
            <PaymentSection
              subtotal={checkout.subtotal}
              discount={checkout.discount}
              total={checkout.total}
              paymentMethod={checkout.paymentMethod as 'balance' | 'cod'}
              isSubmitting={checkout.isSubmitting}
              // Pass eco-friendly options to the payment section
              ecoPackagingCost={5000}
              carbonOffsetCost={3800}
              ecoPackagingCount={Object.values(checkout.ecoPackaging).filter(Boolean).length}
              carbonOffsetEnabled={checkout.carbonOffset}
              // Pass promo code props
              promoCode={checkout.promoCode}
              promoError={checkout.promoError || ""}
              promoDiscount={checkout.promoDiscount}
              onPromoCodeChange={checkout.setPromoCode}
              setPromoDiscount={checkout.setPromoDiscount}
              onApplyPromoCode={() => {
                // Reset any previous error
                checkout.setPromoError("");
                
                // Use the same promo code validation as cart page
                const found = PROMO_CODES.find(
                  (p) => p.code.toUpperCase() === checkout.promoCode.toUpperCase()
                );
                
                if (found) {
                  // Apply percentage discount to subtotal
                  const discountAmount = Math.round(checkout.subtotal * (found.discount / 100));
                  checkout.setPromoDiscount(discountAmount);
                  toast.success(`Promo code applied: ${found.discount}% discount`);
                } else {
                  checkout.setPromoError('Invalid promo code');
                  checkout.setPromoDiscount(0);
                  toast.error('Invalid promo code');
                }
              }}
              onPaymentMethodChange={(method: string) => {
                // Cast the string to the expected type
                if (method === 'balance' || method === 'cod') {
                  checkout.setPaymentMethod(method);
                } else {
                  // Default to balance if an unsupported payment method is selected
                  checkout.setPaymentMethod('balance');
                  console.warn(`Payment method '${method}' is not supported. Using 'balance' instead.`);
                }
              }}
              onCheckout={() => checkout.handleCheckout({
                fullName: checkout.selectedAddress.fullName,
                email: checkout.selectedAddress.email,
                phone: checkout.selectedAddress.phone,
                address: checkout.selectedAddress.address,
                city: checkout.selectedAddress.city,
                postalCode: checkout.selectedAddress.postalCode,
                paymentMethod: checkout.paymentMethod as 'balance' | 'cod',
                notes: `${Object.values(checkout.ecoPackaging).filter(Boolean).length > 0 ? 'Include eco-friendly packaging. ' : ''}${checkout.carbonOffset ? 'Include carbon offset for delivery. ' : ''}`
              })}
            />
          </div>
        </div>
      </div>
    </CheckoutContainer>
  );
}
