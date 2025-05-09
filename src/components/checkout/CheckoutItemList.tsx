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
          // Then try to get from seller property
          items[0]?.seller ||
          // Then try to get location as fallback
          items[0]?.product?.location || 
          // Default fallback
          'Local Artisan'
        );
        
        // Get seller location if available
        const sellerLocation = items[0]?.seller_city || (items[0]?.product as any)?.location || '';
        
        return (
          <div key={sellerId} className="mb-6 last:mb-0">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
              <div>
                <h3 className="font-medium text-white flex items-center">
                  <svg className="w-4 h-4 text-amber-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {sellerName}
                </h3>
                {sellerLocation && (
                  <div className="text-white/50 text-xs flex items-center mt-1">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {sellerLocation}
                  </div>
                )}
              </div>
              <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full text-xs font-medium">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-20 bg-neutral-800 rounded-md flex-shrink-0 overflow-hidden border border-white/10 shadow-md">
                    {(item.image_url || item.product?.image_url) ? (
                      <img 
                        src={item.image_url || item.product?.image_url} 
                        alt={item.name || item.product?.name || `Product #${item.product_id}`} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=200';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-900/30 to-green-900/30 text-white/70">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-white">{item.name || item.product?.name || `Product #${item.product_id}`}</h4>
                      <span className="text-amber-500 font-medium">
                        {formatCurrency((item.price || item.unit_price || item.product?.price || 0) * item.quantity)}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center text-white/70 text-sm mt-1">
                      <div className="bg-black/30 rounded-full px-2 py-0.5 mr-2 text-xs">
                        <span>Qty: {item.quantity}</span>
                      </div>
                      <span>{formatCurrency(item.price || item.unit_price || item.product?.price || 0)} each</span>
                      
                      {/* Product category if available */}
                      {item.product?.categories?.[0]?.name && (
                        <div className="ml-auto bg-green-900/20 text-green-400 rounded-full px-2 py-0.5 text-xs">
                          {item.product?.categories?.[0]?.name}
                        </div>
                      )}
                    </div>
                    
                    {/* Product notes */}
                    <div className="mt-3">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Add note for this item (optional)"
                          value={productNotes[item.product_id] || ''}
                          onChange={(e) => onProductNoteChange(item.product_id, e.target.value)}
                          className="w-full bg-black/30 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
                        />
                        <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
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
