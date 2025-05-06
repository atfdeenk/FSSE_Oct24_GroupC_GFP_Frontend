import React from 'react';
import { formatCurrency } from '@/utils/format';

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
  carbonOffsetEnabled = false
}) => {
  // Shipping cost is fixed for now
  const shippingCost = 0;
  
  // Calculate eco-friendly options costs
  const totalEcoPackagingCost = ecoPackagingCount * ecoPackagingCost;
  const totalCarbonOffsetCost = carbonOffsetEnabled ? carbonOffsetCost : 0;
  
  // Calculate final total including eco options
  const finalTotal = total + shippingCost + totalEcoPackagingCost + totalCarbonOffsetCost;

  return (
    <div className="bg-neutral-900/80 backdrop-blur-sm rounded-lg shadow-sm border border-white/10 overflow-hidden mb-6">
      <div className="bg-green-900/30 px-6 py-4 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white">Payment Method</h2>
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
          <div className="flex items-center mb-3">
            <svg className="w-5 h-5 text-amber-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h3 className="text-white font-medium">Order Summary</h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/70">Subtotal</span>
              <span className="text-white">{formatCurrency(subtotal)}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between">
                <span className="text-white/70">Discount</span>
                <span className="text-green-500 font-medium">-{formatCurrency(discount)}</span>
              </div>
            )}
            
            {/* Eco-friendly packaging cost */}
            {totalEcoPackagingCost > 0 && (
              <div className="flex justify-between">
                <span className="text-white/70 flex items-center">
                  <svg className="w-3 h-3 text-green-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  Eco Packaging ({ecoPackagingCount})
                </span>
                <span className="text-green-400">{formatCurrency(totalEcoPackagingCost)}</span>
              </div>
            )}
            
            {/* Carbon offset cost */}
            {totalCarbonOffsetCost > 0 && (
              <div className="flex justify-between">
                <span className="text-white/70 flex items-center">
                  <svg className="w-3 h-3 text-green-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Carbon Offset
                </span>
                <span className="text-green-400">{formatCurrency(totalCarbonOffsetCost)}</span>
              </div>
            )}
            
            <div className="flex justify-between py-3 border-t border-white/10">
              <span className="text-white/70">Shipping</span>
              <span className="text-white font-medium">{formatCurrency(shippingCost)}</span>
            </div>
            
            <div className="pt-3 border-t border-white/10">
              <div className="flex justify-between">
                <span className="text-white font-semibold">Total</span>
                <span className="text-xl font-bold text-green-400">{formatCurrency(finalTotal)}</span>
              </div>
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
