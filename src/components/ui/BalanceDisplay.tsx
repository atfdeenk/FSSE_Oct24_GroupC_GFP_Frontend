"use client";

import React from 'react';
import { useBalance } from '@/hooks/useBalance';
import { formatCurrency } from '@/utils/format';
import { useAuthUser } from '@/hooks/useAuthUser';

interface BalanceDisplayProps {
  className?: string;
  orderTotal?: number;
  showSufficiency?: boolean;
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ 
  className = '',
  orderTotal = 0,
  showSufficiency = false
}) => {
  const { balance, loading } = useBalance();
  const { user } = useAuthUser();
  const isBalanceSufficient = balance >= orderTotal;
  
  // Only show balance for customer role
  const isCustomer = user?.role === 'customer';
  
  // If not a customer, don't render anything
  if (!isCustomer) return null;

  return (
    <div className={`rounded-md border ${isBalanceSufficient ? 'border-green-500/30 bg-green-900/10' : 'border-amber-500/30 bg-amber-900/10'} p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
            <svg 
              className="w-4 h-4 text-amber-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <div className="text-white font-medium">Your Balance</div>
        </div>
        <div className="text-lg font-bold text-amber-500">
          {loading ? (
            <div className="animate-pulse w-24 h-6 bg-amber-500/20 rounded"></div>
          ) : (
            formatCurrency(balance)
          )}
        </div>
      </div>
      
      {showSufficiency && (
        <div className={`text-sm mt-2 ${isBalanceSufficient ? 'text-green-400' : 'text-amber-400'}`}>
          {isBalanceSufficient ? (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Sufficient funds for this order
            </div>
          ) : (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {balance > 0 ? 'Insufficient funds for this order' : 'No funds available'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BalanceDisplay;
