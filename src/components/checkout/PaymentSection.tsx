import React from 'react';
import { formatCurrency } from '@/utils/format';
import PromoCodeInput from '@/components/PromoCodeInput';

interface PaymentSectionProps {
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'balance' | 'cod';
  isSubmitting: boolean;
  onPaymentMethodChange: (method: string) => void;
  onCheckout: () => void;
  ecoPackagingCost?: number;
  carbonOffsetCost?: number;
  ecoPackagingCount?: number;
  carbonOffsetEnabled?: boolean;
  promoCode: string;
  promoError: string;
  promoDiscount: number;
  onPromoCodeChange: (code: string) => void;
  onApplyPromoCode: () => void;
  setPromoDiscount: (amount: number) => void;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  subtotal,
  discount,
  total,
  paymentMethod,
  isSubmitting,
  onPaymentMethodChange,
  onCheckout,
  ecoPackagingCost = 5000,
  carbonOffsetCost = 3800,
  ecoPackagingCount = 0,
  carbonOffsetEnabled = false,
  promoCode,
  promoError,
  promoDiscount,
  onPromoCodeChange,
  onApplyPromoCode,
  setPromoDiscount
}) => {
  // Shipping cost is fixed for now
  const shippingCost = 0;
  
  // Calculate eco-friendly options costs for display only
  // These costs are already included in the total from useCheckout
  const totalEcoPackagingCost = ecoPackagingCount * ecoPackagingCost;
  const totalCarbonOffsetCost = carbonOffsetEnabled ? carbonOffsetCost : 0;
  
  // Use the total directly from useCheckout which already includes eco options
  const finalTotal = total;

  return (
    <div className="bg-gradient-to-b from-neutral-900/90 to-black/90 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-amber-900/30 to-neutral-900/30">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Payment Method
        </h2>
      </div>
      
      <div className="p-6 space-y-4">
        {/* Payment Options */}
        <div 
          className={`flex items-center p-3 border ${paymentMethod === 'balance' ? 'border-green-500' : 'border-white/10'} bg-black/30 rounded-lg hover:border-green-500 transition-colors cursor-pointer`}
          onClick={() => onPaymentMethodChange('balance')}
        >
          <input 
            type="radio" 
            id="wallet-balance" 
            name="payment" 
            className="h-4 w-4 text-green-500 border-white/30 bg-black"
            checked={paymentMethod === 'balance'}
            onChange={() => onPaymentMethodChange('balance')}
          />
          <label htmlFor="wallet-balance" className="ml-2 text-white cursor-pointer">
            Wallet Balance
          </label>
        </div>
        
        <div 
          className={`flex items-center p-3 border ${paymentMethod === 'cod' ? 'border-green-500' : 'border-white/10'} bg-black/30 rounded-lg hover:border-green-500 transition-colors cursor-pointer`}
          onClick={() => onPaymentMethodChange('cod')}
        >
          <input 
            type="radio" 
            id="cod" 
            name="payment" 
            className="h-4 w-4 text-green-500 border-white/30 bg-black"
            checked={paymentMethod === 'cod'}
            onChange={() => onPaymentMethodChange('cod')}
          />
          <label htmlFor="cod" className="ml-2 text-white cursor-pointer">
            Cash on Delivery
          </label>
        </div>
        
        {/* Order Summary */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white font-medium flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Order Summary
            </h3>
            {ecoPackagingCount > 0 || carbonOffsetEnabled ? (
              <div className="bg-green-500/20 rounded-full px-3 py-1 text-xs font-medium text-green-400">
                Eco-Friendly
              </div>
            ) : null}
          </div>
          
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-white/70 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Subtotal
              </span>
              <span className="text-white font-medium">{formatCurrency(subtotal)}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between items-center bg-amber-500/10 p-2 rounded-md">
                <span className="text-amber-400 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Promo Discount
                </span>
                <span className="text-amber-400 font-medium">-{formatCurrency(discount)}</span>
              </div>
            )}
            
            {/* Eco-friendly packaging cost */}
            {totalEcoPackagingCost > 0 && (
              <div className="flex justify-between items-center bg-green-500/10 p-2 rounded-md">
                <span className="text-green-400 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  Eco Packaging ({ecoPackagingCount})
                </span>
                <span className="text-green-400 font-medium">{formatCurrency(totalEcoPackagingCost)}</span>
              </div>
            )}
            
            {/* Carbon offset cost */}
            {totalCarbonOffsetCost > 0 && (
              <div className="flex justify-between items-center bg-green-500/10 p-2 rounded-md">
                <span className="text-green-400 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Carbon Offset
                </span>
                <span className="text-green-400 font-medium">{formatCurrency(totalCarbonOffsetCost)}</span>
              </div>
            )}
            
            {/* Promo Code Input */}
            <div className="mb-4">
              <PromoCodeInput
                value={promoCode}
                onChange={onPromoCodeChange}
                onApply={onApplyPromoCode}
                error={promoError}
                successMessage={promoDiscount > 0 ? `Promo code applied: ${(promoDiscount).toLocaleString('id-ID')} IDR discount` : undefined}
                disabled={isSubmitting}
                onRemove={promoDiscount > 0 ? () => {
                  // Clear promo code
                  onPromoCodeChange("");
                  // Reset the discount to 0
                  setPromoDiscount(0);
                  // Clear localStorage
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('promoCode');
                    localStorage.removeItem('promoDiscount');
                  }
                } : undefined}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-white/70 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                Shipping
              </span>
              <span className="text-green-400 font-medium flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Free
              </span>
            </div>
            
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2"></div>
            
            <div className="flex justify-between items-center">
              <span className="text-white text-lg font-semibold">Total</span>
              <span className="text-amber-500 text-xl font-bold">{formatCurrency(finalTotal)}</span>
            </div>
            
            <button 
              className="w-full py-3 mt-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors font-medium flex items-center justify-center disabled:bg-green-800/50 disabled:text-white/50"
              onClick={onCheckout}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : 'Complete Purchase'}
            </button>
            
            <p className="text-xs text-white/50 text-center mt-2">
              By completing your purchase, you agree to our sustainable shipping and eco-friendly packaging terms
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSection;
