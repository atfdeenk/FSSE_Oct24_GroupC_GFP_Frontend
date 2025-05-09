"use client";
import React from "react";
import ProductCard from "@/components/ui/ProductCard";
import type { Product } from '@/types/apiResponses';
import LoadingOverlay from './LoadingOverlay';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  loadingMessage?: string;
  children?: React.ReactNode; // For optional empty overlays
  className?: string; // Custom class name for grid layout
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, loading, loadingMessage, children, className }) => (
  <div className={`grid ${className || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'} min-h-[40vh] relative`}>
    {loading && products.length === 0 && <LoadingOverlay message={loadingMessage || "Fetching products..."} />}
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
