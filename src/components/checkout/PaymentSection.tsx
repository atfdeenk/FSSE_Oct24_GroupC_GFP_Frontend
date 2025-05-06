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
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  subtotal,
  discount,
  total,
  paymentMethod,
  isSubmitting,
  onPaymentMethodChange,
  onCheckout
}) => {
  // Shipping cost is fixed at 13800 for now
  const shippingCost = 0;
  const finalTotal = total + shippingCost;

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
          <h3 className="text-white font-medium mb-3">Order Summary</h3>
          
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
