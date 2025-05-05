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
    <div className="bg-neutral-900/80 backdrop-blur-sm rounded-md border border-white/10 p-6">
      <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
      
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 border-b border-white/10 pb-4">
            <div className="relative w-16 h-16 bg-neutral-800 rounded-md overflow-hidden flex-shrink-0">
              {item.product?.image_url ? (
                <Image
                  src={item.product.image_url}
                  alt={item.product.name || 'Product image'}
                  fill
                  sizes="64px"
                  className="object-cover"
                  onError={(e) => {
                    // Fallback to placeholder on error
                    (e.target as HTMLImageElement).src = '/images/placeholder.png';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div className="absolute top-0 right-0 bg-amber-500 text-black text-xs font-medium px-1 rounded-bl-md">
                {item.quantity}
              </div>
            </div>
            
            <div className="flex-grow min-w-0">
              <h3 className="text-white font-medium truncate">
                {item.product?.name || 'Product'}
              </h3>
              <p className="text-white/60 text-sm">
                {formatCurrency(item.product?.price || 0)} each
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-amber-500 font-medium">
                {formatCurrency((item.product?.price || 0) * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="space-y-3 border-t border-white/10 pt-4">
        <div className="flex justify-between text-white/70">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-green-400">
            <span>Discount {promoCode && `(${promoCode})`}</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-white font-bold pt-2 border-t border-white/10">
          <span>Total</span>
          <span className="text-amber-500">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSummary;
