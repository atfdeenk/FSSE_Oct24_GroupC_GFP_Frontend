"use client";

import React from 'react';
import { CartItemWithDetails } from '@/types/cart';
import { formatCurrency } from '@/utils/format';

interface CheckoutItemListProps {
  groupedItems: Record<string, CartItemWithDetails[]>;
  productNotes: Record<string | number, string>;
  onProductNoteChange: (productId: string | number, note: string) => void;
}

const CheckoutItemList: React.FC<CheckoutItemListProps> = ({
  groupedItems,
  productNotes,
  onProductNoteChange
}) => {
  return (
    <div className="bg-neutral-900/80 backdrop-blur-sm rounded-lg border border-white/10 p-6 mb-6">
      <h2 className="text-xl font-bold text-white mb-4">Order Items</h2>
      
      {Object.entries(groupedItems).map(([sellerId, items]) => {
        // Get seller name from available properties with fallbacks
        const sellerName = (
          // Try to get from product first if it has a vendor property
          (items[0]?.product as any)?.vendor_name || 
          // Then try to get location as fallback
          items[0]?.product?.location || 
          // Default fallback
          'Local Artisan'
        );
        
        return (
          <div key={sellerId} className="mb-6 last:mb-0">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
              <h3 className="font-medium text-white">{sellerName}</h3>
              <span className="text-white/70 text-sm">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
            </div>
            
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 bg-neutral-800 rounded-md flex-shrink-0 overflow-hidden">
                    {item.product?.image_url ? (
                      <img 
                        src={item.product.image_url} 
                        alt={item.product?.name || 'Product'} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-white">{item.product?.name || `Product #${item.product_id}`}</h4>
                      <span className="text-amber-500 font-medium">
                        {formatCurrency((item.price || item.product?.price || 0) * item.quantity)}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-white/70 text-sm mt-1">
                      <span>Qty: {item.quantity}</span>
                      <span className="mx-2">•</span>
                      <span>{formatCurrency(item.price || item.product?.price || 0)} each</span>
                    </div>
                    
                    {/* Product notes */}
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Add note for this item (optional)"
                        value={productNotes[item.product_id] || ''}
                        onChange={(e) => onProductNoteChange(item.product_id, e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CheckoutItemList;
