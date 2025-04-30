// src/components/ui/PaginationControls.tsx
"use client";
import React from "react";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  totalItems?: number;
  loading?: boolean;
  onFirst?: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast?: () => void;
  className?: string;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  page,
  totalPages,
  totalItems,
  loading = false,
  onFirst,
  onPrev,
  onNext,
  onLast,
  className = ""
}) => (
  <div className={`flex justify-center mt-12 ${className}`}>
    <div className="flex items-center space-x-2">
      {/* First Page Button */}
      <button
        className="w-10 h-10 flex items-center justify-center rounded-sm bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 disabled:opacity-30 disabled:hover:bg-amber-500/10 transition-colors"
        onClick={onFirst}
        disabled={page === 1 || loading || !onFirst}
        aria-label="First page"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5M9 16l-4-4 4-4" />
        </svg>
      </button>
      {/* Prev Button */}
      <button
        className="w-10 h-10 flex items-center justify-center rounded-sm bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 disabled:opacity-30 disabled:hover:bg-amber-500/10 transition-colors"
        onClick={onPrev}
        disabled={page === 1 || loading}
        aria-label="Previous page"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span className="text-white/70">
        Page {page} of {totalPages || 1}
        {totalItems && totalItems > 0 && (
          <span className="ml-2 text-white/50 text-xs">({totalItems} items)</span>
        )}
      </span>
      <button
        className="w-10 h-10 flex items-center justify-center rounded-sm bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 disabled:opacity-30 disabled:hover:bg-amber-500/10 transition-colors"
        onClick={onNext}
        disabled={page >= totalPages || loading}
        aria-label="Next page"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      {/* Last Page Button */}
      <button
        className="w-10 h-10 flex items-center justify-center rounded-sm bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 disabled:opacity-30 disabled:hover:bg-amber-500/10 transition-colors"
        onClick={onLast}
        disabled={page >= totalPages || loading || !onLast}
        aria-label="Last page"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M15 8l4 4-4 4" />
        </svg>
      </button>
    </div>
  </div>
);

export default PaginationControls;
