"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ordersService } from '@/services/api/orders';
import feedbackService from '@/services/api/feedback';
import { isAuthenticated } from '@/lib/auth';
import { formatCurrency, formatDate } from '@/utils/format';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import { CheckoutOrder } from '@/types';
import { toast } from 'react-hot-toast';

// Import extracted components
import OrderConfirmationHeader from '@/components/checkout/OrderConfirmationHeader';
import OrderSummary from '@/components/checkout/OrderSummary';
import OrderItems from '@/components/checkout/OrderItems';
import OrderStatusSidebar from '@/components/checkout/OrderStatusSidebar';

// formatDate is now imported from @/utils/format

// Helper function to calculate order total from items
const calculateOrderTotal = (items: any[]): number => {
  if (!items || !Array.isArray(items) || items.length === 0) return 0;
  
  return items.reduce((sum, item) => {
    // Try to get price from different possible properties
    const price = Number(item.price || 
                        (item.product && item.product.price) || 
                        item.unit_price || 0);
    
    // Get quantity with fallback to 1
    const quantity = Number(item.quantity || 1);
    
    // Calculate line total
    const lineTotal = price * quantity;
    console.log(`Calculating line total: ${price} × ${quantity} = ${lineTotal}`);
    
    return sum + lineTotal;
  }, 0);
};

// Main page component
export default function CheckoutSuccessPage() {
  // Return the content directly without wrapping in Header/Footer
  // The Header/Footer will be added by the layout.tsx file
  return <CheckoutSuccessContent />;
}

