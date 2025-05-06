"use client";

import React from 'react';
import { CartItemWithDetails } from '@/types/cart';
import { formatCurrency } from '@/utils/format';

interface CheckoutOptionsProps {
  groupedItems: Record<string, CartItemWithDetails[]>;
  ecoPackaging: Record<string | number, boolean>;
  carbonOffset: boolean;
  onEcoPackagingChange: (sellerId: string | number, checked: boolean) => void;
  onCarbonOffsetChange: (checked: boolean) => void;
  promoCode: string;
  onPromoCodeChange: (code: string) => void;
  onApplyPromoCode: () => void;
  ecoPackagingCost: number;
  carbonOffsetCost: number;
}

const CheckoutOptions: React.FC<CheckoutOptionsProps> = ({
  groupedItems,
  ecoPackaging,
  carbonOffset,
  onEcoPackagingChange,
  onCarbonOffsetChange,
  promoCode,
  onPromoCodeChange,
  onApplyPromoCode,
  ecoPackagingCost,
  carbonOffsetCost
}) => {
  return (
    <div className="bg-neutral-900/80 backdrop-blur-sm rounded-lg border border-white/10 p-6 mb-6">
      <h2 className="text-xl font-bold text-white mb-4">Eco-Friendly Options</h2>
      
      {/* Eco-friendly packaging options */}
      <div className="mb-6">
        <h3 className="font-medium text-white mb-3">Eco-Friendly Packaging</h3>
        <p className="text-white/70 text-sm mb-4">
          Choose eco-friendly packaging for your items to reduce environmental impact.
        </p>
        
        <div className="space-y-3">
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
            const itemCount = items.length;
            
            return (
              <div key={sellerId} className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`eco-${sellerId}`}
                    checked={ecoPackaging[sellerId] || false}
                    onChange={(e) => onEcoPackagingChange(sellerId, e.target.checked)}
                    className="w-4 h-4 rounded border-white/30 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 focus:ring-offset-transparent bg-black/30"
                  />
                  <label htmlFor={`eco-${sellerId}`} className="ml-2 text-white">
                    {sellerName} ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                  </label>
                </div>
                <span className="text-white/70">+{formatCurrency(5000)}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Carbon offset option */}
      <div className="mb-6 pb-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="carbon-offset"
              checked={carbonOffset}
              onChange={(e) => onCarbonOffsetChange(e.target.checked)}
              className="w-4 h-4 rounded border-white/30 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 focus:ring-offset-transparent bg-black/30"
            />
            <label htmlFor="carbon-offset" className="ml-2 text-white">
              Carbon Offset for Delivery
            </label>
          </div>
          <span className="text-white/70">+{formatCurrency(3800)}</span>
        </div>
        <p className="text-white/70 text-xs mt-2 ml-6">
          Offset the carbon emissions from your delivery by supporting verified climate projects.
        </p>
      </div>
      
      {/* Promo code */}
      <div>
        <h3 className="font-medium text-white mb-3">Promo Code</h3>
        <div className="flex">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => onPromoCodeChange(e.target.value)}
            placeholder="Enter promo code"
            className="flex-grow bg-black/30 border border-white/10 rounded-l-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={onApplyPromoCode}
            className="bg-amber-500 text-black px-4 py-2 rounded-r-lg hover:bg-amber-400 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutOptions;
