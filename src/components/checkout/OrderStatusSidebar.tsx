"use client";

import React from 'react';
import Link from 'next/link';
import ProductReviewForm from '@/components/ui/ProductReviewForm';

interface OrderStatusSidebarProps {
  selectedProductForReview: any | null;
  handleReviewSubmitted: (productId: string | number) => void;
}

const OrderStatusSidebar: React.FC<OrderStatusSidebarProps> = ({
  selectedProductForReview,
  handleReviewSubmitted
}) => {
  return (
    <div className="lg:col-span-1">
      {selectedProductForReview ? (
        <ProductReviewForm 
          productId={selectedProductForReview.product_id}
          productName={selectedProductForReview.product?.name || `Product #${selectedProductForReview.product_id}`}
          onReviewSubmitted={() => handleReviewSubmitted(selectedProductForReview.product_id)}
          className="sticky top-4"
        />
      ) : (
        <div className="bg-neutral-900/80 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Order Status</h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-amber-500/20 rounded-full w-8 h-8 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-white">Order Confirmed</h4>
                <p className="text-white/60 text-sm mt-1">Your order has been confirmed and is being processed.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-amber-500/20 rounded-full w-8 h-8 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-white">Order Processing</h4>
                <p className="text-white/60 text-sm mt-1">Your order is being prepared by the local producer.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-amber-500/20 rounded-full w-8 h-8 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-white">Delivery</h4>
                <p className="text-white/60 text-sm mt-1">Your items will be delivered to your shipping address.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-amber-500/20 rounded-full w-8 h-8 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-white">Leave Reviews</h4>
                <p className="text-white/60 text-sm mt-1">Share your experience with the products you've purchased.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="font-medium text-white mb-3">Need Help?</h4>
            <p className="text-white/60 text-sm mb-4">If you have any questions about your order, please contact our support team.</p>
            
            <Link href="/contact" className="block w-full py-2 bg-white/10 text-white text-center rounded-md hover:bg-white/20 transition-colors">
              Contact Support
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatusSidebar;
