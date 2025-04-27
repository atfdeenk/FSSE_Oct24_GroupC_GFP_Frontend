"use client";

// src/utils/hooks/useApi.ts
// Enhanced custom hook for API data fetching with loading and error states
// Includes request cancellation, caching, and retry logic

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ApiResponse } from '@/lib/api/types';

interface UseApiOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  autoFetch?: boolean;
  cacheKey?: string;
  cacheDuration?: number; // in milliseconds
  retry?: boolean;
  retryCount?: number;
  retryDelay?: number; // in milliseconds
  dependencies?: any[];
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  fetch: (params?: any) => Promise<void>;
  setData: (data: T) => void;
  clearError: () => void;
  clearCache: () => void;
}

// Simple in-memory cache
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

const apiCache = new Map<string, CacheItem<any>>();

/**
 * Clear the entire API cache or a specific cache item
 * @param cacheKey - Optional specific cache key to clear
 */
export function clearApiCache(cacheKey?: string): void {
  if (cacheKey) {
    apiCache.delete(cacheKey);
  } else {
    apiCache.clear();
  }
}

/**
 * Enhanced custom hook for API data fetching with loading and error states
 * @param apiCall - Function that returns a Promise with ApiResponse
 * @param options - Configuration options
 * @returns Object with data, loading, error states and fetch function
 */
export function useApi<T>(
  apiCall: (params?: any) => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const { 
    initialData = null, 
    onSuccess, 
    onError, 
    autoFetch = true,
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // 5 minutes default
    retry = false,
    retryCount = 3,
    retryDelay = 1000,
    dependencies = []
  } = options;
  
  const [data, setData] = useState<T | null>(() => {
    // Initialize from cache if available
    if (cacheKey && apiCache.has(cacheKey)) {
      const cached = apiCache.get(cacheKey)!;
      if (Date.now() < cached.expiry) {
        return cached.data;
      } else {
        // Clean up expired cache
        apiCache.delete(cacheKey);
      }
    }
    return initialData;
  });
  
  const [loading, setLoading] = useState<boolean>(autoFetch && !data);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs for values that shouldn't trigger re-renders
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryAttemptsRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  const clearError = useCallback(() => setError(null), []);
  
  const clearCache = useCallback(() => {
    if (cacheKey) {
      apiCache.delete(cacheKey);
    }
  }, [cacheKey]);

  const fetch = useCallback(async (params?: any) => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    // Check cache first if cacheKey is provided
    if (cacheKey && apiCache.has(cacheKey)) {
      const cached = apiCache.get(cacheKey)!;
      if (Date.now() < cached.expiry) {
        setData(cached.data);
        if (onSuccess && isMountedRef.current) onSuccess(cached.data);
        return;
      } else {
        // Clean up expired cache
        apiCache.delete(cacheKey);
      }
    }
    
    if (isMountedRef.current) {
      setLoading(true);
      setError(null);
    }
    
    const executeRequest = async (attempt: number = 0): Promise<void> => {
      try {
        // Add the abort signal to the API call
        const response = await apiCall({ ...params, signal });
        
        if (!isMountedRef.current) return;
        
        if (response.success && response.data) {
          // Store in cache if cacheKey is provided
          if (cacheKey) {
            apiCache.set(cacheKey, {
              data: response.data,
              timestamp: Date.now(),
              expiry: Date.now() + cacheDuration
            });
          }
          
          setData(response.data);
          if (onSuccess) onSuccess(response.data);
        } else {
          const errorMessage = response.error || 'An unknown error occurred';
          
          // Retry logic
          if (retry && attempt < retryCount) {
            retryAttemptsRef.current = attempt + 1;
            setTimeout(() => executeRequest(attempt + 1), retryDelay * (attempt + 1));
            return;
          }
          
          setError(errorMessage);
          if (onError) onError(errorMessage);
        }
      } catch (err: any) {
        if (!isMountedRef.current) return;
        
        // Don't handle aborted requests as errors
        if (err.name === 'AbortError') return;
        
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        
        // Retry logic
        if (retry && attempt < retryCount) {
          retryAttemptsRef.current = attempt + 1;
          setTimeout(() => executeRequest(attempt + 1), retryDelay * (attempt + 1));
          return;
        }
        
        setError(errorMessage);
        if (onError) onError(errorMessage);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };
    
    await executeRequest();
  }, [apiCall, onSuccess, onError, cacheKey, cacheDuration, retry, retryCount, retryDelay, ...dependencies]);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (autoFetch) {
      fetch();
    }
    
    // Cleanup function to run on unmount
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetch, autoFetch]);

  return { data, loading, error, fetch, setData, clearError, clearCache };
}

export default useApi;
