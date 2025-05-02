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
    <div className="mb-6 last:mb-0">
      <div className="bg-gradient-to-r from-amber-900/60 to-neutral-800/60 backdrop-blur-sm p-4 border-b border-amber-700/30 flex items-center gap-3">
        {items[0]?.seller_image ? (
          <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-600/20 flex items-center justify-center">
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
          <div className="bg-amber-600/20 p-2 rounded-full">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-white font-medium text-lg">{seller || 'Unknown Seller'}</h3>
          <div className="flex items-center gap-2">
            {items[0]?.seller_city && (
              <span className="text-amber-400/70 text-xs flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                  <circle cx="12" cy="11" r="3" />
                </svg>
                {items[0].seller_city}
              </span>
            )}
            <span className="text-white/50 text-xs">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
          </div>
        </div>
      </div>
      <div>
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
