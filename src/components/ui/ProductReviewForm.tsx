"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import feedbackService from '@/services/api/feedback';
import { getCurrentUser } from '@/lib/auth';

interface ProductReviewFormProps {
  productId: string | number;
  productName: string;
  onReviewSubmitted?: () => void;
  className?: string;
}

const ProductReviewForm: React.FC<ProductReviewFormProps> = ({
  productId,
  productName,
  onReviewSubmitted,
  className = ''
}) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasReviewed, setHasReviewed] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating < 1 || rating > 5) {
      toast.error('Please select a rating between 1 and 5');
      return;
    }
    
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const user = await getCurrentUser();
      
      if (!user || !user.id) {
        toast.error('You must be logged in to leave a review');
        setIsSubmitting(false);
        return;
      }
      
      // Check if user has already reviewed this product
      const hasAlreadyReviewed = await feedbackService.hasUserReviewedProduct(user.id, productId);
      
      if (hasAlreadyReviewed) {
        toast.error('You have already reviewed this product');
        setHasReviewed(true);
        setIsSubmitting(false);
        return;
      }
      
      // Submit the review
      const response = await feedbackService.createFeedback({
        product_id: productId,
        rating,
        comment
      });
      
      if (response.success) {
        toast.success('Thank you for your review!');
        setHasReviewed(true);
        setRating(5);
        setComment('');
        
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      } else {
        toast.error(response.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('An error occurred while submitting your review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasReviewed) {
    return (
      <div className={`bg-green-900/30 border border-green-500/30 rounded-lg p-6 text-center ${className}`}>
        <div className="flex items-center justify-center mb-2">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white">Thank You!</h3>
        <p className="text-white/70 mt-1">Your review for {productName} has been submitted.</p>
      </div>
    );
  }

  return (
    <div className={`bg-neutral-900/80 backdrop-blur-sm rounded-lg border border-white/10 p-6 ${className}`}>
      <h3 className="text-lg font-medium text-white mb-4">Rate Your Purchase</h3>
      <p className="text-white/70 mb-6">How would you rate {productName}?</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white/80 mb-2">Rating</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <svg 
                  className={`w-8 h-8 ${star <= rating ? 'text-amber-400' : 'text-white/20'}`} 
                  fill={star <= rating ? 'currentColor' : 'none'} 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={star <= rating ? 0 : 1.5} 
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
                  />
                </svg>
              </button>
            ))}
            <span className="ml-2 text-white/60 text-sm">{rating} out of 5</span>
          </div>
        </div>
        
        <div>
          <label htmlFor="comment" className="block text-white/80 mb-2">Your Review</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={4}
            className="w-full bg-black/30 border border-white/10 rounded-md p-3 text-white placeholder:text-white/40 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-amber-500 text-black font-medium rounded-md hover:bg-amber-400 transition-colors disabled:bg-amber-500/50 disabled:text-black/50 flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ProductReviewForm;
