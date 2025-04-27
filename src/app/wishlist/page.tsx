"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { isAuthenticated } from "@/lib/auth";

// Mock wishlist data
interface WishlistItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  image: string;
  seller: string;
  inStock: boolean;
}

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login?redirect=wishlist');
      return;
    }

    // Simulate API call to get wishlist items
    const fetchWishlist = async () => {
      setLoading(true);
      try {
        // In a real app, we would fetch from an API
        // For now, we'll use mock data
        setTimeout(() => {
          setWishlistItems([
            {
              id: 1,
              productId: 101,
              name: "Arabica Premium Beans",
              price: 120000,
              image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=300",
              seller: "Java Coffee Co.",
              inStock: true
            },
            {
              id: 2,
              productId: 203,
              name: "Robusta Dark Roast",
              price: 85000,
              image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300",
              seller: "Bali Bean Farmers",
              inStock: true
            },
            {
              id: 3,
              productId: 305,
              name: "Sumatra Single Origin",
              price: 150000,
              image: "https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?q=80&w=300",
              seller: "Sumatra Coffee Collective",
              inStock: false
            },
            {
              id: 4,
              productId: 407,
              name: "Specialty Coffee Gift Set",
              price: 250000,
              image: "https://images.unsplash.com/photo-1610889556528-9a770e32642f?q=80&w=300",
              seller: "Jakarta Coffee House",
              inStock: true
            }
          ]);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [router]);

  const removeItem = (id: number) => {
    setWishlistItems(prevItems => prevItems.filter(item => item.id !== id));
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
                  <Link href={`/products/${item.productId}`}>
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                    href={`/products/${item.productId}`}
                    className="block text-white font-medium hover:text-amber-400 transition-colors mb-1"
                  >
                    {item.name}
                  </Link>
                  <p className="text-white/60 text-sm mb-3">Seller: {item.seller}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-amber-500 font-bold">{formatCurrency(item.price)}</span>
                    {item.inStock ? (
                      <button
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
