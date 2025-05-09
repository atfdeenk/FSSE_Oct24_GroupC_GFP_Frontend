"use client";

import { useState, useEffect, useCallback } from 'react';
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to refresh voucher data
  const refreshVoucherData = useCallback(() => {
    setIsRefreshing(true);
    
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
    
    setIsRefreshing(false);
  }, [cartItems]);
  
  // Initialize seller groups and vouchers
  useEffect(() => {
    refreshVoucherData();
    
    // Listen for voucher changes
    const handleVouchersChanged = () => {
      refreshVoucherData();
      onVouchersApplied();
    };
    
    window.addEventListener('vouchersChanged', handleVouchersChanged);
    
    return () => {
      window.removeEventListener('vouchersChanged', handleVouchersChanged);
    };
  }, [cartItems, refreshVoucherData, onVouchersApplied]);

  // Handle voucher application
  const handleApplyVoucher = (voucherCode: string, vendorId: string | number) => {
    // Check if a voucher is already applied for this vendor
    const appliedVouchers = voucherService.getAppliedVouchers();
    if (appliedVouchers[vendorId]) {
      // Check if it's the same voucher
      const voucher = voucherService.getVoucherByCode(voucherCode);
      if (voucher && appliedVouchers[vendorId] === voucher.id) {
        toast.error('This voucher is already applied');
        return;
      }
    }
    
    console.log('Applying voucher:', { voucherCode, vendorId });
    
    // Apply the voucher
    const success = voucherService.applyVoucherForVendor(vendorId, voucherCode);
    
    if (success) {
      // Get the voucher details for better feedback
      const voucher = voucherService.getVoucherByCode(voucherCode);
      const discountText = voucher ? `${voucher.discountPercentage}%` : '';
      
      toast.success(`Voucher ${voucherCode} applied successfully! ${discountText}`);
      
      // Force recalculation of the discount
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const discount = voucherService.calculateTotalVoucherDiscount(cartItems);
      
      console.log('Voucher applied with discount:', { discount, voucherCode });
      
      // Dispatch event to notify that vouchers are applied
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('vouchersApplied'));
        
        // Force a small delay to ensure the event is processed
        setTimeout(() => {
          // Dispatch another event to ensure all components are updated
          window.dispatchEvent(new CustomEvent('voucherDiscountCalculated', {
            detail: { amount: discount }
          }));
        }, 100);
      }
    } else {
      toast.error(`Voucher ${voucherCode} is invalid or cannot be applied`);
    }
  };

  // Apply a voucher for a specific seller
  const applyVoucher = (vendorId: string) => {
    // Reset error for this seller
    setVoucherErrors(prev => ({
      ...prev,
      [vendorId]: ''
    }));
    
    // Get voucher code for this seller
    const voucherCode = voucherCodes[vendorId];
    
    if (!voucherCode) {
      setVoucherErrors(prev => ({
        ...prev,
        [vendorId]: 'Please enter a voucher code'
      }));
      return;
    }
    
    // Apply the voucher
    handleApplyVoucher(voucherCode, vendorId);
    
    // Clear voucher code input after applying
    setVoucherCodes(prev => ({
      ...prev,
      [vendorId]: ''
    }));
    
    // Update applied vouchers state
    setAppliedVouchers(voucherService.getAppliedVouchers());
  };

  // Remove an applied voucher
  const removeVoucher = (vendorId: string) => {
    // Remove the voucher - the service now handles all the side effects
    const success = voucherService.removeVoucherForVendor(vendorId);
    
    if (!success) {
      toast.error('Failed to remove voucher');
    }
    
    // The vouchersChanged event will trigger refreshVoucherData
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
                                  } else if (appliedVoucher) {
                                    // A different voucher is already applied
                                    toast(`Another voucher (${appliedVoucher.code}) is already applied. Remove it first.`, {
                                      icon: '🔔',
                                      style: {
                                        background: '#3b82f6',
                                        color: 'white',
                                      },
                                    });
                                    return;
                                  }
                                }
                                
                                // Apply the voucher
                                const success = voucherService.applyVoucherForVendor(vendorId, voucher.code);
                                
                                if (success) {
                                  // Recalculate discount using the service
                                  const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
                                  voucherService.calculateTotalVoucherDiscount(cartItems);
                                  
                                  // Update applied vouchers state
                                  setAppliedVouchers(voucherService.getAppliedVouchers());
                                  
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
