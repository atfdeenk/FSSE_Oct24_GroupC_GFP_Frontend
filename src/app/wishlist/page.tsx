"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import wishlistService, { WishlistItem } from "@/services/api/wishlist";
import productService from "@/services/api/products";
import cartService from "@/services/api/cart";
import { getProductImageUrl, handleProductImageError } from "@/utils/imageUtils";
import { Product } from "@/types/apiResponses";

// Extended wishlist item with product details
interface WishlistItemWithDetails extends WishlistItem {
  name?: string;
  price?: number;
  image_url?: string;
  seller?: string;
  inStock?: boolean;
}

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login?redirect=wishlist');
      return;
    }

    // Fetch wishlist items from API
    const fetchWishlist = async () => {
      setLoading(true);
      try {
        console.log('Fetching wishlist...');
        const wishlistResponse = await wishlistService.getWishlist();
        console.log('Wishlist response:', wishlistResponse);
        
        if (wishlistResponse && wishlistResponse.data && wishlistResponse.data.items) {
          // Get product details for each wishlist item
          const wishlistItems = wishlistResponse.data.items;
          console.log('Wishlist items:', wishlistItems);
          
          if (wishlistItems.length === 0) {
            setWishlistItems([]);
            setLoading(false);
            return;
          }
          
          const itemsWithDetails = await Promise.all(
            wishlistItems.map(async (item) => {
              try {
                console.log(`Fetching product details for product_id: ${item.product_id}`);
                const productResponse = await productService.getProduct(item.product_id);
                console.log(`Product response for ${item.product_id}:`, productResponse);
                
                if (productResponse) {
                  return {
                    ...item,
                    name: productResponse.name || 'Product not found',
                    price: productResponse.price || 0,
                    image_url: productResponse.image_url || '',
                    seller: `Vendor ID: ${productResponse.vendor_id || 'Unknown'}`,
                    inStock: (productResponse.stock_quantity || 0) > 0
                  };
                }
                return item;
              } catch (error) {
                console.error(`Error fetching product ${item.product_id}:`, error);
                return item;
              }
            })
          );
          
          console.log('Items with details:', itemsWithDetails);
          setWishlistItems(itemsWithDetails);
        } else {
          console.log('No wishlist items found');
          setWishlistItems([]);
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setWishlistItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [router]);

  const removeItem = async (id: number | string) => {
    try {
      setLoading(true);
      await wishlistService.removeFromWishlist(id);
      
      // Update local state
      setWishlistItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (error) {
      console.error(`Error removing item ${id} from wishlist:`, error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: number | string) => {
    try {
      setLoading(true);
      await cartService.addToCart({
        product_id: productId,
        quantity: 1
      });
      alert('Product added to cart!');
    } catch (error) {
      console.error(`Error adding product ${productId} to cart:`, error);
      alert('Failed to add product to cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-white mb-8">Your Wishlist</h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="bg-neutral-900/80 backdrop-blur-sm p-12 rounded-sm border border-white/10 text-center">
            <svg className="w-16 h-16 text-white/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-white mb-4">Your wishlist is empty</h2>
            <p className="text-white/60 mb-8">Save items you love for later by clicking the heart icon on product pages.</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map(item => (
              <div 
                key={item.id} 
                className="group bg-neutral-900/80 backdrop-blur-sm rounded-sm border border-white/10 overflow-hidden transition-all duration-300 hover:border-amber-500/20"
              >
                <div className="relative">
                  <Link href={`/products/${item.product_id}`}>
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={getProductImageUrl(item.image_url)} 
                        alt={item.name || 'Product'} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={handleProductImageError}
                      />
                    </div>
                    {!item.inStock && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <span className="bg-red-500/80 text-white px-3 py-1 rounded-sm text-sm font-medium">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </Link>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                
                <div className="p-4">
                  <Link 
                    href={`/products/${item.product_id}`}
                    className="block text-white font-medium hover:text-amber-400 transition-colors mb-1"
                  >
                    {item.name || 'Product'}
                  </Link>
                  <p className="text-white/60 text-sm mb-3">Seller: {item.seller || 'Unknown vendor'}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-amber-500 font-bold">{formatCurrency(item.price || 0)}</span>
                    {item.inStock ? (
                      <button
                        onClick={() => addToCart(item.product_id)}
                        className="bg-amber-500 text-black px-3 py-1 rounded-sm text-sm font-medium hover:bg-amber-400 transition-colors"
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <button
                        className="bg-neutral-700 text-white/50 px-3 py-1 rounded-sm text-sm font-medium cursor-not-allowed"
                        disabled
                      >
                        Unavailable
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
