"use client";

import React, { useState, useEffect } from 'react';
import { CartItemWithDetails } from '@/types/cart';
import CartItem from './CartItem';
import voucherService from '@/services/vouchers';
import { Voucher } from '@/services/vouchers';
import toast from 'react-hot-toast';

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
  const [storeVouchers, setStoreVouchers] = useState<Voucher[]>([]);
  
  useEffect(() => {
    if (items.length > 0 && items[0].vendor_id) {
      // Get vouchers for this seller
      const vendorId = items[0].vendor_id;
      const vouchers = voucherService.getVendorVouchers(vendorId);
      // Filter for active vouchers only
      const activeVouchers = vouchers.filter(voucher => voucherService.isVoucherValid(voucher));
      setStoreVouchers(activeVouchers);
    }
  }, [items]);
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
      
      {storeVouchers.length > 0 && (
        <div className="px-4 py-2 bg-gradient-to-r from-amber-900/20 to-neutral-800/20 border-b border-amber-700/20">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <span className="text-sm font-medium text-amber-400">Available Vouchers</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {storeVouchers.map((voucher) => (
              <div 
                key={voucher.id} 
                className="bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-1 text-xs flex items-center gap-2 cursor-pointer hover:bg-amber-500/20 transition-colors"
                onClick={() => {
                  // Get the vendor ID from the first item
                  const vendorId = items[0]?.vendor_id?.toString() || '';
                  if (!vendorId) {
                    toast.error('Could not determine vendor ID');
                    return;
                  }
                  
                  // Check if this vendor already has an applied voucher
                  const appliedVouchers = voucherService.getAppliedVouchers();
                  const alreadyAppliedVoucherId = appliedVouchers[vendorId];
                  
                  if (alreadyAppliedVoucherId) {
                    // Get the already applied voucher details
                    const allVouchers = voucherService.getAllVouchers();
                    const appliedVoucher = allVouchers.find(v => v.id === alreadyAppliedVoucherId);
                    
                    if (appliedVoucher && appliedVoucher.code === voucher.code) {
                      // The same voucher is already applied
                      toast(`Voucher ${voucher.code} is already applied to ${seller}`, {
                        icon: '🔔',
                        style: {
                          background: '#3b82f6',
                          color: 'white',
                        },
                      });
                      return;
                    } else if (appliedVoucher) {
                      // A different voucher is already applied
                      toast(`Another voucher (${appliedVoucher.code}) is already applied to ${seller}. Remove it first to apply a different voucher.`, {
                        icon: '🔔',
                        style: {
                          background: '#3b82f6',
                          color: 'white',
                        },
                      });
                      return;
                    }
                  }
                  
                  // Apply the voucher directly
                  const success = voucherService.applyVoucherForVendor(vendorId, voucher.code);
                  
                  if (success) {
                    // Show success toast
                    toast.success(`Applied ${voucher.discountPercentage}% discount for ${seller}`);
                    
                    // Dispatch a custom event to notify the cart page that vouchers have been applied
                    const event = new CustomEvent('vouchersApplied');
                    window.dispatchEvent(event);
                    
                    // Instead of forcing a page refresh, let the event handler update the state
                  } else {
                    toast.error('Failed to apply voucher');
                  }
                }}
              >
                <span className="font-mono font-bold text-amber-400">{voucher.code}</span>
                <span className="text-white/70">{voucher.discountPercentage}% off</span>
                {voucher.minPurchase && <span className="text-white/50">min {voucher.minPurchase}</span>}
                {voucher.maxDiscount && <span className="text-white/50">max {voucher.maxDiscount}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
      
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
