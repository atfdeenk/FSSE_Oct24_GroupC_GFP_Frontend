"use client";

// src/utils/hooks/useApi.ts
// Custom hook for API data fetching with loading and error states

import { useState, useEffect, useCallback } from 'react';
import type { ApiResponse } from '@/lib/api/types';

interface UseApiOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  autoFetch?: boolean;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  setData: (data: T) => void;
  clearError: () => void;
}

/**
 * Custom hook for API data fetching with loading and error states
 * @param apiCall - Function that returns a Promise with ApiResponse
 * @param options - Configuration options
 * @returns Object with data, loading, error states and fetch function
 */
export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const { initialData = null, onSuccess, onError, autoFetch = true } = options;
  
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall();
      
      if (response.success && response.data) {
        setData(response.data);
        if (onSuccess) onSuccess(response.data);
      } else {
        const errorMessage = response.error || 'An unknown error occurred';
        setError(errorMessage);
        if (onError) onError(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiCall, onSuccess, onError]);

  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [fetch, autoFetch]);

  return { data, loading, error, fetch, setData, clearError };
}

export default useApi;
