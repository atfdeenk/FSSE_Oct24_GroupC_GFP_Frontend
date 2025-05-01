// src/components/ui/ProductCard.tsx
"use client";
import React from "react";
import HeartIcon from "@/components/ui/HeartIcon";
import CartIcon from "@/components/ui/CartIcon";
import { useState } from 'react';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useCart } from '@/hooks/useCart';
import type { Product } from '@/types/apiResponses';
import { getImageUrl, handleImageError } from '@/utils/imageUtils';
// Import ProductImage directly from products/page.tsx
import ProductImage from '@/components/ui/ProductImage';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [cartLoading, setCartLoading] = useState(false);
  const { isLoggedIn } = useAuthUser();
  const { addToCartWithCountCheck } = useCart();

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (cartLoading) return;
    if (!isLoggedIn) {
      window.location.href = '/login?redirect=cart';
      return;
    }
    setCartLoading(true);
    try {
      await addToCartWithCountCheck({ product_id: product.id, quantity: 1 });
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } finally {
      setCartLoading(false);
    }
  };


  return (
    <a
      href={`/products/${product.id}`}
      className="group bg-neutral-900/80 backdrop-blur-sm border border-white/10 shadow-lg hover:shadow-2xl transition-shadow duration-200 flex flex-col h-full overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
      tabIndex={0}
      aria-label={`View details for ${product.name}`}
    >
      {/* Product image + wishlist icon */}
      <div className="relative w-full aspect-[4/3] bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        <ProductImage
          src={getImageUrl(product.image_url)}
          alt={product.name}
          width={400}
          height={300}
          className="transition-transform duration-300 group-hover:scale-105"
          onError={handleImageError}
        />
        {/* Wishlist heart icon button */}
        {/* Wishlist heart icon button (top-right) */}
        <div className="absolute top-2 right-2 z-10">
          <button
            type="button"
            aria-label="Add to wishlist"
            className="rounded-full bg-white/90 dark:bg-neutral-900/80 p-1 shadow hover:bg-amber-100 dark:hover:bg-amber-400/10 transition-all duration-300 ease-out opacity-0 scale-90 translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:scale-100 group-focus-within:translate-y-0 focus:opacity-100 focus:scale-100 focus:translate-y-0 focus-visible:opacity-100 focus-visible:scale-100 focus-visible:translate-y-0 pointer-events-auto"
          >
            <HeartIcon className="w-6 h-6 text-amber-400 group-hover/wishlist:fill-amber-400 group-hover/wishlist:text-amber-500 transition-colors" />
          </button>
        </div>
        {/* Cart icon button (bottom-right) */}
        <div className="absolute bottom-2 right-2 z-10">
          <button
            type="button"
            aria-label="Add to cart"
            className="rounded-full bg-white/90 dark:bg-neutral-900/80 p-1 shadow hover:bg-amber-100 dark:hover:bg-amber-400/10 transition-all duration-300 ease-out opacity-0 scale-90 translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:scale-100 group-focus-within:translate-y-0 focus:opacity-100 focus:scale-100 focus:translate-y-0 focus-visible:opacity-100 focus-visible:scale-100 focus-visible:translate-y-0 pointer-events-auto"
            onClick={handleAddToCart}
            disabled={cartLoading}
          >
            {cartLoading ? (
              <svg className="w-5 h-5 animate-spin text-amber-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <CartIcon className="w-6 h-6 text-amber-500 group-hover/cart:fill-amber-400 group-hover/cart:text-amber-600 transition-colors" />
            )}
          </button>
        </div>
      </div>
      {/* Card content */}
      <div className="flex flex-col gap-1 p-3 flex-1">
        {/* Categories badge group */}
        {product.categories && product.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1">
            {product.categories.map((cat) => {
              // Helper to determine badge style
              const getCategoryBadgeClass = (name: string) => {
                const n = name.toLowerCase();
                if (n.includes('premium')) {
                  return 'bg-gradient-to-r from-amber-400 to-yellow-200 text-amber-900 border border-amber-300 dark:from-yellow-500 dark:to-yellow-300 dark:text-yellow-900';
                } else if (n.includes('standard')) {
                  return 'bg-neutral-200/80 text-neutral-700 border border-neutral-300 dark:bg-neutral-700/70 dark:text-white dark:border-neutral-500';
                } else if (n.includes('first grade')) {
                  return 'bg-green-100/80 text-green-800 border border-green-300 dark:bg-green-900/70 dark:text-green-200 dark:border-green-700';
                } else if (n.includes('second grade')) {
                  return 'bg-blue-100/80 text-blue-800 border border-blue-300 dark:bg-blue-900/70 dark:text-blue-200 dark:border-blue-700';
                } else if (n.includes('third grade')) {
                  return 'bg-purple-100/80 text-purple-800 border border-purple-300 dark:bg-purple-900/70 dark:text-purple-200 dark:border-purple-700';
                } else {
                  return 'bg-amber-100/80 text-amber-700 dark:bg-neutral-800/80 dark:text-amber-200 border border-amber-200 dark:border-neutral-700';
                }
              };
              return (
                <span
                  key={cat.id}
                  className={`px-2 py-0.5 text-xs rounded-full font-semibold ${getCategoryBadgeClass(cat.name)}`}
                >
                  {cat.name}
                </span>
              );
            })}
          </div>
        )}
        <div className="text-base font-medium text-white/90 dark:text-white truncate" title={product.name}>
          {product.name}
        </div>
        <div className="text-amber-600 dark:text-amber-400 text-lg font-bold mb-1">
          {product.price.toLocaleString('id-ID', { style: 'currency', currency: product.currency || 'IDR' })}
        </div>
        <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 mb-1">
          <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
            <circle cx="12" cy="11" r="3" />
          </svg>
          {product.location}
        </div>
        {/* Description only on hover for desktop */}
        <div className="hidden md:block">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {product.description}
          </p>
        </div>
      </div>
    </a>
  );
};


export default ProductCard;
