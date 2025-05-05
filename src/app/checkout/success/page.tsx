"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header, Footer } from '@/components';
import { ordersService } from '@/services/api/orders';
import { isAuthenticated } from '@/lib/auth';
import { formatCurrency } from '@/utils/format';

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
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import { CheckoutOrder } from '@/types';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  
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
        const response = await ordersService.getOrder(orderId);
        
        if (!response) {
          throw new Error('Failed to fetch order details');
        }
        
        // In a real app, we would use the actual order data from the API
        // For now, we'll create a mock order with the required fields
        // Use type assertion to handle the API response
        const orderData = response as any;
        
        setOrder({
          id: orderData.id || orderId || 'unknown',
          user_id: orderData.user_id || 'unknown',
          items: orderData.items || [],
          subtotal: typeof orderData.total === 'number' ? orderData.total : 0,
          discount: 0,
          total: typeof orderData.total === 'number' ? orderData.total : 0,
          status: orderData.status || 'processing',
          payment_method: orderData.payment_method || 'balance',
          payment_status: (orderData.payment_status || 'paid') as 'paid' | 'pending' | 'failed',
          shipping_address: typeof orderData.shipping_address === 'object' 
            ? orderData.shipping_address 
            : { 
                full_name: 'Customer', 
                address: typeof orderData.shipping_address === 'string' ? orderData.shipping_address : 'Address not provided', 
                city: '', 
                postal_code: '', 
                phone: ''
              },
          created_at: orderData.created_at || new Date().toISOString()
        });
      } catch (error) {
        console.error('Error fetching order:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId, router]);
  
  if (loading) {
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
  
  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-neutral-900/80 backdrop-blur-sm rounded-md border border-white/10 p-6 text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h1 className="text-2xl font-bold text-white mb-2">Order Not Found</h1>
            <p className="text-white/60 mb-6">{error || 'Unable to retrieve your order details'}</p>
            <Link href="/cart" className="inline-block px-6 py-3 bg-amber-500 text-black rounded-md hover:bg-amber-400 transition-colors">
              Return to Cart
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />
      <main className="flex-grow py-8 px-4 md:py-12 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-neutral-900/80 backdrop-blur-sm rounded-md border border-white/10 p-6 md:p-8 text-center mb-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h1>
            <p className="text-white/60 mb-6">Thank you for your purchase. Your order has been received and is being processed.</p>
            
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
                <p className="text-amber-500 font-bold">{formatCurrency(order.total)}</p>
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
                      <p className="text-white/60 text-sm">{formatCurrency(item.price)} each</p>
                    </div>
                  </div>
                  <div className="text-amber-500 font-medium">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-white/10 pt-4 space-y-2">
              <div className="flex justify-between text-white/70">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              
              {order.discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-white font-bold pt-2 border-t border-white/10">
                <span>Total</span>
                <span className="text-amber-500">{formatCurrency(order.total)}</span>
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
      <Footer />
    </div>
  );
}
