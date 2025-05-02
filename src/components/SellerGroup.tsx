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
      <div className="bg-neutral-800/70 backdrop-blur-sm p-3 border-b border-white/10 flex items-center gap-2">
        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <h3 className="text-white font-medium">{seller || 'Unknown Seller'}</h3>
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
