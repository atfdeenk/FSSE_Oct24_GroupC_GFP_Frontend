"use client";

import React, { useState, useEffect } from 'react';
import ProductReview from '@/components/ProductReview';
import feedbackService from '@/services/api/feedback';
import { Feedback } from '@/services/api/feedback';

interface ProductReviewsProps {
  productId: string | number;
  className?: string;
  limit?: number;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  className = '',
  limit = 5
}) => {
  const [reviews, setReviews] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        // Fetch reviews for the product
        const response = await feedbackService.getFeedbackByProduct(productId, page, limit);
        
        if (response.success && response.data) {
          setReviews(response.data);
          
          // Calculate total pages
          if (response.total) {
            setTotalPages(Math.ceil(response.total / limit));
          }
          
          // Calculate average rating
          if (response.data.length > 0) {
            const total = response.data.reduce((sum, review) => sum + review.rating, 0);
            setAverageRating(total / response.data.length);
          }
          
          setError(null);
        } else {
          setError(response.message || 'Failed to load reviews');
        }
      } catch (err) {
        console.error('Error fetching product reviews:', err);
        setError('Failed to load reviews. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [productId, page, limit]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Generate stars for average rating
  const renderAverageRatingStars = () => {
    const stars = [];
    const roundedRating = Math.round(averageRating * 2) / 2; // Round to nearest 0.5
    
    for (let i = 1; i <= 5; i++) {
      // Full star, half star, or empty star
      const isFull = i <= Math.floor(roundedRating);
      const isHalf = !isFull && i === Math.ceil(roundedRating) && roundedRating % 1 !== 0;
      
      stars.push(
        <svg 
          key={i}
          className={`w-5 h-5 ${isFull || isHalf ? 'text-amber-400' : 'text-white/20'}`} 
          fill={isFull ? 'currentColor' : 'none'} 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          {isHalf ? (
            // Half star
            <>
              <defs>
                <linearGradient id={`halfStar${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path 
                fill={`url(#halfStar${i})`}
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
              />
            </>
          ) : (
            // Full or empty star
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={isFull ? 0 : 1.5} 
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
            />
          )}
        </svg>
      );
    }
    
    return stars;
  };

  return (
    <div className={`bg-neutral-900/80 backdrop-blur-sm rounded-lg border border-white/10 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-white">Customer Reviews</h3>
        
        {reviews.length > 0 && (
          <div className="flex items-center">
            <div className="flex items-center mr-2">
              {renderAverageRatingStars()}
            </div>
            <span className="text-white/70 text-sm">
              {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-white/10 border-t-amber-500 rounded-full"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-white/60">
          {error}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-white/60">
          No reviews yet. Be the first to review this product!
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <ProductReview key={review.id} review={review} />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${
                      pageNum === page ? 'bg-amber-500 text-black' : 'bg-white/10 text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductReviews;
