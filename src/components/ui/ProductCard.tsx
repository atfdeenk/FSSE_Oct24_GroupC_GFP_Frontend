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
      className="group bg-neutral-900/50 backdrop-blur-sm rounded-sm overflow-hidden border border-white/5 hover:border-amber-500/30 transition-all duration-300 flex flex-col h-full"
      tabIndex={0}
      aria-label={`View details for ${product.name}`}
    >
      <div className="relative h-48 overflow-hidden bg-neutral-900 rounded-t-sm">
        {/* Progressive image loading with skeleton */}
        <ProductImage
          src={getImageUrl(product.image_url)}
          alt={product.name}
          width={400}
          height={192}
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute bottom-0 left-0 p-4 w-full">
          <span className="inline-block bg-amber-500/90 text-black text-xs font-bold px-3 py-1 rounded-sm mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
            {product.location}
          </span>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h2 className="font-bold text-xl text-white group-hover:text-amber-400 transition-colors duration-300">{product.name}</h2>
          <span className="font-mono text-amber-500 font-bold">{product.price} {product.currency}</span>
        </div>
        <p className="text-white/60 text-sm mb-4 line-clamp-2 flex-grow">{product.description}</p>
        <div className="mt-auto pt-4 border-t border-white/5">
          <span className="inline-flex items-center text-amber-500 font-bold group-hover:text-amber-400 transition-colors">
            View Details
            <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </div>
      </div>
    </a>
  );
};


export default ProductCard;
