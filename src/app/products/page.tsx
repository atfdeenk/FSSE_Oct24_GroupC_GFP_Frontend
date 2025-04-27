"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import productService from '../../services/api/products';
import type { Product, ProductsResponse } from '../../types/apiResponses';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getImageUrl, handleImageError } from '../../utils/imageUtils';
const LoginForm = dynamic(() => import("../../components/LoginForm"), { ssr: false });

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const pageSize = 8;

  useEffect(() => {
    setLoading(true);
    productService.getProducts()
      .then(response => {
        if (response.products) {
          setProducts(response.products || []);
        } else {
          setError(response.message || 'Failed to load products.');
        }
      })
      .catch(e => {
        setError(e?.message || 'Failed to load products.');
        console.error('Error loading products:', e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Filter
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.description.toLowerCase().includes(search.toLowerCase())
  );

  // Sort
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'priceLow') return a.price - b.price;
    if (sort === 'priceHigh') return b.price - a.price;
    return 0;
  });

  // Pagination
  const paginatedProducts = sortedProducts.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredProducts.length / pageSize);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      {/* Hero banner */}
      <div className="w-full bg-black relative overflow-hidden py-20 px-6">
        <div className="absolute inset-0 bg-[url('/coffee-beans-dark.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <span className="inline-block text-amber-500 font-bold tracking-widest uppercase text-sm mb-4 animate-fade-in">Discover</span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 animate-fade-in delay-100">Premium Coffee Collection</h1>
          <div className="h-1 w-24 bg-amber-500 mx-auto mb-8 animate-fade-in delay-200"></div>
          <p className="text-white/80 max-w-2xl mx-auto text-lg animate-fade-in delay-300 mb-8">
            Explore our curated selection of locally sourced, artisanal coffee products
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-sm mb-8 text-center">{error}</div>
        )}

        {/* Search, Sort, Pagination Controls */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-12 bg-neutral-900/50 p-6 rounded-sm border border-white/5">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 focus:outline-none focus:border-amber-500/50 text-white placeholder-white/40"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <svg className="absolute right-3 top-3.5 w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="relative w-full md:w-48">
            <select
              className="w-full appearance-none bg-black/50 border border-white/10 rounded-sm px-4 py-3 focus:outline-none focus:border-amber-500/50 text-white"
              value={sort}
              onChange={e => setSort(e.target.value)}
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

          <div className="flex items-center space-x-4">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-sm bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 disabled:opacity-30 disabled:hover:bg-amber-500/10 transition-colors"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-white/70">Page {page} of {totalPages || 1}</span>
            <button
              className="w-10 h-10 flex items-center justify-center rounded-sm bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 disabled:opacity-30 disabled:hover:bg-amber-500/10 transition-colors"
              onClick={() => setPage(p => p + 1)}
              disabled={page * pageSize >= filteredProducts.length}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Products grid */}
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginatedProducts.map(product => (
            <a
              key={product.id}
              href={`/products/${product.id}`}
              className="group bg-neutral-900/50 backdrop-blur-sm rounded-sm overflow-hidden border border-white/5 hover:border-amber-500/30 transition-all duration-300 flex flex-col h-full"
            >
              <div className="relative h-48 overflow-hidden bg-neutral-900 rounded-t-sm">
                <img 
                  src={getImageUrl(product.image_url)} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={handleImageError()}
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
          ))}
        </div>

        {/* Empty state */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-2xl font-bold text-white mb-2">No products found</h3>
            <p className="text-white/60 max-w-md mx-auto">Try adjusting your search or filter criteria to find what you're looking for.</p>
          </div>
        )}

        {/* Bottom pagination for mobile */}
        {filteredProducts.length > 0 && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center space-x-4">
              <button
                className="w-10 h-10 flex items-center justify-center rounded-sm bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 disabled:opacity-30 disabled:hover:bg-amber-500/10 transition-colors"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-white/70">Page {page} of {totalPages || 1}</span>
              <button
                className="w-10 h-10 flex items-center justify-center rounded-sm bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 disabled:opacity-30 disabled:hover:bg-amber-500/10 transition-colors"
                onClick={() => setPage(p => p + 1)}
                disabled={page * pageSize >= filteredProducts.length}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
