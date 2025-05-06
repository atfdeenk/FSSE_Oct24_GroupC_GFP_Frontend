"use client";

import React from 'react';
import { formatDate } from '@/utils/format';
import { Feedback } from '@/services/api/feedback';

interface ProductReviewProps {
  review: Feedback;
  className?: string;
}

const ProductReview: React.FC<ProductReviewProps> = ({ 
  review,
  className = ''
}) => {
  // Format the date if available
  const formattedDate = review.created_at ? formatDate(review.created_at) : 'Recently';
  
  // Generate stars based on rating
  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg 
          key={i}
          className={`w-4 h-4 ${i <= review.rating ? 'text-amber-400' : 'text-white/20'}`} 
          fill={i <= review.rating ? 'currentColor' : 'none'} 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={i <= review.rating ? 0 : 1.5} 
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
          />
        </svg>
      );
    }
    
    return stars;
  };
  
  return (
    <div className={`border-b border-white/10 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center text-white/70 mr-3">
            {review.user_name ? review.user_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="font-medium text-white">{review.user_name || 'Anonymous User'}</div>
            <div className="text-white/60 text-xs">{formattedDate}</div>
          </div>
        </div>
        <div className="flex items-center">
          {renderStars()}
        </div>
      </div>
      
      <p className="text-white/80 text-sm">
        {review.comment || 'No comment provided.'}
      </p>
    </div>
  );
};

export default ProductReview;
