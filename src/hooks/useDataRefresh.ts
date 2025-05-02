// src/hooks/useDataRefresh.ts
import { useEffect, useState, useCallback } from 'react';
import { REFRESH_EVENTS, RefreshEventDetail, onRefresh } from '@/lib/dataRefresh';

/**
 * Hook to listen for data refresh events and trigger a re-fetch
 * 
 * @param eventType The type of refresh event to listen for
 * @param fetchCallback The callback function to execute when a refresh is needed
 * @param deps Additional dependencies for the useEffect
 * @returns Object with loading state and manual refresh function
 */
export function useDataRefresh<T>(
  eventType: string,
  fetchCallback: (detail?: RefreshEventDetail) => Promise<T>,
  deps: any[] = []
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  
  // Function to handle the refresh
  const handleRefresh = useCallback(async (detail?: RefreshEventDetail) => {
    setLoading(true);
    setError(null);
    
    try {
      await fetchCallback(detail);
      setLastRefreshTime(new Date());
    } catch (err) {
      console.error(`Error refreshing data for ${eventType}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [eventType, fetchCallback]);
  
  // Set up event listener for the refresh event
  useEffect(() => {
    const cleanup = onRefresh(eventType, (detail) => {
      handleRefresh(detail);
    });
    
    // Initial fetch
    handleRefresh();
    
    return cleanup;
  }, [eventType, handleRefresh, ...deps]);
  
  return {
    loading,
    error,
    refresh: handleRefresh,
    lastRefreshTime
  };
}

/**
 * Hook to listen for profile refresh events
 */
export function useProfileRefresh(
  fetchCallback: (detail?: RefreshEventDetail) => Promise<any>,
  deps: any[] = []
) {
  return useDataRefresh(REFRESH_EVENTS.PROFILE, fetchCallback, deps);
}

/**
 * Hook to listen for products refresh events
 */
export function useProductsRefresh(
  fetchCallback: (detail?: RefreshEventDetail) => Promise<any>,
  deps: any[] = []
) {
  return useDataRefresh(REFRESH_EVENTS.PRODUCTS, fetchCallback, deps);
}

/**
 * Hook to listen for product detail refresh events
 */
export function useProductDetailRefresh(
  productId: string | number,
  fetchCallback: (detail?: RefreshEventDetail) => Promise<any>,
  deps: any[] = []
) {
  const [shouldRefresh, setShouldRefresh] = useState(false);
  
  // Set up event listener for the product detail refresh event
  useEffect(() => {
    const cleanup = onRefresh(REFRESH_EVENTS.PRODUCT_DETAIL, (detail) => {
      // Only refresh if the event is for this product or no specific product is mentioned
      if (!detail.id || detail.id.toString() === productId.toString()) {
        setShouldRefresh(true);
      }
    });
    
    return cleanup;
  }, [productId]);
  
  // Use the generic data refresh hook with the additional shouldRefresh dependency
  return useDataRefresh(
    REFRESH_EVENTS.PRODUCT_DETAIL,
    fetchCallback,
    [shouldRefresh, productId, ...deps]
  );
}

/**
 * Hook to listen for cart refresh events
 */
export function useCartRefresh(
  fetchCallback: (detail?: RefreshEventDetail) => Promise<any>,
  deps: any[] = []
) {
  return useDataRefresh(REFRESH_EVENTS.CART, fetchCallback, deps);
}

/**
 * Hook to listen for categories refresh events
 */
export function useCategoriesRefresh(
  fetchCallback: (detail?: RefreshEventDetail) => Promise<any>,
  deps: any[] = []
) {
  return useDataRefresh(REFRESH_EVENTS.CATEGORIES, fetchCallback, deps);
}

/**
 * Hook to listen for orders refresh events
 */
export function useOrdersRefresh(
  fetchCallback: (detail?: RefreshEventDetail) => Promise<any>,
  deps: any[] = []
) {
  return useDataRefresh(REFRESH_EVENTS.ORDERS, fetchCallback, deps);
}

export default useDataRefresh;
