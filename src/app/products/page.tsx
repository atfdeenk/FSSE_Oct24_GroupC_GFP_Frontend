"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import productService from '@/services/api/products';
import type { Product, ProductsResponse } from '@/types/apiResponses';
import { Header, Footer, LoginForm } from "@/components";
import ProductsHeroBanner from '@/components/sections/ProductsHeroBanner';
import ProductCard from '@/components/ui/ProductCard';
import { getImageUrl, handleImageError } from '@/utils/imageUtils';
import useDebounce from '@/hooks/useDebounce';

import ProductImage from '@/components/ui/ProductImage';
import PaginationControls from '@/components/ui/PaginationControls';


export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search input to prevent excessive filtering on every keystroke
  const debouncedSearch = useDebounce(searchInput, 300);
  const pageSize = 8;

  // Fetch products with pagination and filtering
  const fetchProducts = async () => {
    console.time('fetchProducts: total');
    console.time('fetchProducts: network');
    setLoading(true);

    // Clear products when changing search or sort to show loading state
    if (debouncedSearch || sort) {
      setProducts([]);
    }

    try {
      // Prepare filters for API call
      const filters: any = {
        page,
        limit: pageSize
      };

      // Add search filter if present
      if (debouncedSearch) {
        filters.search = debouncedSearch;
      }

      // Add sorting if selected
      if (sort) {
        if (sort === 'name') {
          filters.sort_by = 'name';
          filters.sort_order = 'asc';
        } else if (sort === 'priceLow') {
          filters.sort_by = 'price';
          filters.sort_order = 'asc';
        } else if (sort === 'priceHigh') {
          filters.sort_by = 'price';
          filters.sort_order = 'desc';
        }
      }

      const response = await productService.getProducts(filters);
      console.timeEnd('fetchProducts: network');

      if (response && response.products) {
        setProducts(response.products || []);
        setTotalProducts(response.total || 0);
        setTotalPages(Math.ceil((response.total || 0) / pageSize));
        // Wait for the next paint to measure render time
        requestAnimationFrame(() => {
          console.timeEnd('fetchProducts: total');
        });
      } else {
        setError('Failed to load products.');
        console.timeEnd('fetchProducts: total');
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load products.');
      console.error('Error loading products:', e);
    } finally {
      setLoading(false);
    }
  };


  // Fetch products when page, sort, or search changes
  useEffect(() => {
    fetchProducts();
  }, [page, sort, debouncedSearch]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      {/* Hero banner */}
      <ProductsHeroBanner />

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-sm mb-8 text-center">{error}</div>
        )}

        {/* Search, Sort, Pagination Controls - Unified Inline Row */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 gap-4 mb-6">
          {/* Search input and icons */}
          <div className="relative flex-1 w-full md:w-64">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 focus:outline-none focus:border-amber-500/50 text-white placeholder-white/40 disabled:opacity-50"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              disabled={loading}
            />
            {(searchInput !== debouncedSearch || loading) && (
              <span className="absolute right-10 top-3.5 w-4 h-4">
                <svg className="animate-spin text-amber-500/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            )}
            <svg className="absolute right-3 top-3.5 w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {/* Sort select */}
          <div className="relative w-full md:w-48">
            <select
              className="w-full appearance-none bg-black/50 border border-white/10 rounded-sm px-4 py-3 focus:outline-none focus:border-amber-500/50 text-white disabled:opacity-50"
              value={sort}
              onChange={e => setSort(e.target.value)}
              disabled={loading}
            >
              <option value="">Sort by</option>
              <option value="name">Name</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
            <svg className="absolute right-3 top-3.5 w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {/* Pagination controls */}
          <div className="w-full md:w-auto">
            <PaginationControls
              page={page}
              totalPages={totalPages}
              totalItems={totalProducts}
              loading={loading}
              onFirst={() => setPage(1)}
              onPrev={() => setPage(p => Math.max(1, p - 1))}
              onNext={() => setPage(p => p + 1)}
              onLast={() => setPage(totalPages)}
              className="md:justify-end w-full md:w-auto md:mt-0 mt-4"
            />
          </div>
        </div>

        {/* Products grid */}
        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="bg-black/80 p-6 rounded-sm border border-amber-500/20 shadow-lg flex items-center space-x-4">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
              <div className="text-white font-medium">Loading products...</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading && products.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-4"></div>
              <p className="text-white/60">Fetching products...</p>
            </div>
          )}

          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Empty state - only show when not loading */}
        {products.length === 0 && !loading && (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-2xl font-bold text-white mb-2">No products found</h3>
            <p className="text-white/60 max-w-md mx-auto">Try adjusting your search or filter criteria to find what you're looking for.</p>
          </div>
        )}

        {/* Bottom pagination for mobile */}
        {products.length > 0 && (
          <PaginationControls
            page={page}
            totalPages={totalPages}
            totalItems={totalProducts}
            loading={loading}
            onFirst={() => setPage(1)}
            onPrev={() => setPage(p => Math.max(1, p - 1))}
            onNext={() => setPage(p => p + 1)}
            onLast={() => setPage(totalPages)}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}