// Content component that uses useSearchParams
function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawOrderData, setRawOrderData] = useState<any>(null);
  const [selectedProductForReview, setSelectedProductForReview] = useState<any>(null);
  const [reviewedProducts, setReviewedProducts] = useState<Set<string | number>>(new Set());
  
  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login?redirect=checkout/success');
      return;
    }
    
    // Check if order ID is provided
    if (!orderId) {
      setError('No order ID provided');
      setLoading(false);
      return;
    }
    
    // Check for localStorage data
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('checkout_additional_data');
      if (!storedData) {
        setError('Order data not found. Please try again.');
        setLoading(false);
        return;
      }
    }
    
    // Fetch order details
    const fetchOrder = async () => {
      try {
        const response = await ordersService.getOrder(orderId);
        
        if (!response) {
          throw new Error('Failed to fetch order details');
        }
        
        // Store the raw order data for direct access
        setRawOrderData(response);
        
        // Try to load additional order data from localStorage
        let additionalData = {};
        if (typeof window !== 'undefined') {
          try {
            const storedData = localStorage.getItem('checkout_additional_data');
            if (storedData) {
              additionalData = JSON.parse(storedData);
            }
          } catch (e) {
            console.error('Error parsing additional order data:', e);
          }
        }
        
        // Handle different API response formats
        let orderItems: any[] = [];
        let orderTotal = 0;
        
        // Cast response to any to handle different response formats
        const responseAny = response as any;
        
        if (responseAny.data && Array.isArray(responseAny.data.items)) {
          // Format: { data: { items: [...] } }
          orderItems = responseAny.data.items;
          orderTotal = responseAny.data.total_amount || calculateOrderTotal(orderItems);
        } else if (responseAny.data && typeof responseAny.data === 'object') {
          // Format: { data: { ... } }
          const data = responseAny.data;
          
          if (Array.isArray(data.items)) {
            // Format: { data: { items: [...] } }
            orderItems = data.items;
          } else if (Array.isArray(data.order_items)) {
            // Format: { data: { order_items: [...] } }
            orderItems = data.order_items;
          }
          
          orderTotal = data.total_amount || data.total || calculateOrderTotal(orderItems);
        } else if (Array.isArray(responseAny.items)) {
          // Format: { items: [...] }
          orderItems = responseAny.items;
          orderTotal = responseAny.total_amount || responseAny.total || calculateOrderTotal(orderItems);
        } else if (responseAny.order_items && Array.isArray(responseAny.order_items)) {
          // Format: { order_items: [...] }
          orderItems = responseAny.order_items;
          orderTotal = responseAny.total_amount || responseAny.total || calculateOrderTotal(orderItems);
        }
        
        const subtotal = responseAny.subtotal || 
                         (responseAny.data && responseAny.data.subtotal) || 
                         calculateOrderTotal(orderItems);
                         
        // Construct a normalized order object
        const normalizedOrder: CheckoutOrder = {
          id: responseAny.id || responseAny.order_id || (responseAny.data && responseAny.data.id) || orderId,
          status: responseAny.status || (responseAny.data && responseAny.data.status) || 'processing',
          created_at: responseAny.created_at || (responseAny.data && responseAny.data.created_at) || new Date().toISOString(),
          // Use items from localStorage if available, otherwise use API items
          items: (additionalData as any)?.items || orderItems,
          subtotal: (additionalData as any)?.subtotal || subtotal,
          total: (additionalData as any)?.total_amount || orderTotal,
          discount: (additionalData as any)?.discount || responseAny.discount || (responseAny.data && responseAny.data.discount) || 0,
          shipping_address: additionalData && (additionalData as any).shipping_address || {},
          payment_method: additionalData && (additionalData as any).payment_method || 'balance'
        };
        
        setOrder(normalizedOrder);
        setError(null);
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId, router]);
  
  const handleReviewSubmit = async (productId: number, rating: number, comment: string) => {
    try {      
      // Call the API to submit the review
      const response = await feedbackService.createFeedback({
        product_id: productId,
        rating,
        comment
      });
      
      // Add the product ID to the set of reviewed products
      setReviewedProducts(prev => new Set([...prev, productId]));
      
      // Close the review form
      setSelectedProductForReview(null);
      
      // Show success message
      toast.success('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    }
  };

  const handleReviewProduct = (item: any) => {
    setSelectedProductForReview(item);
  };
  
  const handleReviewSubmitted = (productId: string | number) => {
    setReviewedProducts(prev => {
      const newSet = new Set(prev);
      newSet.add(productId);
      return newSet;
    });
    setSelectedProductForReview(null);
    toast.success('Thank you for your review!');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <main className="flex-grow flex items-center justify-center">
          <LoadingOverlay visible={true} />
        </main>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <main className="flex-grow flex items-center justify-center">
          <div className="bg-neutral-900/80 backdrop-blur-sm rounded-lg border border-white/10 p-8 max-w-md w-full text-center">
            <svg className="w-16 h-16 text-amber-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold text-white mb-2">Order Not Found</h2>
            <p className="text-white/70 mb-6">{error}</p>
            <Link href="/" className="inline-block px-6 py-3 bg-amber-500 text-black rounded-md hover:bg-amber-400 transition-colors">
              Return to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <main className="flex-grow flex items-center justify-center">
          <div className="bg-neutral-900/80 backdrop-blur-sm rounded-lg border border-white/10 p-8 max-w-md w-full text-center">
            <svg className="w-16 h-16 text-amber-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold text-white mb-2">Order Not Available</h2>
            <p className="text-white/70 mb-6">We couldn't find the details for this order.</p>
            <Link href="/" className="inline-block px-6 py-3 bg-amber-500 text-black rounded-md hover:bg-amber-400 transition-colors">
              Return to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <main className="flex-grow py-8 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Order Confirmation Header */}
          <OrderConfirmationHeader orderId={order.id} />
          
          {/* Order Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Order Summary and Items */}
            <div className="lg:col-span-2">
              <OrderSummary 
                order={order} 
                rawOrderData={rawOrderData} 
                calculateOrderTotal={calculateOrderTotal} 
              />
              
              <OrderItems 
                items={order.items || []} 
                reviewedProducts={reviewedProducts}
                handleReviewProduct={handleReviewProduct}
                calculateOrderTotal={calculateOrderTotal}
                rawOrderData={rawOrderData}
              />
            </div>
            
            {/* Order Status Sidebar */}
            <OrderStatusSidebar 
              selectedProductForReview={selectedProductForReview}
              handleReviewSubmitted={handleReviewSubmitted}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/" className="px-6 py-3 bg-white/10 text-white rounded-md hover:bg-white/20 transition-colors text-center">
              Continue Shopping
            </Link>
            
            <Link href="/account/orders" className="px-6 py-3 bg-amber-500 text-black rounded-md hover:bg-amber-400 transition-colors text-center">
              View All Orders
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
