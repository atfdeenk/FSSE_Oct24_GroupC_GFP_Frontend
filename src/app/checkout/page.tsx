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

export default function CheckoutPage() {
  const router = useRouter();
  const checkout = useCheckout();
  
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
  
  // Show empty cart message if no items are selected
  if (checkout.selectedCartItems.length === 0) {
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <div className="space-y-6">
            {/* Shipping Information */}
            <div className="bg-neutral-900/80 backdrop-blur-sm rounded-lg shadow-sm border border-white/10 overflow-hidden">
              <div className="bg-green-900/30 px-6 py-4 border-b border-white/10">
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
                  <h2 className="text-lg font-semibold text-white">Order Items</h2>
                  <div className="text-white/60 text-sm">{checkout.selectedCartItems.length} items</div>
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
                  onEcoPackagingChange={(sellerId: string | number, checked: boolean) => {
                    checkout.setEcoPackaging({
                      ...checkout.ecoPackaging,
                      [sellerId]: checked
                    });
                  }}
                  onCarbonOffsetChange={checkout.setCarbonOffset}
                  promoCode={checkout.promoCode}
                  onPromoCodeChange={checkout.setPromoCode}
                  onApplyPromoCode={() => {
                    // Apply promo code logic
                    if (checkout.promoCode.toLowerCase() === 'eco2023') {
                      checkout.setPromoDiscount(10000);
                      toast.success('Promo code applied: 10,000 IDR discount');
                    } else if (checkout.promoCode.toLowerCase() === 'local20') {
                      checkout.setPromoDiscount(20000);
                      toast.success('Promo code applied: 20,000 IDR discount');
                    } else {
                      toast.error('Invalid promo code');
                    }
                  }}
                  ecoPackagingCost={5000}
                  carbonOffsetCost={3800}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 order-1 lg:order-2">
          <div className="sticky top-20">
            <PaymentSection
              subtotal={checkout.subtotal}
              discount={checkout.discount}
              total={checkout.total}
              paymentMethod={checkout.paymentMethod as 'balance' | 'cod'}
              isSubmitting={checkout.isSubmitting}
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
