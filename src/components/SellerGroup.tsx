"use client";

import React from 'react';
import CartItem from '@/components/CartItem';
import { CartItemWithDetails } from '@/types/cart';

interface SellerGroupProps {
  seller: string;
  items: CartItemWithDetails[];
  selectedItems: Set<string | number>;
  onToggleSelect: (id: string | number) => void;
  onUpdateQuantity: (id: string | number, quantity: number) => void;
  onRemoveItem: (id: string | number) => void;
  loading?: boolean;
}

const SellerGroup: React.FC<SellerGroupProps> = ({
  seller,
  items,
  selectedItems,
  onToggleSelect,
  onUpdateQuantity,
  onRemoveItem,
  loading = false
}) => {
  return (
    <div className="mb-8 last:mb-0 bg-neutral-900/40 backdrop-blur-sm rounded-lg overflow-hidden border border-white/5 shadow-xl">
      <a 
        href={`/store/${items[0]?.vendor_id}`} 
        className="bg-gradient-to-r from-amber-900/60 to-neutral-800/60 p-4 border-b border-amber-700/30 flex items-center gap-3 hover:from-amber-800/60 hover:to-neutral-700/60 transition-colors cursor-pointer group"
      >
        {items[0]?.seller_image ? (
          <div className="w-12 h-12 rounded-full overflow-hidden bg-amber-600/20 flex items-center justify-center border-2 border-amber-500/30 shadow-lg">
            <img 
              src={items[0].seller_image} 
              alt={`${seller}'s profile`} 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=☕';
              }}
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600/40 to-amber-800/40 flex items-center justify-center border-2 border-amber-500/30 shadow-lg">
            <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold text-lg group-hover:text-amber-400 transition-colors">
              {seller || 'Unknown Seller'}
            </h3>
            <svg className="w-4 h-4 text-amber-500/70 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
          <div className="flex items-center gap-3 mt-1">
            {items[0]?.seller_city && (
              <span className="text-amber-400/70 text-xs flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                  <circle cx="12" cy="11" r="3" />
                </svg>
                {items[0].seller_city}
              </span>
            )}
            <span className="text-white/50 text-xs bg-white/5 px-2 py-0.5 rounded-full">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
          </div>
        </div>
      </a>
      
      <div className="p-3">
        {items.map(item => (
          <CartItem
            key={item.id}
            item={item}
            selected={selectedItems.has(item.id)}
            loading={loading}
            onSelect={() => onToggleSelect(item.id)}
            onUpdateQuantity={(id, quantity) => onUpdateQuantity(id, quantity)}
            onRemove={(id) => onRemoveItem(id)}
          />
        ))}
      </div>
    </div>
  );
};

export default SellerGroup;
