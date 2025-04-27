"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import type { Product } from "../../../scripts/types/apiResponses";
import Footer from "../../../components/Footer";

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
    api.productById(productId)
      .then((res) => {
        if (!res) throw new Error("Product not found");
        setProduct(res as Product);
        // Fetch related products (mock implementation)
        return api.products();
      })
      .then((res) => {
        // Filter out current product and get 3 random products
        const productsData = res as { products: Product[] };
        const otherProducts = productsData.products.filter(
          (p: Product) => p.id !== parseInt(productId, 10)
        );
        const randomProducts = [...otherProducts]
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        setRelatedProducts(randomProducts);
      })
      .catch((e) => {
        setError(e?.message || "Failed to load product.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params?.id]);

  const handleAddToCart = () => {
    // Mock implementation - would connect to cart API
    alert(`Added ${quantity} ${product?.name} to cart`);
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
        <svg className="w-20 h-20 text-amber-500/50 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-3xl font-bold text-white mb-4">Product Not Found</h1>
        <p className="text-white/60 mb-8 text-center max-w-md">
          {error || "We couldn't find the product you're looking for. It may have been removed or is temporarily unavailable."}
        </p>
        <button
          onClick={() => router.push("/products")}
          className="px-6 py-3 bg-amber-500 text-black font-bold rounded-sm hover:bg-amber-400 transition-colors"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
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
            <div className="aspect-square overflow-hidden rounded-sm border border-white/10 bg-neutral-900/50">
              <img
                src={product.image_url || "/coffee-placeholder.jpg"}
                alt={product.name}
                className="w-full h-full object-cover"
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
                    src={product.image_url || "/coffee-placeholder.jpg"}
                    alt={`${product.name} view ${i + 1}`}
                    className="w-full h-full object-cover"
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
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{product.name}</h1>
              <p className="text-2xl font-mono text-amber-500 font-bold">
                {product.price} {product.currency}
              </p>
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
                <div className="space-y-4 text-white/80">
                  <p>{product.description}</p>
                  <p>This premium coffee is sourced directly from local farmers who use sustainable farming practices. Each batch is carefully selected and roasted to perfection to bring out the unique flavor profile.</p>
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
                            <p className="font-medium">Customer {i}</p>
                          </div>
                          <p className="text-white/60 text-sm">2 weeks ago</p>
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
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative w-full sm:w-32">
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 focus:outline-none focus:border-amber-500/50 text-white"
                  />
                  <div className="absolute right-0 top-0 h-full flex flex-col border-l border-white/10">
                    <button
                      className="flex-1 px-3 hover:bg-white/5 text-white/60 hover:text-white"
                      onClick={() => setQuantity(q => q + 1)}
                    >
                      +
                    </button>
                    <button
                      className="flex-1 px-3 hover:bg-white/5 text-white/60 hover:text-white border-t border-white/10"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    >
                      -
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-amber-500 text-black font-bold py-3 px-6 rounded-sm hover:bg-amber-400 transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart
                </button>
                <button className="w-12 h-12 flex items-center justify-center rounded-sm border border-white/10 hover:border-amber-500/30 hover:bg-white/5 transition-colors">
                  <svg className="w-5 h-5 text-white/60 hover:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
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
                  <p className="text-white/60 text-sm">{product.location}</p>
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
                      src={relatedProduct.image_url || "/coffee-placeholder.jpg"}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors duration-300">{relatedProduct.name}</h3>
                      <span className="font-mono text-amber-500 font-bold text-sm">{relatedProduct.price} {relatedProduct.currency}</span>
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
