"use client";
import React, { useRef } from "react";
import ProductCard from "@/components/ui/ProductCard";
import type { Product } from '@/types/apiResponses';
import LoadingOverlay from './LoadingOverlay';

interface ScrollableProductRowProps {
  products: Product[];
  loading: boolean;
  loadingMessage?: string;
  children?: React.ReactNode; // For optional empty overlays
}

const ScrollableProductRow: React.FC<ScrollableProductRowProps> = ({ 
  products, 
  loading, 
  loadingMessage, 
  children 
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      {/* Left scroll button */}
      {products.length > 3 && (
        <button 
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-neutral-900/80 hover:bg-neutral-800 text-white rounded-full p-2 shadow-lg"
          aria-label="Scroll left"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Scrollable container */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 pb-4 relative"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {loading && products.length === 0 && (
          <div className="w-full min-h-[200px] flex items-center justify-center">
            <LoadingOverlay message={loadingMessage || "Loading products..."} />
          </div>
        )}
        
        {products.length === 0 && !loading && (
          <div className="w-full min-h-[200px] flex items-center justify-center">
            {children || <p className="text-white/50">No products found</p>}
          </div>
        )}
        
        {products.length > 0 && products.map(product => (
          <div key={product.id} className="w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)] flex-shrink-0 snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Right scroll button */}
      {products.length > 3 && (
        <button 
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-neutral-900/80 hover:bg-neutral-800 text-white rounded-full p-2 shadow-lg"
          aria-label="Scroll right"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ScrollableProductRow;
