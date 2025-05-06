"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ordersService } from '@/services/api/orders';
import { isAuthenticated } from '@/lib/auth';
import { formatCurrency } from '@/utils/format';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import { CheckoutOrder } from '@/types';

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

// Main page component - layout is now handled by layout.tsx
export default function CheckoutSuccessPage() {
  // The Suspense boundary is now in layout.tsx
  return <CheckoutSuccessContent />;
}

// Content component that uses useSearchParams
function CheckoutSuccessContent() {
  const router = useRouter();
  // This hook needs to be wrapped in Suspense (which we've done at the parent level)
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawOrderData, setRawOrderData] = useState<any>(null);
  
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
        const responseData = response as any;
        
        // Log the entire response to debug
        console.log('Raw API response data:', JSON.stringify(responseData, null, 2));
        
        // First try to get the total amount directly from the response
        if (responseData.total_amount && typeof responseData.total_amount === 'number') {
          console.log('Found total_amount in response:', responseData.total_amount);
          orderTotal = responseData.total_amount;
        } else if (responseData.data?.total_amount && typeof responseData.data.total_amount === 'number') {
          console.log('Found total_amount in response.data:', responseData.data.total_amount);
          orderTotal = responseData.data.total_amount;
        } else if (responseData.total && typeof responseData.total === 'number') {
          console.log('Found total in response:', responseData.total);
          orderTotal = responseData.total;
        }
        
        // Try to extract items from the response
        if (responseData.items && Array.isArray(responseData.items)) {
          // New API format with items at the top level
          orderItems = responseData.items.map((item: any) => {
            // Ensure we have a valid unit_price
            const unitPrice = Number(item.unit_price) || 0;
            console.log(`Item ${item.product_id} unit price:`, unitPrice);
            
            return {
              id: item.product_id,
              product_id: item.product_id,
              quantity: Number(item.quantity) || 1,
              price: unitPrice,
              unit_price: unitPrice,
              product: {
                id: item.product_id,
                name: item.product_name || `Product #${item.product_id}`,
                image_url: item.image_url || '/images/product-placeholder.png',
                price: unitPrice
              }
            };
          });
          
          // If we didn't find a total in the response, calculate it from items
          if (orderTotal === 0) {
            // Calculate total from items with explicit number conversion
            let calculatedTotal = 0;
            for (const item of orderItems) {
              const price = Number(item.price || item.unit_price || 0);
              const quantity = Number(item.quantity || 1);
              const lineTotal = price * quantity;
              console.log(`Item ${item.product_id}: ${price} × ${quantity} = ${lineTotal}`);
              calculatedTotal += lineTotal;
            }
            
            orderTotal = calculatedTotal;
            console.log('Calculated order total from items:', orderTotal);
          }
        } else if (responseData.data && responseData.data.items) {
          // Old format with items in the data property
          orderItems = responseData.data.items;
          orderTotal = responseData.data.total || 0;
        }
        
        // Create a complete order object with all required fields
        setOrder({
          id: responseData.order_id || responseData.id || (responseData.data && responseData.data.id) || orderId || 'unknown',
          user_id: (responseData.data && responseData.data.user_id) || 'unknown',
          items: orderItems,
          subtotal: orderTotal,
          discount: 0,
          total: orderTotal,
          payment_method: responseData.payment_method || (responseData.data && responseData.data.payment_method) || 'balance',
          payment_status: responseData.payment_status || (responseData.data && responseData.data.payment_status) || 'pending',
          shipping_method: responseData.shipping_method || (responseData.data && responseData.data.shipping_method) || 'standard',
          shipping_address: responseData.shipping_address || (responseData.data && responseData.data.shipping_address) || {
            full_name: (additionalData as any).name || 'Customer',
            address: (additionalData as any).address || 'No address provided',
            city: (additionalData as any).city || 'Unknown',
            postal_code: (additionalData as any).postalCode || '00000',
            phone: (additionalData as any).phone || 'No phone provided'
          },
          status: responseData.status || (responseData.data && responseData.data.status) || 'processing',
          created_at: responseData.created_at || (responseData.data && responseData.data.created_at) || new Date().toISOString(),
          updated_at: responseData.updated_at || (responseData.data && responseData.data.updated_at) || new Date().toISOString()
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Failed to fetch order details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId, router]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <LoadingOverlay visible={true} />
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-neutral-900/80 backdrop-blur-sm rounded-md border border-white/10 p-6 md:p-8 max-w-md w-full text-center">
          <svg className="w-16 h-16 mx-auto text-amber-500/70 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">{error ? 'Error' : 'Order Not Found'}</h2>
          <p className="text-white/70 mb-6">
            {error || 'We couldn\'t find the order you\'re looking for. It may have been removed or you may have the wrong link.'}
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/" className="px-6 py-3 bg-white/10 text-white rounded-md hover:bg-white/20 transition-colors">
              Return Home
            </Link>
            <Link href="/account/orders" className="px-6 py-3 bg-amber-500 text-black rounded-md hover:bg-amber-400 transition-colors">
              View Orders
            </Link>
          </div>
        </div>
      </main>
    );
  }
  
  return (
    <main className="flex-grow py-8 px-4 md:py-12 md:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-neutral-900/80 backdrop-blur-sm rounded-md border border-white/10 p-6 md:p-8 text-center mb-8">
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
        
        <div className="bg-neutral-900/80 backdrop-blur-sm rounded-md border border-white/10 p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Order Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-white/70 text-sm mb-1">Order Date</h3>
              <p className="text-white font-medium">{formatDate(order.created_at)}</p>
            </div>
            
            <div>
              <h3 className="text-white/70 text-sm mb-1">Payment Method</h3>
              <p className="text-white font-medium capitalize">
                {order.payment_method === 'balance' ? 'BumiBrew Balance' : 'Cash on Delivery'}
              </p>
            </div>
            
            <div>
              <h3 className="text-white/70 text-sm mb-1">Order Status</h3>
              <div className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                <span className="text-white font-medium capitalize">{order.status || 'Processing'}</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-white/70 text-sm mb-1">Total Amount</h3>
              <p className="text-amber-500 font-bold">
                {formatCurrency(
                  // First try to get the total directly from rawOrderData
                  rawOrderData?.total_amount || 
                  rawOrderData?.data?.total_amount ||
                  // Then try to get it from the order object
                  (order.total > 0 ? order.total : 
                    // Finally, calculate it from items if all else fails
                    order.items.reduce((sum, item) => {
                      const price = Number(item.price || (item.product && item.product.price) || 0);
                      const quantity = Number(item.quantity || 1);
                      return sum + (price * quantity);
                    }, 0)
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
        
        <div className="bg-neutral-900/80 backdrop-blur-sm rounded-md border border-white/10 p-6 md:p-8 mb-8">
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
  );
}
