"use client";

import React, { useEffect, useState, Fragment, useRef } from 'react';
import { useBalance } from '@/hooks/useBalance';
import { formatCurrency } from '@/utils/format';
import { useAuthUser } from '@/hooks/useAuthUser';
import { FaChevronDown, FaPlus } from 'react-icons/fa';
import topupService from '@/services/api/topup';
import { toast } from 'react-hot-toast';

interface UserBalanceProps {
  className?: string;
}

const UserBalance: React.FC<UserBalanceProps> = ({ className = '' }) => {
  const { balance, loading, refreshBalance } = useBalance();
  const { user } = useAuthUser();
  const [topupAmount, setTopupAmount] = useState<number>(0);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showTopupInput, setShowTopupInput] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Only show balance for customer role
  const isCustomer = user?.role === 'customer';

  const handleTopupRequest = async () => {
    if (topupAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsRequesting(true);
    try {
      const response = await topupService.requestTopUp(topupAmount);
      if (response.success) {
        toast.success(`Top-up request for ${formatCurrency(topupAmount)} submitted successfully`);
        setTopupAmount(0);
        setShowTopupInput(false);
      } else {
        toast.error(response.error || 'Failed to submit top-up request');
      }
    } catch (error) {
      toast.error('An error occurred while submitting your request');
      console.error('Top-up request error:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  // If not a customer, don't render anything
  if (!isCustomer) return null;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div
        className={`flex items-center gap-2 ${className} cursor-pointer transition-all duration-200 hover:bg-amber-500/10 rounded-full px-2 py-1`}
        onMouseEnter={() => setIsDropdownOpen(true)}
      >
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

        <button
          className="ml-1 flex items-center text-amber-500 hover:text-amber-600 focus:outline-none transition-transform duration-200 ease-in-out transform hover:scale-110"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <FaChevronDown className={`h-3 w-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
      </div>

      {isDropdownOpen && (
        <div
          className="absolute right-0 z-10 mt-2 w-72 origin-top-right rounded-lg bg-white shadow-xl ring-1 ring-amber-500/10 focus:outline-none overflow-hidden transition-all duration-200 ease-in-out animate-fadeIn"
          onMouseLeave={() => !showTopupInput && setIsDropdownOpen(false)}
        >
          <div className="py-2">
            {showTopupInput ? (
              <div className="px-5 py-4 bg-gradient-to-br from-amber-50 to-white">
                <div className="mb-4">
                  <label htmlFor="topupAmount" className="block text-sm font-medium text-amber-700 mb-2">Top-up Amount</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-black font-medium">Rp</span>
                    </div>
                    <input
                      type="number"
                      name="topupAmount"
                      id="topupAmount"
                      className="focus:ring-amber-500 focus:border-amber-500 block w-full pl-10 pr-16 py-3.5 text-base border-amber-200 rounded-lg bg-amber-50/50 shadow-inner"
                      placeholder="0.00"
                      aria-describedby="price-currency"
                      value={topupAmount || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTopupAmount(Number(e.target.value))}
                      min="1"
                      step="1"
                      autoFocus
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <span className="text-amber-600 font-medium" id="price-currency">IDR</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-amber-700/70 mt-3 mb-5">Your top-up request will be reviewed by an admin.</p>
                <div className="flex justify-between space-x-4">
                  <button
                    type="button"
                    className="flex-1 inline-flex justify-center items-center rounded-md border border-amber-200 shadow-sm px-3 py-2.5 bg-white text-sm font-medium text-amber-700 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                    onClick={() => {
                      setShowTopupInput(false);
                      setIsDropdownOpen(false);
                    }}
                    disabled={isRequesting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="flex-1 inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-3 py-2.5 bg-amber-600 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                    onClick={handleTopupRequest}
                    disabled={isRequesting}
                  >
                    {isRequesting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : 'Request'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-1 py-1">
                <button
                  onClick={() => setShowTopupInput(true)}
                  className="flex w-full items-center px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 hover:text-amber-900 rounded-md transition-colors duration-200"
                >
                  <div className="bg-amber-100 rounded-full p-1.5 mr-3">
                    <FaPlus className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
                  </div>
                  <span className="font-medium">Request Balance Top-up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBalance;