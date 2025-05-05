"use client";

import React from 'react';
import Image from 'next/image';
import { formatCurrency } from '@/utils/format';
import { CartItemWithDetails } from '@/types/cart';

interface CheckoutSummaryProps {
  items: CartItemWithDetails[];
  subtotal: number;
  discount: number;
  total: number;
  promoCode?: string;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  items,
  subtotal,
  discount,
  total,
  promoCode
}) => {
  return (
    <div className="bg-neutral-900/80 backdrop-blur-sm rounded-lg shadow-sm border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="bg-green-900/30 px-6 py-4 border-b border-white/10 flex items-center">
        <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-white">Order Summary</h2>
      </div>
      
      {/* Products List */}
      <div className="p-6 space-y-6">
        {/* Products */}
        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
          <h3 className="font-medium text-white/80 mb-3">Products ({items.length})</h3>
          
          <div className="space-y-4 divide-y divide-white/10">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 pt-4 first:pt-0">
                <div className="flex-grow min-w-0 flex flex-col">
                  <p className="text-white font-medium">
                    {item.quantity}
                  </p>
                  <h4 className="text-white font-medium truncate">
                    {item.product?.name || 'Product'}
                  </h4>
                  <p className="text-white/60 text-sm">
                    {formatCurrency(item.product?.price || 0)} × {item.quantity}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-green-400 font-medium">
                    {formatCurrency((item.product?.price || 0) * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Price Breakdown */}
        <div className="space-y-3 border-t border-white/10 pt-4">
          <div className="flex justify-between text-white/70">
            <span>Subtotal</span>
            <span className="text-white">{formatCurrency(subtotal)}</span>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between text-white/70">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Discount {promoCode && <span className="ml-1 bg-green-900/50 text-green-400 text-xs px-2 py-0.5 rounded">{promoCode}</span>}
              </span>
              <span className="text-green-400">-{formatCurrency(discount)}</span>
            </div>
          )}
          
          <div className="flex justify-between text-white/70">
            <span>Shipping</span>
            <span className="text-white">Free</span>
          </div>
          
          <div className="flex justify-between text-white font-bold pt-3 border-t border-white/10 mt-2">
            <span>Total</span>
            <span className="text-green-400 text-lg">{formatCurrency(total)}</span>
          </div>
        </div>
        
        {/* Security Info */}
        <div className="mt-4 p-4 bg-black/30 rounded-lg border border-white/10">
          <div className="flex items-center text-white/70 text-sm">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Your order is protected and secure</span>
          </div>
          <div className="flex items-center text-white/70 text-sm mt-2">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Estimated delivery: 2-4 business days</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSummary;
