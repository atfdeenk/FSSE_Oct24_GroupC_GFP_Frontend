"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import productService from '@/services/api/products';
import cartService from '@/services/api/cart';
import type { Product } from '@/types/apiResponses';
import { Header, Footer } from '@/components';
import Toast from '@/components/ui/Toast';
import ErrorState from "@/components/ui/ErrorState";
import { getImageUrl, handleImageError } from '@/utils/imageUtils';
import ProductInfo from "@/components/ui/ProductInfo";
import SellerInfo from "@/components/ui/SellerInfo";
import AddToCartButton from "@/components/ui/AddToCartButton";
import QuantityInput from "@/components/ui/QuantityInput";
import ProductImages from "@/components/ui/ProductImages";
import RelatedProducts from "@/components/ui/RelatedProducts";

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
      await cartService.addToCart({
        product_id: product.id,
        quantity: quantity
      });
      setCartMessage({
        type: 'success',
        text: `Added ${quantity} ${product.name} to cart!`
      });
      // Refresh the header cart count
      const event = new CustomEvent('cart-updated');
      window.dispatchEvent(event);
      // Clear success message after 3 seconds
      setTimeout(() => setCartMessage(null), 3000);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      setCartMessage({
        type: 'error',
        text: error?.message || 'Failed to add item to cart'
      });
    } finally {
      setAddingToCart(false);
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
      <ErrorState
        title="Product Not Found"
        message={error || "We couldn't find the product you're looking for. It might have been removed or is temporarily unavailable."}
        icon={
          <svg className="w-16 h-16 text-amber-500 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        buttonLabel="Back to Products"
        onButtonClick={() => router.push("/products")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      {/* Toast Notification */}
      {cartMessage && (
        <Toast
          message={cartMessage.text}
          type={cartMessage.type}
          onClose={() => setCartMessage(null)}
        />
      )}
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
      <div className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <ProductImages imageUrl={product.image_url} name={product.name} />
          {/* Product Info */}
          <div className="flex flex-col gap-8">
            <ProductInfo product={product} activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Add to Cart */}
            <div className="pt-2 border-t border-white">
              <div className="flex flex-col space-y-4 mt-6">
                <div className="flex items-center gap-8">
                  <QuantityInput
                    value={quantity}
                    min={1}
                    onChange={q => setQuantity(q)}
                    disabled={addingToCart}
                  />
                  <AddToCartButton
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    loading={addingToCart}
                  />
                </div>
              </div>
            </div>
            {/* Seller Info */}
            <SellerInfo
              name={typeof product.vendor_id === 'string' ? product.vendor_id : `Seller #${product.vendor_id}`}
              location={product.location}
              onViewProfile={() => { }}
            />
          </div>
        </div>

        {/* Related Products */}
        <RelatedProducts products={relatedProducts} />
        <Footer />
      </div>
    </div>
  );
}
