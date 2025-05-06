"use client";

import React from 'react';
import { formatCurrency } from '@/utils/format';

interface OrderItemsProps {
  items: any[];
  reviewedProducts: Set<string | number>;
  handleReviewProduct: (product: any) => void;
  calculateOrderTotal: (items: any[]) => number;
  rawOrderData?: any;
}

const OrderItems: React.FC<OrderItemsProps> = ({
  items,
  reviewedProducts,
  handleReviewProduct,
  calculateOrderTotal,
  rawOrderData
}) => {
  return (
    <div className="bg-neutral-900/80 backdrop-blur-sm rounded-lg border border-white/10 p-6 md:p-8">
      <h2 className="text-xl font-bold text-white mb-4">Order Items</h2>
      
      <div className="space-y-4 mb-6">
        {items?.map((item: any, index: number) => (
          <div key={index} className="flex items-center justify-between border-b border-white/10 pb-4 last:border-0 last:pb-0">
            <div className="flex items-center gap-4">
              {(item.product?.image || item.image) ? (
                <div className="w-16 h-16 bg-neutral-800 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img 
                    src={item.product?.image || item.image} 
                    alt={item.product?.name || item.name || `Product #${item.product_id}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=Product';
                    }}
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-neutral-800 rounded-md flex items-center justify-center text-white/30 flex-shrink-0">
                  <span className="text-sm font-medium">{item.quantity}x</span>
                </div>
              )}
              <div>
                <h3 className="text-white font-medium">{item.product?.name || item.name || (typeof item === 'object' && 'name' in item ? item.name : `Product #${item.product_id}`)}</h3>
                <p className="text-white/60 text-sm">{formatCurrency(item.price || item.product?.price || 0)} each</p>
                <p className="text-white/60 text-xs">Quantity: {item.quantity}</p>
                
                {/* Review button - only show if not already reviewed */}
                {!reviewedProducts.has(item.product_id) && (
                  <button 
                    onClick={() => handleReviewProduct(item)}
                    className="text-amber-500 text-sm mt-1 hover:text-amber-400 transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Leave a Review
                  </button>
                )}
                
                {reviewedProducts.has(item.product_id) && (
                  <div className="text-green-500 text-sm mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Review Submitted
                  </div>
                )}
              </div>
            </div>
            <div className="text-amber-500 font-medium">
              {formatCurrency((item.price || item.product?.price || 0) * (item.quantity || 1))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t border-white/10 pt-4 space-y-2">
        <div className="flex justify-between text-white/70">
          <span>Subtotal</span>
          <span>
            {formatCurrency(
              // Try to get the subtotal from localStorage data first
              (typeof window !== 'undefined' && localStorage.getItem('checkout_additional_data')) ? 
                JSON.parse(localStorage.getItem('checkout_additional_data') || '{}').subtotal || 0 :
              // Then from rawOrderData
              rawOrderData?.subtotal || 
              rawOrderData?.data?.subtotal ||
              // Then calculate it from items if not available
              calculateOrderTotal(items)
            )}
          </span>
        </div>
        
        {(rawOrderData?.discount > 0 || rawOrderData?.data?.discount > 0) && (
          <div className="flex justify-between text-green-400">
            <span>Discount</span>
            <span>-{formatCurrency(rawOrderData?.discount || rawOrderData?.data?.discount || 0)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-white font-bold pt-2 border-t border-white/10">
          <span>Total</span>
          <span className="text-amber-500">
            {formatCurrency(
              // Try to get the total from localStorage data first
              (typeof window !== 'undefined' && localStorage.getItem('checkout_additional_data')) ? 
                JSON.parse(localStorage.getItem('checkout_additional_data') || '{}').total_amount || 0 :
              // Then from rawOrderData
              rawOrderData?.total_amount || 
              rawOrderData?.data?.total_amount ||
              // Then calculate it from items if not available
              calculateOrderTotal(items) - (rawOrderData?.discount || rawOrderData?.data?.discount || 0)
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderItems;
