"use client";

import React from 'react';
import { useBalance } from '@/hooks/useBalance';
import { formatCurrency } from '@/utils/format';

interface UserBalanceProps {
  className?: string;
}

const UserBalance: React.FC<UserBalanceProps> = ({ className = '' }) => {
  const { balance, loading } = useBalance();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
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
      <div>
        <div className="text-xs text-white/60">Your Balance</div>
        <div className="text-sm font-medium text-amber-500">
          {loading ? (
            <div className="animate-pulse w-16 h-4 bg-amber-500/20 rounded"></div>
          ) : (
            formatCurrency(balance)
          )}
        </div>
      </div>
    </div>
  );
};

export default UserBalance;
