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
  ecoPackagingCost: number;
  carbonOffsetCost: number;
}

const CheckoutOptions: React.FC<CheckoutOptionsProps> = ({
  groupedItems,
  ecoPackaging,
  carbonOffset,
  onEcoPackagingChange,
  onCarbonOffsetChange,
  ecoPackagingCost,
  carbonOffsetCost
}) => {
  return (
    <div className="bg-neutral-900/80 backdrop-blur-sm rounded-lg border border-white/10 p-6 mb-6">
      <div className="flex items-center mb-4">
        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        <h2 className="text-xl font-bold text-white">Eco-Friendly Options</h2>
      </div>
      
      {/* Sustainable options card */}
      <div className="bg-green-900/20 rounded-lg border border-green-500/20 p-4 mb-6">
        <div className="flex items-center mb-3">
          <svg className="w-5 h-5 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
          </svg>
          <h3 className="font-medium text-green-400">Sustainable Choices</h3>
        </div>
        <p className="text-white/70 text-sm mb-4 border-l-2 border-green-500/30 pl-3">
          Make your purchase more sustainable with these eco-friendly options. Each choice helps reduce environmental impact.
        </p>
        
        {/* Carbon offset option */}
        <div className="mb-4 bg-black/20 rounded-lg p-3 border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  id="carbon-offset"
                  checked={carbonOffset}
                  onChange={(e) => onCarbonOffsetChange(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-green-500/50 text-green-500 focus:ring-green-500 focus:ring-offset-0 focus:ring-offset-transparent bg-black/30 cursor-pointer appearance-none"
                />
                {/* Custom checkbox appearance */}
                {carbonOffset && (
                  <svg className="absolute left-0.5 top-0.5 w-4 h-4 text-green-500 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <label htmlFor="carbon-offset" className="ml-2 text-white flex items-center">
                <svg className="w-4 h-4 text-green-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Carbon Offset for Delivery
              </label>
            </div>
            <span className="bg-green-900/30 text-green-400 px-2 py-0.5 rounded text-xs font-medium">+{formatCurrency(carbonOffsetCost)}</span>
          </div>
          <p className="text-white/60 text-xs mt-2 ml-6">
            Offset carbon emissions from your delivery by supporting verified climate projects.
          </p>
        </div>
        
        {/* Eco-friendly packaging options */}
        <div>
          <div className="flex items-center mb-2">
            <svg className="w-4 h-4 text-green-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <h4 className="font-medium text-white text-sm">Eco-Friendly Packaging</h4>
          </div>
          
          <div className="space-y-2">
            {Object.entries(groupedItems).map(([sellerId, items]) => {
              // Get seller name from available properties with fallbacks
              const sellerName = (
                // Try to get from product first if it has a vendor property
                (items[0]?.product as any)?.vendor_name || 
                items[0]?.seller ||
                // Then try to get location as fallback
                items[0]?.product?.location || 
                // Default fallback
                'Local Artisan'
              );
              const itemCount = items.length;
              
              return (
                <div key={sellerId} className="flex items-center justify-between bg-black/20 rounded-lg p-2 border border-white/5">
                  <div className="flex items-center">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        id={`eco-${sellerId}`}
                        checked={ecoPackaging[sellerId] || false}
                        onChange={(e) => onEcoPackagingChange(sellerId, e.target.checked)}
                        className="w-5 h-5 rounded border-2 border-green-500/50 text-green-500 focus:ring-green-500 focus:ring-offset-0 focus:ring-offset-transparent bg-black/30 cursor-pointer appearance-none"
                      />
                      {/* Custom checkbox appearance */}
                      {ecoPackaging[sellerId] && (
                        <svg className="absolute left-0.5 top-0.5 w-4 h-4 text-green-500 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <label htmlFor={`eco-${sellerId}`} className="ml-2 text-white text-sm">
                      {sellerName} <span className="text-white/50">({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                    </label>
                  </div>
                  <span className="bg-green-900/30 text-green-400 px-2 py-0.5 rounded text-xs font-medium">+{formatCurrency(ecoPackagingCost)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      

    </div>
  );
};

export default CheckoutOptions;
