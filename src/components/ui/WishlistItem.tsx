"use client";

import React from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/utils/format';
import { getProductImageUrl, handleProductImageError } from '@/utils/imageUtils';

interface WishlistItemProps {
  item: {
    id: string | number;
    product_id: string | number;
    name?: string;
    price?: number;
    image_url?: string;
    seller?: string;
    inStock?: boolean;
    category?: string;
    rating?: number;
  };
  selected: boolean;
  onSelect: (id: string | number) => void;
  onRemove: (id: string | number) => void;
  onAddToCart: (productId: string | number) => void;
  isAddingToCart: boolean;
}

const WishlistItem: React.FC<WishlistItemProps> = ({
  item,
  selected,
  onSelect,
  onRemove,
  onAddToCart,
  isAddingToCart
}) => {
  return (
    <div
      className={`group p-4 bg-neutral-900/80 backdrop-blur-sm rounded-md border overflow-hidden shadow-lg transition-all duration-300 ${selected ? "border-amber-500/50 bg-amber-900/10" : "border-white/10 hover:border-amber-500/20"} mb-3 last:mb-0 animate-fade-in`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Checkbox and Image - Always side by side */}
        <div className="flex items-center gap-3">
          <label className="w-6 h-6 relative flex items-center justify-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only"
              checked={selected}
              onChange={() => onSelect(item.id)}
              disabled={!item.inStock}
            />
            <div className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-colors ${
              !item.inStock 
                ? "border-white/20 bg-neutral-800/50 cursor-not-allowed" 
                : selected 
                  ? "bg-amber-500 border-amber-500" 
                  : "border-white/30 bg-black/20"
            }`}>
              {selected && (
                <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </label>

          <div className="w-20 h-20 sm:w-16 sm:h-16 bg-neutral-800 rounded-md overflow-hidden flex-shrink-0 border border-white/5 relative">
            <Link href={`/products/${item.product_id}`} className="block w-full h-full">
              <img
                src={getProductImageUrl(item.image_url || "")}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={handleProductImageError}
              />
            </Link>
            {!item.inStock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white/90 text-xs font-medium px-2 py-1 bg-black/80 rounded-sm">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Product Info and Price */}
        <div className="flex-grow flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex-grow">
            <Link
              href={`/products/${item.product_id}`}
              className="text-white font-medium hover:text-amber-400 transition-colors block mb-1 text-base"
            >
              {item.name || "Product Name"}
            </Link>
            {item.category && (
              <div className="text-white/60 text-xs flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500/50"></span>
                {item.category}
              </div>
            )}
            <div className="text-amber-500 font-bold mt-1">
              {item.price ? formatCurrency(item.price) : "Price unavailable"}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <button
              onClick={() => onAddToCart(item.product_id)}
              disabled={!item.inStock || isAddingToCart}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                isAddingToCart 
                  ? "bg-amber-700/50 text-white/70 cursor-wait" 
                  : item.inStock 
                    ? "bg-amber-500 text-black hover:bg-amber-400" 
                    : "bg-neutral-800 text-white/30 cursor-not-allowed"
              }`}
              title={item.inStock ? "Add to Cart" : "Out of Stock"}
            >
              {isAddingToCart ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart
                </>
              )}
            </button>

            <button
              onClick={() => onRemove(item.id)}
              className="text-white/40 hover:text-red-400 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-500/10"
              aria-label="Remove from wishlist"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistItem;
