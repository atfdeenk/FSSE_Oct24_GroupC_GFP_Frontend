"use client";

import { useState, useEffect } from 'react';
import { Voucher } from '@/services/vouchers';
import voucherService from '@/services/vouchers';
import { formatCurrency } from '@/utils/format';
import toast from 'react-hot-toast';

interface SellerVouchersProps {
  cartItems: any[];
  onVouchersApplied: () => void;
}

export default function SellerVouchers({ cartItems, onVouchersApplied }: SellerVouchersProps) {
  // Group cart items by seller
  const [sellerGroups, setSellerGroups] = useState<{ [key: string]: any }>({});
  const [sellerVouchers, setSellerVouchers] = useState<{ [key: string]: Voucher[] }>({});
  const [voucherCodes, setVoucherCodes] = useState<{ [key: string]: string }>({});
  const [voucherErrors, setVoucherErrors] = useState<{ [key: string]: string }>({});
  const [appliedVouchers, setAppliedVouchers] = useState<{ [key: string]: string }>({});

  // Initialize seller groups and vouchers
  useEffect(() => {
    // Group cart items by seller
    const groups: { [key: string]: any } = {};
    
    cartItems.forEach(item => {
      const vendorId = item.vendor_id?.toString() || '';
      if (!vendorId) return;
      
      if (!groups[vendorId]) {
        groups[vendorId] = {
          vendorId,
          sellerName: item.seller || `Seller ${vendorId}`,
          items: []
        };
      }
      
      groups[vendorId].items.push(item);
    });
    
    setSellerGroups(groups);
    
    // Get vouchers for each seller
    const vouchers: { [key: string]: Voucher[] } = {};
    
    Object.keys(groups).forEach(vendorId => {
      vouchers[vendorId] = voucherService.getVendorVouchers(vendorId);
    });
    
    setSellerVouchers(vouchers);
    
    // Initialize voucher codes and errors
    const codes: { [key: string]: string } = {};
    const errors: { [key: string]: string } = {};
    
    Object.keys(groups).forEach(vendorId => {
      codes[vendorId] = '';
      errors[vendorId] = '';
    });
    
    setVoucherCodes(codes);
    setVoucherErrors(errors);
    
    // Get currently applied vouchers
    setAppliedVouchers(voucherService.getAppliedVouchers());
  }, [cartItems]);

  // Apply a voucher for a specific seller
  const applyVoucher = (vendorId: string) => {
    // Reset error for this seller
    setVoucherErrors(prev => ({
      ...prev,
      [vendorId]: ''
    }));
    
    const voucherCode = voucherCodes[vendorId];
    if (!voucherCode) {
      setVoucherErrors(prev => ({
        ...prev,
        [vendorId]: 'Please enter a voucher code'
      }));
      return;
    }
    
    // Try to apply the voucher
    const success = voucherService.applyVoucherForVendor(vendorId, voucherCode);
    
    if (success) {
      // Get the applied voucher details
      const voucher = voucherService.getVoucherByCode(voucherCode);
      
      // Update applied vouchers state
      setAppliedVouchers(voucherService.getAppliedVouchers());
      
      // Clear voucher code input
      setVoucherCodes(prev => ({
        ...prev,
        [vendorId]: ''
      }));
      
      // Show success toast
      toast.success(`Applied ${voucher?.discountPercentage}% discount for ${sellerGroups[vendorId]?.sellerName}`);
      
      // Notify parent component
      onVouchersApplied();
    } else {
      // Show error
      setVoucherErrors(prev => ({
        ...prev,
        [vendorId]: 'Invalid or expired voucher code'
      }));
      
      toast.error('Invalid or expired voucher code');
    }
  };
  
  // Remove an applied voucher
  const removeVoucher = (vendorId: string) => {
    // Get the voucher ID before removing
    const voucherId = appliedVouchers[vendorId];
    const allVouchers = voucherService.getAllVouchers();
    const voucher = allVouchers.find(v => v.id === voucherId);
    
    // Remove the voucher
    const success = voucherService.removeVoucherForVendor(vendorId);
    
    if (success) {
      // Update applied vouchers state
      setAppliedVouchers(voucherService.getAppliedVouchers());
      
      // Show success toast
      toast.success(`Removed discount for ${sellerGroups[vendorId]?.sellerName}`);
      
      // Notify parent component
      onVouchersApplied();
    }
  };
  
  // Get available vouchers for a seller
  const getAvailableVouchers = (vendorId: string) => {
    return sellerVouchers[vendorId] || [];
  };
  
  // Check if a seller has an applied voucher
  const hasAppliedVoucher = (vendorId: string) => {
    return !!appliedVouchers[vendorId];
  };
  
  // Get applied voucher details for a seller
  const getAppliedVoucherDetails = (vendorId: string) => {
    if (!appliedVouchers[vendorId]) return null;
    
    const voucherId = appliedVouchers[vendorId];
    const allVouchers = voucherService.getAllVouchers();
    return allVouchers.find(v => v.id === voucherId) || null;
  };
  
  // Calculate subtotal for a seller's items
  const calculateSellerSubtotal = (items: any[]) => {
    return items.reduce((sum, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0);
  };

  return (
    <div className="space-y-6 mt-4">
      <h3 className="text-lg font-medium text-white">Seller Vouchers</h3>
      <p className="text-white/60 text-sm mb-4">Apply vouchers from different sellers to maximize your savings</p>
      
      {Object.keys(sellerGroups).length === 0 ? (
        <div className="text-white/60 text-center py-4">
          No items in cart
        </div>
      ) : (
        <div className="space-y-4">
          {Object.values(sellerGroups).map((group: any) => {
            const vendorId = group.vendorId;
            const availableVouchers = getAvailableVouchers(vendorId);
            const hasVoucher = hasAppliedVoucher(vendorId);
            const appliedVoucher = getAppliedVoucherDetails(vendorId);
            const subtotal = calculateSellerSubtotal(group.items);
            
            return (
              <div key={vendorId} className="p-4 bg-neutral-800 rounded-lg border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-white">{group.sellerName}</h4>
                  <span className="text-white/60 text-sm">
                    {group.items.length} {group.items.length === 1 ? 'item' : 'items'} · {formatCurrency(subtotal)}
                  </span>
                </div>
                
                {hasVoucher ? (
                  <div className="bg-green-900/30 border border-green-500/30 p-3 rounded-md mt-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-green-400 font-medium">{appliedVoucher?.discountPercentage}% OFF</span>
                        <p className="text-white/60 text-xs mt-1">{appliedVoucher?.description || 'Discount applied'}</p>
                      </div>
                      <button 
                        onClick={() => removeVoucher(vendorId)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voucherCodes[vendorId] || ''}
                        onChange={(e) => setVoucherCodes(prev => ({
                          ...prev,
                          [vendorId]: e.target.value
                        }))}
                        placeholder="Enter voucher code"
                        className="flex-1 bg-neutral-700 border border-white/10 rounded-md px-3 py-2 text-white text-sm"
                        onKeyDown={(e) => {
                          // Apply voucher when Enter key is pressed
                          if (e.key === 'Enter') {
                            applyVoucher(vendorId);
                          }
                        }}
                      />
                      <button
                        onClick={() => applyVoucher(vendorId)}
                        className="bg-amber-500 text-black px-3 py-2 rounded-md text-sm font-medium hover:bg-amber-400 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    {voucherErrors[vendorId] && (
                      <p className="text-red-400 text-xs mt-1">{voucherErrors[vendorId]}</p>
                    )}
                    
                    {availableVouchers.length > 0 && (
                      <div className="mt-3">
                        <p className="text-white/60 text-xs mb-2">Available vouchers (click to apply):</p>
                        <div className="space-y-2">
                          {availableVouchers.slice(0, 3).map(voucher => (
                            <div 
                              key={voucher.id}
                              className="bg-neutral-700 border border-white/10 p-2 rounded-md cursor-pointer hover:bg-neutral-600 transition-colors"
                              onClick={() => {
                                // Check if this vendor already has an applied voucher
                                const currentAppliedVouchers = voucherService.getAppliedVouchers();
                                const alreadyAppliedVoucherId = currentAppliedVouchers[vendorId];
                                
                                if (alreadyAppliedVoucherId) {
                                  // Get the already applied voucher details
                                  const allVouchers = voucherService.getAllVouchers();
                                  const appliedVoucher = allVouchers.find(v => v.id === alreadyAppliedVoucherId);
                                  
                                  if (appliedVoucher && appliedVoucher.code === voucher.code) {
                                    // The same voucher is already applied
                                    toast(`Voucher ${voucher.code} is already applied to ${sellerGroups[vendorId]?.sellerName}`, {
                                      icon: '🔔',
                                      style: {
                                        background: '#3b82f6',
                                        color: 'white',
                                      },
                                    });
                                    return;
                                  }
                                }
                                
                                // Apply voucher directly when clicked
                                const success = voucherService.applyVoucherForVendor(vendorId, voucher.code);
                                
                                if (success) {
                                  // Update applied vouchers state
                                  setAppliedVouchers(voucherService.getAppliedVouchers());
                                  
                                  // Calculate and store the updated voucher discount
                                  const discount = voucherService.calculateTotalVoucherDiscount(cartItems);
                                  localStorage.setItem('voucherDiscount', discount.toString());
                                  localStorage.setItem('useSellerVouchers', 'true');
                                  
                                  // Show success toast
                                  toast.success(`Applied ${voucher.discountPercentage}% discount for ${sellerGroups[vendorId]?.sellerName}`);
                                  
                                  // Notify parent component
                                  onVouchersApplied();
                                } else {
                                  toast.error('Failed to apply voucher');
                                }
                              }}
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-amber-400 font-medium">{voucher.code}</span>
                                <span className="text-white text-sm">{voucher.discountPercentage}% OFF</span>
                              </div>
                              <p className="text-white/60 text-xs mt-1">{voucher.description || 'Discount voucher'}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
