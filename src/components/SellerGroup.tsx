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
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [voucherError, setVoucherError] = useState<string>("");

  // Function to apply voucher
  const applyVoucher = () => {
    setVoucherError("");

    // Check if voucher code is provided
    if (!voucherCode.trim()) {
      setVoucherError("Please enter a voucher code");
      return;
    }

    // Get the vendor ID from the first item
    const vendorId = items[0]?.vendor_id?.toString() || '';
    if (!vendorId) {
      setVoucherError("Could not determine vendor ID");
      return;
    }

    // Check if this vendor already has an applied voucher
    const appliedVouchers = voucherService.getAppliedVouchers();
    const alreadyAppliedVoucherId = appliedVouchers[vendorId];

    if (alreadyAppliedVoucherId) {
      // Get the already applied voucher details
      const allVouchers = voucherService.getAllVouchers();
      const existingVoucher = allVouchers.find(v => v.id === alreadyAppliedVoucherId);

      if (existingVoucher) {
        // A voucher is already applied
        setVoucherError(`Another voucher (${existingVoucher.code}) is already applied. Remove it first.`);
        return;
      }
    }

    // Find the voucher with this code
    const voucher = voucherService.getVoucherByCode(voucherCode);
    if (!voucher) {
      setVoucherError("Invalid voucher code");
      return;
    }

    // Check if the voucher belongs to this seller
    const voucherVendorId = typeof voucher.vendorId === 'string' ?
      voucher.vendorId : voucher.vendorId.toString();

    if (voucherVendorId !== vendorId) {
      setVoucherError(`This voucher cannot be applied to products from ${seller}`);
      return;
    }

    // Apply the voucher
    const success = voucherService.applyVoucherForVendor(vendorId, voucherCode);

    if (success) {
      // Update the applied voucher state
      setAppliedVoucher(voucher);
      // Clear voucher code input
      setVoucherCode("");

      // Show success toast
      toast.success(`Applied ${voucher.discountPercentage}% discount for ${seller}`);

      // Force recalculation of the discount
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const discount = voucherService.calculateTotalVoucherDiscount(cartItems);

      // Dispatch custom events to notify other components
      window.dispatchEvent(new CustomEvent('vouchersApplied'));

      // Force a small delay to ensure the event is processed
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('voucherDiscountCalculated', {
          detail: { amount: discount }
        }));
      }, 100);
    } else {
      setVoucherError("Failed to apply voucher. It may be expired or invalid.");
    }
  };

  // Load vouchers and check if one is already applied
  useEffect(() => {
    if (items.length > 0 && items[0].vendor_id) {
      // Get vouchers for this seller
      const vendorId = items[0].vendor_id;
      const vouchers = voucherService.getVendorVouchers(vendorId);
      // Filter for active vouchers only
      const activeVouchers = vouchers.filter(voucher => voucherService.isVoucherValid(voucher));
      setStoreVouchers(activeVouchers);

      // Check if there's an applied voucher
      const appliedVouchers = voucherService.getAppliedVouchers();
      const vendorIdStr = vendorId.toString();

      if (appliedVouchers[vendorIdStr]) {
        // Get the voucher details
        const allVouchers = voucherService.getAllVouchers();
        const applied = allVouchers.find(v => v.id === appliedVouchers[vendorIdStr]);
        if (applied) {
          setAppliedVoucher(applied);
        }
      } else {
        setAppliedVoucher(null);
      }
    }
  }, [items]);

  // Function to check if a product is eligible for a voucher
  const isProductEligibleForVoucher = (item: CartItemWithDetails, voucher: Voucher): boolean => {
    if (!voucher.productIds || voucher.productIds.length === 0) {
      // Voucher applies to all products from this vendor
      return true;
    }

    // Check if this specific product is in the productIds list
    const productId = typeof item.product_id === 'string' ?
      parseInt(item.product_id) : (item.product_id || item.id);

    return voucher.productIds.includes(typeof productId === 'string' ? parseInt(productId) : productId);
  };

  return (
    <div className="mb-8 last:mb-0 bg-neutral-900/40 backdrop-blur-sm rounded-lg overflow-hidden border border-white/5 shadow-xl">
      {/* Seller Header */}
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

      {/* Voucher Section - Shopee-style */}
      <div className="px-4 py-3 bg-gradient-to-r from-amber-900/20 to-neutral-800/20 border-b border-amber-700/20">
        {/* Applied voucher display */}
        {appliedVoucher ? (
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-white">Applied Voucher</span>
              </div>
              <button
                onClick={() => {
                  const vendorId = items[0]?.vendor_id?.toString() || '';
                  if (vendorId) {
                    voucherService.removeVoucherForVendor(vendorId);
                    setAppliedVoucher(null);
                    toast.success(`Removed voucher from ${seller}`);
                    window.dispatchEvent(new CustomEvent('vouchersApplied'));
                  }
                }}
                className="text-red-400 text-xs hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded transition-colors"
              >
                Remove
              </button>
            </div>
            <div className="mt-2 bg-green-500/10 p-2 rounded-md border border-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-green-400 font-mono font-bold">{appliedVoucher.code}</span>
                  <p className="text-white/70 text-xs mt-1">{appliedVoucher.discountPercentage}% off {appliedVoucher.description || 'selected products'}</p>
                </div>
                <div className="bg-green-500/20 rounded-full px-3 py-0.5">
                  <span className="text-green-400 text-xs font-medium">Applied</span>
                </div>
              </div>

              {/* Eligible products */}
              {appliedVoucher.productIds && appliedVoucher.productIds.length > 0 && (
                <div className="mt-2 text-xs text-white/60">
                  <p>Valid for specific products</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Voucher input field */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <span className="text-sm font-medium text-amber-400">Store Voucher</span>
              </div>
              <div className="flex mt-1">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => {
                    setVoucherCode(e.target.value.toUpperCase());
                    if (voucherError) setVoucherError("");
                  }}
                  placeholder="Enter store voucher code"
                  className="flex-1 bg-neutral-800 border border-white/10 rounded-l-md px-3 py-2 text-white text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      applyVoucher();
                    }
                  }}
                />
                <button
                  onClick={applyVoucher}
                  className="bg-amber-500 text-black px-3 py-2 rounded-r-md text-sm font-medium hover:bg-amber-400 transition-colors"
                >
                  Apply
                </button>
              </div>
              {voucherError && (
                <p className="text-red-400 text-xs mt-1">{voucherError}</p>
              )}
            </div>

            {/* Available vouchers display */}
            {storeVouchers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <span className="text-sm font-medium text-amber-400">Available Vouchers</span>
                </div>
                <div className="space-y-2 mt-1">
                  {storeVouchers.map((voucher) => (
                    <div
                      key={voucher.id}
                      className="bg-amber-500/10 border border-amber-500/20 rounded-md p-2 cursor-pointer hover:bg-amber-500/20 transition-colors"
                      onClick={() => {
                        // Apply this voucher directly
                        setVoucherCode(voucher.code);
                        applyVoucher();
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-amber-400">{voucher.code}</span>
                        <span className="text-white text-sm">{voucher.discountPercentage}% OFF</span>
                      </div>
                      <p className="text-white/70 text-xs mt-1">{voucher.description || 'Discount voucher'}</p>

                      {/* Show eligible products if any */}
                      {voucher.productIds && voucher.productIds.length > 0 && (
                        <div className="mt-1 text-xs flex items-center gap-1">
                          <span className="text-amber-400/80">Eligible items: </span>
                          <span className="text-white/60">{voucher.productIds.length} product(s)</span>
                        </div>
                      )}

                      {/* Show other voucher details */}
                      <div className="flex gap-3 mt-1 text-xs text-white/60">
                        {(voucher.minPurchase ?? 0) > 0 && (
                          <span className="bg-white/5 px-1.5 py-0.5 rounded">
                            Min: {voucher.minPurchase}
                          </span>
                        )}
                        {(voucher.maxDiscount ?? 0) > 0 && (
                          <span className="bg-white/5 px-1.5 py-0.5 rounded">
                            Max: {voucher.maxDiscount}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Cart Items */}
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
            hasVoucherDiscount={
              appliedVoucher !== null &&
              isProductEligibleForVoucher(item, appliedVoucher)
            }
            voucherDiscount={
              appliedVoucher !== null &&
                isProductEligibleForVoucher(item, appliedVoucher) ?
                appliedVoucher.discountPercentage : 0
            }
          />
        ))}
      </div>
    </div>
  );
};

export default SellerGroup;