"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Header, Footer, EmptyState } from "@/components";
import { ProductGrid } from "@/components/ui";
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import useDebounce from '@/hooks/useDebounce';
import productService from '@/services/api/products';
import usersService from '@/services/api/users';
import type { Product } from '@/types/apiResponses';
import { User } from '@/services/api/users';

export default function StorePage() {
  const params = useParams();
  const vendorId = params?.id as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [vendor, setVendor] = useState<User | null>(null);
  
  // Filtering and sorting state
  const [searchInput, setSearchInput] = useState('');
  const [sortOption, setSortOption] = useState('default');
  const debouncedSearch = useDebounce(searchInput, 300);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    // First filter by search term
    let result = products;
    
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchLower) || 
        product.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Then sort
    return [...result].sort((a, b) => {
      switch (sortOption) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0; // Keep original order
      }
    });
  }, [products, debouncedSearch, sortOption]);

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!vendorId) {
        setError("Vendor ID is required");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch vendor information
        const usersResponse = await usersService.getUsers();
        if (usersResponse.success && usersResponse.data) {
          const vendorData = usersResponse.data.find(user => user.id.toString() === vendorId);
          if (vendorData) {
            setVendor(vendorData);
          }
        }

        // Fetch all products first since the API might not properly support filtering by vendor_id
        const productsResponse = await productService.getProducts();
        if (productsResponse && productsResponse.products) {
          // Manually filter products by vendor_id
          const vendorProducts = productsResponse.products.filter(
            product => product.vendor_id.toString() === vendorId
          );
          setProducts(vendorProducts);
          
          if (vendorProducts.length === 0) {
            console.log(`No products found for vendor ID ${vendorId}`);
          }
        } else {
          setError("Failed to load products");
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load store data");
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [vendorId]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      {/* Store Banner */}
      <div className="bg-gradient-to-r from-amber-900 to-neutral-900 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="h-32 flex items-center justify-center">
              <LoadingOverlay message="Loading store information..." />
            </div>
          ) : error ? (
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">Store not found</h1>
              <p className="text-white/60">{error}</p>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-amber-600/20 flex items-center justify-center border-4 border-amber-500/30">
                {vendor?.image_url ? (
                  <img 
                    src={vendor.image_url} 
                    alt={`${vendor.username}'s profile`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96?text=☕';
                    }}
                  />
                ) : (
                  <svg className="w-12 h-12 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{vendor?.username || "Coffee Store"}</h1>
                <div className="flex items-center gap-4">
                  {vendor?.city && (
                    <span className="text-amber-400/90 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                        <circle cx="12" cy="11" r="3" />
                      </svg>
                      {vendor.city}
                    </span>
                  )}
                  <span className="text-white/70">
                    {products.length} {products.length === 1 ? 'product' : 'products'} available
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h2 className="text-2xl font-bold text-white">Products from this seller</h2>
          
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="bg-neutral-800/80 border border-white/10 rounded-sm px-4 py-2 text-white w-full md:w-64 pl-10 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <svg className="w-5 h-5 text-white/50 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Sort dropdown */}
            <select
              className="bg-neutral-800/80 border border-white/10 rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="default">Sort by: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <LoadingOverlay message="Loading products..." />
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-sm mb-8 text-center">{error}</div>
        ) : products.length === 0 ? (
          <EmptyState message="No products found for this seller">
            <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-white/60 max-w-md mx-auto">This seller doesn't have any products listed at the moment.</p>
          </EmptyState>
        ) : filteredProducts.length === 0 ? (
          <EmptyState message="No matching products found">
            <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-white/60 max-w-md mx-auto">Try adjusting your search or filter criteria.</p>
          </EmptyState>
        ) : (
          <ProductGrid products={filteredProducts} loading={false} />
        )}
      </div>

      <Footer />
    </div>
  );
}
