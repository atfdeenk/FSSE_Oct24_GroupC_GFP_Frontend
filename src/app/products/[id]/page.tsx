"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import productService from '../../../services/api/products';
import cartService from '../../../services/api/cart';
import type { Product } from '../../../types/apiResponses';
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { getImageUrl, handleImageError } from '../../../utils/imageUtils';

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const productId = params?.id as string;
    if (!productId) return;

    setLoading(true);
    productService.getProduct(productId)
      .then((res) => {
        if (!res) throw new Error("Product not found");
        setProduct(res);
        // Fetch related products
        return productService.getProducts({ limit: 4 });
      })
      .then((res) => {
        // Filter out current product and get 3 random products
        if (!res || !res.products) {
          // Handle empty response gracefully
          setRelatedProducts([]);
          return;
        }
        const otherProducts = res.products.filter(
          (p: Product) => p.id !== parseInt(productId, 10)
        );
        const randomProducts = [...otherProducts]
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        setRelatedProducts(randomProducts);
      })
      .catch((error: any) => {
        console.error('Error loading product:', error);
        setError(error?.message || "Failed to load product.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params?.id]);

  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleAddToCart = async () => {
    if (!product) return;
    
    setAddingToCart(true);
    setCartMessage(null);
    
    try {
      const response = await cartService.addToCart({
        product_id: product.id,
        quantity: quantity
      });
      
      if (response.success) {
        setCartMessage({ 
          type: 'success', 
          text: `Added ${quantity} ${product.name} to cart!` 
        });
        
        // Refresh the header cart count
        const event = new CustomEvent('cart-updated');
        window.dispatchEvent(event);
      } else {
        setCartMessage({ 
          type: 'error', 
          text: response.message || 'Failed to add item to cart' 
        });
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      setCartMessage({ 
        type: 'error', 
        text: error?.message || 'Failed to add item to cart' 
      });
    } finally {
      setAddingToCart(false);
    }
    
    // Clear success message after 3 seconds
    if (cartMessage?.type === 'success') {
      setTimeout(() => setCartMessage(null), 3000);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) setQuantity(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-t-4 border-amber-500 border-solid rounded-full animate-spin mb-4"></div>
          <p className="text-white/70">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center max-w-md">
          <svg className="w-16 h-16 text-amber-500 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-white mb-4">Product Not Found</h1>
          <p className="text-white/60 mb-8">{error || "We couldn't find the product you're looking for. It might have been removed or is temporarily unavailable."}</p>
          <button
            onClick={() => router.push("/products")}
            className="px-6 py-3 bg-amber-500 text-black font-bold rounded-sm hover:bg-amber-400 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      {/* Breadcrumb */}
      <div className="bg-neutral-900/50 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-2 text-sm text-white/60">
            <a href="/" className="hover:text-amber-400 transition-colors">Home</a>
            <span>/</span>
            <a href="/products" className="hover:text-amber-400 transition-colors">Products</a>
            <span>/</span>
            <span className="text-amber-500 truncate">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-6">
            <div className="relative h-80 overflow-hidden bg-neutral-900 rounded-t-sm">
              <img
                src={getImageUrl(product.image_url)}
                alt={product.name}
                className="w-full h-full object-cover rounded-md"
                onError={handleImageError()}
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {/* Thumbnail images - in a real app, you'd have multiple images */}
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square overflow-hidden rounded-sm cursor-pointer border ${i === 0 ? 'border-amber-500' : 'border-white/10'} bg-neutral-900/50`}
                >
                  <img
                    src={getImageUrl(product.image_url)}
                    alt={`${product.name} view ${i + 1}`}
                    className="w-full h-full object-cover"
                    onError={handleImageError()}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center mb-2">
                <span className="inline-block bg-amber-500/90 text-black text-xs font-bold px-3 py-1 rounded-sm mr-3">
                  {product.location}
                </span>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-white/60 text-sm">(24 reviews)</span>
              </div>
              <h1 className="text-3xl font-bold text-white">{product.name}</h1>
              <p className="text-xl font-bold text-amber-500">{product.currency || 'IDR'} {product.price.toFixed(2)}</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-white/10">
              <div className="flex space-x-8">
                <button
                  className={`pb-2 font-medium text-sm ${activeTab === "description" ? "text-amber-500 border-b-2 border-amber-500" : "text-white/60 hover:text-white/80"}`}
                  onClick={() => setActiveTab("description")}
                >
                  Description
                </button>
                <button
                  className={`pb-2 font-medium text-sm ${activeTab === "details" ? "text-amber-500 border-b-2 border-amber-500" : "text-white/60 hover:text-white/80"}`}
                  onClick={() => setActiveTab("details")}
                >
                  Details
                </button>
                <button
                  className={`pb-2 font-medium text-sm ${activeTab === "reviews" ? "text-amber-500 border-b-2 border-amber-500" : "text-white/60 hover:text-white/80"}`}
                  onClick={() => setActiveTab("reviews")}
                >
                  Reviews (24)
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[200px]">
              {activeTab === "description" && (
                <div className="prose prose-invert max-w-none">
                  <p>{product.description}</p>
                </div>
              )}

              {activeTab === "details" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-900/50 p-4 rounded-sm">
                      <p className="text-white/60 text-sm mb-1">Origin</p>
                      <p className="font-medium">{product.location}</p>
                    </div>
                    <div className="bg-neutral-900/50 p-4 rounded-sm">
                      <p className="text-white/60 text-sm mb-1">Process</p>
                      <p className="font-medium">Washed</p>
                    </div>
                    <div className="bg-neutral-900/50 p-4 rounded-sm">
                      <p className="text-white/60 text-sm mb-1">Roast Level</p>
                      <p className="font-medium">Medium</p>
                    </div>
                    <div className="bg-neutral-900/50 p-4 rounded-sm">
                      <p className="text-white/60 text-sm mb-1">Flavor Notes</p>
                      <p className="font-medium">Chocolate, Citrus, Nutty</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-6">
                  {/* Sample reviews */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border-b border-white/10 pb-6 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center mb-1">
                            <div className="flex text-amber-500 mr-2">
                              {[...Array(5)].map((_, j) => (
                                <svg key={j} className="w-4 h-4" fill={j < 5 - (i % 2) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={j < 5 - (i % 2) ? 0 : 2} d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
                                </svg>
                              ))}
                            </div>
                            <h3 className="text-lg font-medium text-white">{product.name}</h3>
                          </div>
                          <p className="text-white/60 text-sm mb-2">2 weeks ago</p>
                        </div>
                        <div className="bg-amber-500/10 text-amber-500 text-xs px-2 py-1 rounded-sm">
                          Verified Purchase
                        </div>
                      </div>
                      <p className="text-white/80">
                        {i === 1 ? "Excellent coffee! The flavor is rich and complex, and I love that it's locally sourced." :
                          i === 2 ? "Great quality for the price. Will definitely buy again." :
                            "This has become my go-to morning coffee. Smooth with no bitterness."}
                      </p>
                    </div>
                  ))}
                  <button className="text-amber-500 font-medium hover:text-amber-400 transition-colors">
                    View all 24 reviews
                  </button>
                </div>
              )}
            </div>

            {/* Add to Cart */}
            <div className="pt-6 border-t border-white/10">
              <div className="flex flex-col space-y-4 mt-6">
                <div className="flex items-center space-x-4">
                  <div className="relative w-24">
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-full bg-black/50 border border-white/10 rounded-sm px-3 py-2 text-white focus:outline-none focus:border-amber-500/50 disabled:opacity-50"
                      disabled={addingToCart}
                    />
                    <div className="absolute right-0 top-0 h-full flex flex-col border-l border-white/10">
                      <button
                        className="flex-1 px-3 hover:bg-white/5 text-white/60 hover:text-white"
                        onClick={() => setQuantity(q => q + 1)}
                        disabled={addingToCart}
                      >
                        +
                      </button>
                      <button
                        className="flex-1 px-3 hover:bg-white/5 text-white/60 hover:text-white border-t border-white/10"
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        disabled={addingToCart}
                      >
                        -
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className={`flex-grow py-2 px-6 rounded-sm font-bold transition-all duration-300 flex items-center justify-center space-x-2 ${addingToCart ? 'bg-amber-700 text-white/70 cursor-wait' : 'bg-amber-500 text-black hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20 transform hover:translate-y-[-1px]'}`}
                  >
                    {addingToCart ? (
                      <>
                        <svg className="animate-spin w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Adding to Cart...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
                
                {/* Cart Message */}
                {cartMessage && (
                  <div className="mt-4">
                    <div className={`p-3 rounded-sm text-sm flex items-center ${cartMessage.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {cartMessage.type === 'success' ? (
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {cartMessage?.text}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-neutral-900/50 p-6 rounded-sm border border-white/5">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-amber-500/20 mr-4">
                  <img
                    src="/seller-avatar.jpg"
                    alt="Seller"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://ui-avatars.com/api/?name=Local+Seller&background=amber&color=fff';
                    }}
                  />
                </div>
                <div>
                  <p className="font-medium">Local Seller</p>
                  <p className="text-white/60">{product.location || 'Location not specified'}</p>
                </div>
                <button className="ml-auto text-amber-500 font-medium hover:text-amber-400 transition-colors">
                  View Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <h2 className="text-2xl font-bold text-white mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProducts.map(relatedProduct => (
                <a
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.id}`}
                  className="group bg-neutral-900/50 backdrop-blur-sm rounded-sm overflow-hidden border border-white/5 hover:border-amber-500/30 transition-all duration-300 flex flex-col h-full"
                >
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={getImageUrl(relatedProduct.image_url)}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                      onError={handleImageError()}
                    />
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors duration-300">{relatedProduct.name}</h3>
                      <span className="font-mono text-amber-500 font-bold text-sm">{relatedProduct.currency || 'IDR'} {relatedProduct.price.toFixed(2)}</span>
                    </div>

                    <p className="text-white/60 text-xs mb-2 line-clamp-2">{relatedProduct.description}</p>

                    <div className="mt-auto pt-2 border-t border-white/5">
                      <span className="inline-flex items-center text-amber-500 text-sm font-medium group-hover:text-amber-400 transition-colors">
                        View Details
                        <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
