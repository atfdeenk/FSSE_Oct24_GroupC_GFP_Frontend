"use client";

import { useState, useEffect, useCallback } from 'react';
import { roleBasedBalanceService as balanceService } from '@/services/roleBasedBalanceService';
import { isAuthenticated } from '@/lib/auth';
import { showError } from '@/utils/toast';
// Define event types and handlers locally until events module is properly set up
const REFRESH_EVENTS = {
  BALANCE: 'balance-refresh',
};

type RefreshEventDetail = {
  source?: string;
  showToast?: boolean;
  [key: string]: any;
};

function onRefresh(
  eventName: string, 
  callback: (detail?: RefreshEventDetail) => void
): () => void {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<RefreshEventDetail>;
    callback(customEvent.detail);
  };
  
  window.addEventListener(eventName, handler);
  
  // Return cleanup function
  return () => {
    window.removeEventListener(eventName, handler);
  };
}

export function useBalance() {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async (showLoading = true) => {
    if (!isAuthenticated()) {
      setBalance(0);
      setLoading(false);
      return;
    }

    if (showLoading) {
      setLoading(true);
    }
    
    try {
      const response = await balanceService.getUserBalance();
      
      if (response.success) {
        setBalance(response.balance);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch balance');
        // Don't show error toast for balance fetch failures - it's not critical
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch balance');
      // Don't show error toast for balance fetch failures - it's not critical
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  // Function to handle refresh events
  const handleBalanceRefresh = useCallback(() => {
    fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    // Initial fetch
    fetchBalance();
    
    // Set up polling interval to check for balance updates every 30 seconds
    const pollingInterval = setInterval(() => {
      fetchBalance(false); // Pass false to avoid showing loading state during polling
    }, 1000);
    
    // Listen for balance refresh events
    const cleanup = onRefresh(REFRESH_EVENTS.BALANCE, handleBalanceRefresh);
    
    // Clean up interval and event listener on component unmount
    return () => {
      clearInterval(pollingInterval);
      cleanup();
    };
  }, [fetchBalance, handleBalanceRefresh]);

  return {
    balance,
    loading,
    error,
    refreshBalance: fetchBalance
  };
}

export default useBalance;
