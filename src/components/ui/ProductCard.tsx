// src/components/ui/ProductCard.tsx
"use client";
import React from "react";
import type { Product } from '@/types/apiResponses';
import { getImageUrl, handleImageError } from '@/utils/imageUtils';
// Import ProductImage directly from products/page.tsx
import ProductImage from '@/components/ui/ProductImage';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <a
      href={`/products/${product.id}`}
      className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 flex flex-col h-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-amber-400"
      tabIndex={0}
      aria-label={`View details for ${product.name}`}
    >
      {/* Product image */}
      <div className="relative w-full aspect-[4/3] bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        <ProductImage
          src={getImageUrl(product.image_url)}
          alt={product.name}
          width={400}
          height={300}
          className="transition-transform duration-300 group-hover:scale-105"
          onError={handleImageError}
        />
      </div>
      {/* Card content */}
      <div className="flex flex-col gap-1 p-3 flex-1">
        <div className="text-base font-medium text-neutral-900 dark:text-white truncate" title={product.name}>
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
