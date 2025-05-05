"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header, Footer } from '@/components';
import CheckoutForm, { CheckoutFormData } from '@/components/checkout/CheckoutForm';
import CheckoutSummary from '@/components/checkout/CheckoutSummary';
import { useCart } from '@/hooks/useCart';
import { useBalance } from '@/hooks/useBalance';
import { isAuthenticated } from '@/lib/auth';
import { calculateSubtotal, calculateDiscount, calculateTotal } from '@/utils/cartUtils';
import { toast } from 'react-hot-toast';
import { ordersService } from '@/services/api/orders';
import usersService from '@/services/api/users';
import cartService from '@/services/api/cart';
import { refreshCart, refreshBalance } from '@/utils/events';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, selectedItems, loading: cartLoading } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);

  // Redirect if not authenticated or no items selected
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login?redirect=checkout');
      return;
    }

    // If cart is loaded and no items are selected, redirect back to cart
    if (!cartLoading && selectedItems.size === 0) {
      toast.error('Please select items to checkout first');
      router.push('/cart');
      return;
    }
  }, [cartLoading, selectedItems.size, router]);
  
  // Additional check to prevent rendering if no items are selected
  useEffect(() => {
    // This will run on every render to double-check
    if (!cartLoading && selectedItems.size === 0) {
      router.push('/cart');
    }
  }, []);

  // Get only the selected items
  const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
  
  // Calculate totals
  const subtotal = calculateSubtotal(selectedCartItems);
  const discount = calculateDiscount(subtotal, promoDiscount);
  const total = calculateTotal(subtotal, discount);

  const handleCheckout = async (formData: CheckoutFormData) => {
    try {
      setIsSubmitting(true);
      
      // Create order items from selected cart items
      const orderItems = selectedCartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product?.price || 0
      }));
      
      // Create the order
      const orderResponse = await ordersService.createOrder({
        shipping_address: {
          full_name: formData.fullName,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postalCode,
          phone: formData.phone,
          email: formData.email
        },
        payment_method: formData.paymentMethod,
        notes: formData.notes,
        items: orderItems,
        subtotal,
        discount,
        total
      });
      
      // Check if order was created successfully
      if (!orderResponse || !('data' in orderResponse) || !orderResponse.data) {
        throw new Error('Failed to create order');
      }
      
      // Safely access the order ID
      const orderData = orderResponse.data as { id?: string | number };
      if (!orderData.id) {
        throw new Error('Order created but no ID returned');
      }
      
      // Store the order ID for later use
      const orderId = orderData.id;
      
      // If payment method is balance, simulate balance payment
      if (formData.paymentMethod === 'balance') {
        // In a real implementation, this would call the actual payment API
        console.log('Processing balance payment for order:', orderId);
        
        // Refresh balance after payment
        refreshBalance();
      }
      
      // Clear cart after successful order - remove selected items
      for (const itemId of selectedItems) {
        const item = cartItems.find(i => i.id === itemId);
        if (item) {
          await cartService.removeFromCart(item.id);
        }
      }
      
      // Trigger cart refresh event
      refreshCart();
      
      // Redirect to success page with order ID
      router.push(`/checkout/success?order_id=${orderId}`);
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred during checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <LoadingOverlay visible={true} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />
      <main className="flex-grow py-8 px-4 md:py-12 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Checkout</h1>
            <p className="text-white/60 mt-2">Complete your purchase by providing shipping and payment details</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CheckoutForm 
                orderTotal={total}
                onSubmit={handleCheckout}
                isSubmitting={isSubmitting}
              />
            </div>
            
            <div className="lg:col-span-1">
              <CheckoutSummary 
                items={selectedCartItems}
                subtotal={subtotal}
                discount={discount}
                total={total}
                promoCode={promoCode || undefined}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
