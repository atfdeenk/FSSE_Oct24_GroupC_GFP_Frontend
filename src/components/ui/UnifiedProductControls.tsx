import React from 'react';
import PaginationControls from './PaginationControls';

interface CategoryOption {
  id: number | string;
  name: string;
}

interface UnifiedProductControlsProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  debouncedSearch: string;
  loading: boolean;
  categories: CategoryOption[];
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  locations: string[];
  selectedLocation: string;
  setSelectedLocation: (value: string) => void;
  sort: string;
  setSort: (value: string) => void;
  page: number;
  totalPages: number;
  totalProducts: number;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
  onClearFilters?: () => void;
}

const UnifiedProductControls: React.FC<UnifiedProductControlsProps> = ({
  searchInput,
  setSearchInput,
  debouncedSearch,
  loading,
  categories,
  selectedCategory,
  setSelectedCategory,
  locations,
  selectedLocation,
  setSelectedLocation,
  sort,
  setSort,
  page,
  totalPages,
  totalProducts,
  onFirst,
  onPrev,
  onNext,
  onLast,
  onClearFilters
}) => (
  <div className="flex flex-col space-y-4 mb-8 w-full">
    <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0 w-full">
    {/* Search input */}
    <div className="relative w-full md:w-56">
      <input
        type="text"
        className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 focus:outline-none focus:border-amber-500/50 text-white placeholder-white/50"
        placeholder="Search products..."
        value={searchInput}
        onChange={e => setSearchInput(e.target.value)}
        disabled={loading}
      />
      <svg className="absolute right-3 top-3.5 w-5 h-5 text-white/40 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z" />
      </svg>
    </div>
    {/* Category filter */}
    <div className="relative w-full md:w-48" style={{ zIndex: 20 }}>
      <select
        className="w-full appearance-none bg-black/50 border border-white/10 rounded-sm px-4 py-3 focus:outline-none focus:border-amber-500/50 text-white disabled:opacity-50"
        value={selectedCategory}
        onChange={e => setSelectedCategory(e.target.value)}
        disabled={categories.length === 0}
      >
        <option value="">All Categories</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
      <svg className="absolute right-3 top-3.5 w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
    {/* Location filter */}
    <div className="relative w-full md:w-48">
      <select
        className="w-full appearance-none bg-black/50 border border-white/10 rounded-sm px-4 py-3 focus:outline-none focus:border-amber-500/50 text-white disabled:opacity-50"
        value={selectedLocation}
        onChange={e => setSelectedLocation(e.target.value)}
        disabled={locations.length === 0}
      >
        <option value="">All Locations</option>
        {locations.map(loc => (
          <option key={loc} value={loc}>{loc}</option>
        ))}
      </select>
      <svg className="absolute right-3 top-3.5 w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
    <div className="w-full md:w-auto flex-shrink-0">
      <PaginationControls
        page={page}
        totalPages={totalPages}
        totalItems={totalProducts}
        loading={loading}
        onFirst={onFirst}
        onPrev={onPrev}
        onNext={onNext}
        onLast={onLast}
        className="md:justify-end w-full md:w-auto md:mt-0 mt-4"
      />
    </div>
    </div>
    
    {/* Clear filters button - only show if any filter is active */}
    {(searchInput || selectedCategory || selectedLocation || sort) && (
      <div className="flex justify-end">
        <button
          onClick={onClearFilters}
          disabled={loading}
          className="flex items-center space-x-1.5 text-amber-500 hover:text-amber-400 font-medium text-sm transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Clear all filters</span>
        </button>
      </div>
    )}
  </div>
);

export default UnifiedProductControls;
