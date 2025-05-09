"use client";
import React, { useEffect, useState } from "react";
import productService from '@/services/api/products';
import categoryService from '@/services/api/categories';
import type { Product, CategoriesResponse } from '@/types/apiResponses';
import { Header, Footer } from '@/components';
import { ProductGrid } from '@/components/ui';
import { EmptyState } from '@/components';
import { ProductsHeroBanner } from '@/components';
import useDebounce from '@/hooks/useDebounce';
import { PaginationControls } from '@/components/ui';
import { UnifiedProductControls } from '@/components/ui';
import ScrollableProductRow from '@/components/ui/ScrollableProductRow';

export default function ProductsPage() {
  const [categories, setCategories] = useState<{ id: number | string; name: string }[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [flashSaleLoading, setFlashSaleLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  type LoadingReason = 'search' | 'sort' | 'pagination' | 'filter' | 'initial';
  const [loadingReason, setLoadingReason] = useState<LoadingReason | null>(null);

  // Debounce search input to prevent excessive filtering on every keystroke
  const debouncedSearch = useDebounce(searchInput, 300);
  const pageSize = 8;

  // Fetch products with pagination and filtering
  const fetchProducts = async (reason: LoadingReason = 'initial') => {
    setLoading(true);
    setLoadingReason(reason);

    // Clear products to show loading state for ALL fetches (search, sort, filter, pagination)
    setProducts([]);

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

      // Add category filter
      if (selectedCategory) {
        filters.category_id = selectedCategory;
      }

      // Add location filter
      if (selectedLocation) {
        filters.location = selectedLocation;
      }

      const response = await productService.getProducts(filters);

      if (response && response.products) {
        setProducts(response.products || []);
        setTotalProducts(response.total || 0);
        setTotalPages(Math.ceil((response.total || 0) / pageSize));
        // Derive locations from loaded products (unique, sorted)
        const uniqueLocations = Array.from(new Set((response.products || []).map(p => p.location).filter(Boolean)));
        setLocations(uniqueLocations.sort((a, b) => a.localeCompare(b)));
      } else {
        setError('Failed to load products.');
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load products.');
    } finally {
      setLoading(false);
      // Do not reset loadingReason here; keep it until next fetch starts.
    }
  };

  // Centralized effect for all product-fetching triggers
  const prev = React.useRef({
    search: debouncedSearch,
    sort,
    page,
    category: selectedCategory,
    location: selectedLocation,
  });

  useEffect(() => {
    let reason: 'search' | 'sort' | 'pagination' | 'filter' | 'initial' = 'initial';
    if (prev.current.search !== debouncedSearch) {
      reason = 'search';
    } else if (prev.current.sort !== sort) {
      reason = 'sort';
    } else if (prev.current.page !== page) {
      reason = 'pagination';
    } else if (
      prev.current.category !== selectedCategory ||
      prev.current.location !== selectedLocation
    ) {
      reason = 'filter';
    }
    fetchProducts(reason);
    prev.current = {
      search: debouncedSearch,
      sort,
      page,
      category: selectedCategory,
      location: selectedLocation,
    };
  }, [debouncedSearch, sort, page, selectedCategory, selectedLocation]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory, selectedLocation]);
  
  // Handle clearing all filters
  const handleClearFilters = () => {
    setSearchInput('');
    setSelectedCategory('');
    setSelectedLocation('');
    setSort('');
    setPage(1);
  };

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        console.log('Categories response:', res);
        
        // Handle the response structure with categories array
        if (res && res.categories && Array.isArray(res.categories)) {
          setCategories(res.categories.map((c: any) => ({ id: c.id, name: c.name })));
        } else if (Array.isArray(res)) {
          // Fallback for direct array response
          setCategories(res.map((c: any) => ({ id: c.id, name: c.name })));
        } else {
          console.error('Unexpected categories response format:', res);
          setCategories([]);
        }
      } catch (e) {
        console.error('Error fetching categories:', e);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);
  
  // Fetch all products for flash sale and featured sections
  useEffect(() => {
    const fetchSpecialProducts = async () => {
      setFlashSaleLoading(true);
      setFeaturedLoading(true);
      try {
        // Get all products with a higher limit
        const response = await productService.getProducts({ limit: 100 });
        if (response && response.products) {
          // Client-side filtering for flash sale products
          const flashSaleItems = response.products
            .filter(product => product.flash_sale === true)
            .slice(0, 4);
          setFlashSaleProducts(flashSaleItems);
          
          // Client-side filtering for featured products
          const featuredItems = response.products
            .filter(product => product.featured === true)
            .slice(0, 4);
          setFeaturedProducts(featuredItems);
          
          console.log('Flash sale products:', flashSaleItems.length);
          console.log('Featured products:', featuredItems.length);
        }
      } catch (error) {
        console.error('Error fetching special products:', error);
      } finally {
        setFlashSaleLoading(false);
        setFeaturedLoading(false);
      }
    };
    fetchSpecialProducts();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      {/* Hero banner */}
      <ProductsHeroBanner />

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Special Products Sections */}
        <div className="flex flex-col gap-3 mb-6">
          {/* Flash Sale Section */}
          {(flashSaleProducts.length > 0 || flashSaleLoading) && (
            <div className="bg-black/30 border border-white/5 rounded-md p-3 pb-2">
              <div className="flex items-center mb-1">
                <h2 className="text-lg font-bold text-white">Flash Sale</h2>
                <span className="ml-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                  HOT DEALS
                </span>
              </div>
              <ScrollableProductRow 
                products={flashSaleProducts} 
                loading={flashSaleLoading}
                loadingMessage="Loading flash sale products..."
              />
            </div>
          )}
          
          {/* Featured Products Section */}
          {(featuredProducts.length > 0 || featuredLoading) && (
            <div className="bg-black/30 border border-white/5 rounded-md p-3 pb-2">
              <div className="flex items-center mb-1">
                <h2 className="text-lg font-bold text-white">Featured Products</h2>
                <span className="ml-2 bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  RECOMMENDED
                </span>
              </div>
              <ScrollableProductRow 
                products={featuredProducts} 
                loading={featuredLoading}
                loadingMessage="Loading featured products..."
              />
            </div>
          )}
        </div>
        
        {/* Unified controls row as component */}
        <UnifiedProductControls
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          debouncedSearch={debouncedSearch}
          loading={loading}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          locations={locations}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          sort={sort}
          setSort={setSort}
          page={page}
          totalPages={totalPages}
          totalProducts={totalProducts}
          onFirst={() => setPage(1)}
          onPrev={() => setPage(p => Math.max(1, p - 1))}
          onNext={() => setPage(p => Math.min(totalPages, p + 1))}
          onLast={() => setPage(totalPages)}
          onClearFilters={handleClearFilters}
        />
        
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-sm mb-8 text-center">{error}</div>
        )}

        {/* Products grid */}
        <ProductGrid
          products={products}
          loading={loading}
          loadingMessage={
            loadingReason === 'search' ? 'Searching products...'
              : loadingReason === 'pagination' ? 'Loading more products...'
                : loadingReason === 'sort' ? 'Sorting products...'
                  : loadingReason === 'filter' ? 'Filtering products...'
                    : 'Fetching products...'
          }
        >
          {products.length === 0 && !loading && (
            <EmptyState message="No products found">
              <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-white/60 max-w-md mx-auto">Try adjusting your search or filter criteria to find what you're looking for.</p>
            </EmptyState>
          )}
        </ProductGrid>


        {/* Bottom pagination for mobile */}
        {products.length > 0 && (
          <PaginationControls
            page={page}
            totalPages={totalPages}
            totalItems={totalProducts}
            loading={loading}
            onFirst={() => setPage(1)}
            onPrev={() => setPage(p => Math.max(1, p - 1))}
            onNext={() => setPage(p => Math.min(totalPages, p + 1))}
            onLast={() => setPage(totalPages)}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}
