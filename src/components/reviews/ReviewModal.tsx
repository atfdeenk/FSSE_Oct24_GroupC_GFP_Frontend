"use client";

import { useState, Fragment, useEffect } from "react";
import Image from "next/image";
import { Dialog, Transition } from "@headlessui/react";
import { formatCurrency } from "@/utils/format";
import feedbackService from "@/services/api/feedback";
import { getCurrentUser } from "@/lib/auth";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string | number;
  productName: string;
  productImage?: string;
  productPrice: string | number;
  vendorName?: string;
}

export default function ReviewModal({
  isOpen,
  onClose,
  productId,
  productName,
  productImage,
  productPrice,
  vendorName
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [review, setReview] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [hasReviewed, setHasReviewed] = useState<boolean>(false);
  const [existingReviewId, setExistingReviewId] = useState<number | string | null>(null);

  // Check if user has already reviewed this product
  useEffect(() => {
    const checkExistingReview = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.id) {
          setError("You must be logged in to leave a review");
          return;
        }

        // Check if user has already reviewed this product
        const hasReviewed = await feedbackService.hasUserReviewedProduct(
          currentUser.id,
          productId
        );

        if (hasReviewed) {
          setHasReviewed(true);
          
          // Get user's reviews to find the specific review for this product
          const userReviews = await feedbackService.getFeedbackByUser(currentUser.id);
          if (userReviews.success && userReviews.data) {
            const existingReview = userReviews.data.find(
              review => review.product_id.toString() === productId.toString()
            );
            
            if (existingReview) {
              setExistingReviewId(existingReview.id);
              setRating(existingReview.rating);
              setReview(existingReview.comment);
            }
          }
        }
      } catch (err) {
        console.error("Error checking existing review:", err);
      }
    };

    if (isOpen) {
      checkExistingReview();
    }
  }, [isOpen, productId]);

  // Handle submitting the review
  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const currentUser = await getCurrentUser();
      if (!currentUser || !currentUser.id) {
        setError("You must be logged in to leave a review");
        setSubmitting(false);
        return;
      }

      let response;
      
      if (hasReviewed && existingReviewId) {
        // Update existing review
        response = await feedbackService.updateFeedback(existingReviewId, {
          rating,
          comment: review
        });
      } else {
        // Create new review
        response = await feedbackService.createFeedback({
          product_id: productId,
          rating,
          comment: review
        });
      }

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          // Reset form after closing
          setTimeout(() => {
            setRating(0);
            setReview("");
            setSuccess(false);
            setHasReviewed(false);
            setExistingReviewId(null);
          }, 300);
        }, 2000);
      } else {
        setError(response.message || "Failed to submit review. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[200]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-neutral-900 border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                {success ? (
                  <div className="text-center py-10">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white mb-2">
                      Thank you for your review!
                    </Dialog.Title>
                    <p className="text-sm text-white/60">
                      Your feedback helps other customers make better decisions.
                    </p>
                  </div>
                ) : (
                  <>
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white mb-4">
                      {hasReviewed ? "Update Your Review" : "Rate & Review"}
                    </Dialog.Title>
                    
                    {/* Product Info */}
                    <div className="flex items-center mb-6 p-4 bg-white/5 rounded-lg">
                      <div className="h-16 w-16 flex-shrink-0 mr-4 bg-neutral-800 rounded-sm overflow-hidden">
                        {productImage ? (
                          <Image 
                            src={productImage} 
                            alt={productName}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-neutral-700">
                            <span className="text-xs text-white/40">No image</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{productName}</h4>
                        <p className="text-sm text-white/60">{vendorName || 'Unknown Vendor'}</p>
                        <p className="text-sm text-amber-500">
                          {typeof productPrice === 'string' 
                            ? productPrice 
                            : formatCurrency(parseFloat(productPrice.toString()))}
                        </p>
                      </div>
                    </div>
                    
                    {/* Star Rating */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-white mb-2">Your Rating</label>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className="focus:outline-none"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                          >
                            <svg 
                              className={`w-8 h-8 ${
                                (hoverRating || rating) >= star
                                  ? 'text-amber-400'
                                  : 'text-neutral-600'
                              } transition-colors duration-150`} 
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-white/60">
                          {rating > 0 ? (
                            ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating - 1]
                          ) : 'Select Rating'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Review Text */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-white mb-2">Your Review (Optional)</label>
                      <textarea
                        rows={4}
                        className="w-full px-3 py-2 text-white bg-neutral-800 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="Share your experience with this product..."
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                      />
                    </div>
                    
                    {/* Error Message */}
                    {error && (
                      <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-md">
                        <p className="text-sm text-red-400">{error}</p>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        className="px-4 py-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-600 transition-colors"
                        onClick={onClose}
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors flex items-center"
                        onClick={handleSubmit}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                          </>
                        ) : (
                          hasReviewed ? 'Update Review' : 'Submit Review'
                        )}
                      </button>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
