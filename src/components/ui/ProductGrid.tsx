"use client";
import React from "react";
import ProductCard from "@/components/ui/ProductCard";
import type { Product } from '@/types/apiResponses';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  children?: React.ReactNode; // For optional loading/empty overlays
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, loading, children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[40vh] relative">
    {loading && products.length === 0 && (
      <div className="col-span-full flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-4"></div>
        <p className="text-white/60">Fetching products...</p>
      </div>
    )}
    {products.length === 0 && !loading && (
      <div className="col-span-full flex flex-col items-center justify-center min-h-[40vh]">
        {children}
      </div>
    )}
    {products.length > 0 && products.map(product => (
      <ProductCard key={product.id} product={product} />
    ))}
  </div>
);

export default ProductGrid;
