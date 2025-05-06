"use client";

import { useState, useEffect, useCallback } from 'react';
import balanceService from '@/services/api/balance';
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

  const fetchBalance = useCallback(async () => {
    if (!isAuthenticated()) {
      setBalance(0);
      setLoading(false);
      return;
    }

    setLoading(true);
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
      setLoading(false);
    }
  }, []);

  // Function to handle refresh events
  const handleBalanceRefresh = useCallback(() => {
    fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    // Initial fetch
    fetchBalance();
    
    // Listen for balance refresh events
    const cleanup = onRefresh(REFRESH_EVENTS.BALANCE, handleBalanceRefresh);
    
    return cleanup;
  }, [fetchBalance, handleBalanceRefresh]);

  return {
    balance,
    loading,
    error,
    refreshBalance: fetchBalance
  };
}

export default useBalance;
