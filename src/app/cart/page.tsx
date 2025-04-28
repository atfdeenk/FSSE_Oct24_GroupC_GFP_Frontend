"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import cartService from "@/services/api/cart";
import productService from "@/services/api/products";
import { getProductImageUrl, handleProductImageError } from "@/utils/imageUtils";
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
                  product_id: item.product_id
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
        } else {
          console.log('No cart items found');
          setCartItems([]);
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
    } catch (error) {
      console.error(`Error removing item ${id} from cart:`, error);
    } finally {
      setLoading(false);
    }
  };

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

  // Calculate subtotal from cart items
  const subtotal = cartItems.reduce((sum, item) => {
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
      
      <main className="flex-grow w-full max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">Your Cart</h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-neutral-900/80 backdrop-blur-sm p-12 rounded-sm border border-white/10 text-center">
            <svg className="w-16 h-16 text-white/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
            <p className="text-white/60 mb-8">Looks like you haven't added any products to your cart yet.</p>
            <Link 
              href="/products" 
              className="inline-flex items-center px-8 py-3 bg-amber-500 text-black rounded-sm hover:bg-amber-400 font-bold transition-all duration-300"
            >
              <span>Browse Products</span>
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-neutral-900/80 backdrop-blur-sm rounded-sm border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h2 className="text-xl font-bold text-white">Cart Items ({cartItems.length})</h2>
                </div>
                
                <ul className="divide-y divide-white/10">
                  {cartItems.map(item => (
                    <li key={item.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center">
                      <div className="flex-shrink-0 w-24 h-24 bg-neutral-800 rounded-sm overflow-hidden">
                        <img 
                          src={getProductImageUrl(item.image_url)} 
                          alt={item.name || 'Product'}
                          className="w-full h-full object-cover"
                          onError={handleProductImageError}
                        />
                      </div>
                      
                      <div className="flex-grow">
                        <Link href={`/products/${item.product_id}`} className="text-white font-medium hover:text-amber-400 transition-colors">
                          <h3 className="font-medium text-white">{item.name || 'Product'}</h3>
                        </Link>
                        <p className="text-white/60 text-sm">Seller: {item.seller || 'Unknown vendor'}</p>
                        <div className="text-amber-500 font-mono">{formatCurrency(item.unit_price || 0)}</div>
                      </div>
                      
                      <div className="flex items-center mt-4 sm:mt-0">
                        <div className="flex items-center border border-white/20 rounded-sm overflow-hidden mr-4">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-10 text-center text-white">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          aria-label="Remove item"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-neutral-900/80 backdrop-blur-sm rounded-sm border border-white/10 sticky top-24">
                <div className="p-6 border-b border-white/10">
                  <h2 className="text-xl font-bold text-white">Order Summary</h2>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-white/70">Subtotal</span>
                      <span className="text-white font-medium">{formatCurrency(subtotal)}</span>
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
                  <div className="mb-6">
                    <label className="block text-white/70 text-sm mb-2">Promo Code</label>
                    <div className="flex">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="bg-black/50 border border-white/10 rounded-l-sm px-4 py-2 w-full text-white focus:outline-none focus:border-amber-500/50"
                        placeholder="Enter code"
                      />
                      <button
                        onClick={applyPromoCode}
                        className="bg-amber-500 text-black px-4 py-2 rounded-r-sm font-medium hover:bg-amber-400 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    {promoError && <p className="text-red-400 text-sm mt-1">{promoError}</p>}
                    {promoDiscount > 0 && <p className="text-amber-400 text-sm mt-1">Promo code applied successfully!</p>}
                  </div>
                  
                  <button
                    className="w-full bg-amber-500 text-black py-3 rounded-sm font-bold hover:bg-amber-400 transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                  
                  <div className="mt-4 text-center">
                    <Link href="/products" className="text-amber-500 hover:text-amber-400 text-sm">
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
