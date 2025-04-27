// src/app/products/page.tsx
"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { api } from '../../lib/api';
import type { Product, ProductsResponse } from '../../scripts/types/apiResponses';
import Footer from "../../components/Footer";
const LoginForm = dynamic(() => import("../../components/LoginForm"), { ssr: false });

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    api.products()
      .then(res => setProducts((res as ProductsResponse).products || []))
      .catch(e => {
        setError(e?.message || 'Failed to load products.');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-green-50 py-12 px-6">
      <h1 className="text-3xl sm:text-4xl font-bold text-green-900 mb-8 text-center">All Products</h1>
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-8 text-center">{error}</div>
      )}
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl mx-auto">
        {/* Search, Sort, Pagination Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
          <input
            type="text"
            placeholder="Search products..."
            className="border border-green-300 rounded px-3 py-2 w-full sm:w-64 focus:outline-green-500"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="border border-green-300 rounded px-3 py-2 focus:outline-green-500"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            <option value="">Sort by</option>
            <option value="name">Name</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
          </select>
          <div className="flex gap-2 items-center">
            <button
              className="px-3 py-1 rounded bg-green-200 text-green-900 font-bold disabled:opacity-50"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              &lt;
            </button>
            <span>Page {page}</span>
            <button
              className="px-3 py-1 rounded bg-green-200 text-green-900 font-bold disabled:opacity-50"
              onClick={() => setPage(p => p + 1)}
              disabled={page * pageSize >= filteredProducts.length}
            >
              &gt;
            </button>
          </div>
        </div>

        {paginatedProducts.map(product => (
          <a
            key={product.id}
            href={`/products/${product.id}`}
            className="bg-white rounded-xl shadow p-4 flex flex-col items-center hover:shadow-lg transition group"
          >
            <img
              src={product.image_url || '/placeholder.svg'}
              alt={product.name}
              className="w-40 h-40 object-cover rounded mb-4 bg-green-100 group-hover:scale-105 transition-transform"
              width={160}
              height={160}
            />
            <h2 className="font-semibold text-lg text-green-900 mb-1 text-center">{product.name}</h2>
            <p className="text-green-700 font-bold text-xl mb-2">{product.price} {product.currency}</p>
            <p className="text-green-800 text-sm mb-2 text-center line-clamp-2">{product.description}</p>
            <span className="inline-block bg-green-200 text-green-900 text-xs px-2 py-1 rounded-full mb-1">{product.location}</span>
            <span className="mt-3 px-4 py-2 bg-green-700 text-white rounded-full font-semibold text-sm group-hover:bg-green-800 transition-colors">View Details</span>
          </a>
        ))}
        {products.length === 0 && !error && (
          <div className="col-span-full text-center text-green-900">No products found.</div>
        )}
      </div>
    </div>
  );
}
