"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ordersService } from '@/services/api/orders';
import { isAuthenticated } from '@/lib/auth';
import { formatCurrency } from '@/utils/format';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import ProductReviewForm from '@/components/ui/ProductReviewForm';
import { Header, Footer } from '@/components';
import { CheckoutOrder } from '@/types';
import { toast } from 'react-hot-toast';

// Define formatDate function inline to avoid import issues
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Format options
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error formatting date';
  }
};

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
    
    // Fetch order details
    const fetchOrder = async () => {
      try {
        console.log('Fetching order with ID:', orderId);
        const response = await ordersService.getOrder(orderId);
        console.log('Order API response:', response);
        
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
              console.log('Found additional order data:', additionalData);
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
        
        // Calculate subtotal from order items if not available in the response
        const subtotal = responseAny.subtotal || 
                         (responseAny.data && responseAny.data.subtotal) || 
                         calculateOrderTotal(orderItems);
                         
        // Construct a normalized order object
        const normalizedOrder: CheckoutOrder = {
          id: responseAny.id || responseAny.order_id || (responseAny.data && responseAny.data.id) || orderId,
          status: responseAny.status || (responseAny.data && responseAny.data.status) || 'processing',
          created_at: responseAny.created_at || (responseAny.data && responseAny.data.created_at) || new Date().toISOString(),
          items: orderItems,
          subtotal: subtotal,
          total: orderTotal,
          discount: responseAny.discount || (responseAny.data && responseAny.data.discount) || 0,
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
  
  const handleReviewProduct = (product: any) => {
    setSelectedProductForReview(product);
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
          <div className="bg-neutral-900/80 backdrop-blur-sm rounded-lg border border-white/10 p-6 md:p-8 text-center mb-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">Order Confirmed!</h1>
            <p className="text-white/70 mb-6">Thank you for your purchase. Your order has been received and is being processed.</p>
            
            <div className="inline-block bg-black/30 rounded-md px-4 py-2 mb-6">
              <p className="text-white/70 text-sm">Order ID</p>
              <p className="text-amber-500 font-mono font-medium">{order.id}</p>
            </div>
          </div>
          
          {/* Order Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-neutral-900/80 backdrop-blur-sm rounded-lg border border-white/10 p-6 md:p-8 mb-6">
                <h2 className="text-xl font-bold text-white mb-4">Order Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-white/70 text-sm mb-1">Order Date</h3>
                    <p className="text-white font-medium">{formatDate(order.created_at)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-white/70 text-sm mb-1">Order Status</h3>
                    <div className="flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      <p className="text-white font-medium capitalize">{order.status}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-white/70 text-sm mb-1">Payment Method</h3>
                    <p className="text-white font-medium capitalize">
                      {order.payment_method === 'balance' ? 'Wallet Balance' : 'Cash on Delivery'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-white/70 text-sm mb-1">Total Amount</h3>
                    <p className="text-amber-500 font-medium">
                      {formatCurrency(
                        rawOrderData?.total_amount || 
                        rawOrderData?.data?.total_amount ||
                        (order.total > 0 ? order.total : 
                          calculateOrderTotal(order.items) - (order.discount || 0)
                        )
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-white font-medium mb-3">Shipping Address</h3>
                  <p className="text-white/70">
                    {order.shipping_address?.full_name}<br />
                    {order.shipping_address?.address}<br />
                    {order.shipping_address?.city}, {order.shipping_address?.postal_code}<br />
                    {order.shipping_address?.phone}
                  </p>
                </div>
              </div>
              
              {/* Order Items */}
              <div className="bg-neutral-900/80 backdrop-blur-sm rounded-lg border border-white/10 p-6 md:p-8">
                <h2 className="text-xl font-bold text-white mb-4">Order Items</h2>
                
                <div className="space-y-4 mb-6">
                  {order.items?.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between border-b border-white/10 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-neutral-800 rounded-md flex items-center justify-center text-white/30 flex-shrink-0">
                          <span className="text-sm font-medium">{item.quantity}x</span>
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{item.product?.name || `Product #${item.product_id}`}</h3>
                          <p className="text-white/60 text-sm">{formatCurrency(item.price || item.product?.price || 0)} each</p>
                          
                          {/* Review button */}
                          {!reviewedProducts.has(item.product_id) && (
                            <button 
                              onClick={() => handleReviewProduct(item)}
                              className="text-amber-500 text-sm mt-1 hover:text-amber-400 transition-colors flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                              Leave a Review
                            </button>
                          )}
                          
                          {reviewedProducts.has(item.product_id) && (
                            <div className="text-green-500 text-sm mt-1 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Review Submitted
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-amber-500 font-medium">
                        {formatCurrency((item.price || item.product?.price || 0) * (item.quantity || 1))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-white/10 pt-4 space-y-2">
                  <div className="flex justify-between text-white/70">
                    <span>Subtotal</span>
                    <span>
                      {formatCurrency(
                        // First try to get the subtotal directly from rawOrderData
                        rawOrderData?.subtotal || 
                        rawOrderData?.data?.subtotal ||
                        // Then calculate it from items if not available
                        calculateOrderTotal(order.items)
                      )}
                    </span>
                  </div>
                  
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount</span>
                      <span>-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-white font-bold pt-2 border-t border-white/10">
                    <span>Total</span>
                    <span className="text-amber-500">
                      {formatCurrency(
                        // First try to get the total directly from rawOrderData
                        rawOrderData?.total_amount || 
                        rawOrderData?.data?.total_amount ||
                        // Then try to get it from the order object
                        (order.total > 0 ? order.total : 
                          // Finally, calculate it from items if all else fails
                          calculateOrderTotal(order.items) - (order.discount || 0)
                        )
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Review Form or Next Steps */}
            <div className="lg:col-span-1">
              {selectedProductForReview ? (
                <ProductReviewForm 
                  productId={selectedProductForReview.product_id}
                  productName={selectedProductForReview.product?.name || `Product #${selectedProductForReview.product_id}`}
                  onReviewSubmitted={() => handleReviewSubmitted(selectedProductForReview.product_id)}
                  className="sticky top-4"
                />
              ) : (
                <div className="bg-neutral-900/80 backdrop-blur-sm rounded-lg border border-white/10 p-6 sticky top-4">
                  <h3 className="text-lg font-medium text-white mb-4">What's Next?</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-amber-500/20 rounded-full w-8 h-8 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                        <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Order Confirmation</h4>
                        <p className="text-white/60 text-sm mt-1">You'll receive an email confirmation with your order details.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-amber-500/20 rounded-full w-8 h-8 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                        <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Order Processing</h4>
                        <p className="text-white/60 text-sm mt-1">Your order is being prepared by the local producer.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-amber-500/20 rounded-full w-8 h-8 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                        <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Delivery</h4>
                        <p className="text-white/60 text-sm mt-1">Your items will be delivered to your shipping address.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-amber-500/20 rounded-full w-8 h-8 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                        <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Leave Reviews</h4>
                        <p className="text-white/60 text-sm mt-1">Share your experience with the products you've purchased.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <h4 className="font-medium text-white mb-3">Need Help?</h4>
                    <p className="text-white/60 text-sm mb-4">If you have any questions about your order, please contact our support team.</p>
                    
                    <Link href="/contact" className="block w-full py-2 bg-white/10 text-white text-center rounded-md hover:bg-white/20 transition-colors">
                      Contact Support
                    </Link>
                  </div>
                </div>
              )}
            </div>
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
