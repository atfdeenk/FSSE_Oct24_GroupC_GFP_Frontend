"use client";

import { useEffect, useRef } from 'react';

/**
 * A custom hook that provides polling functionality
 * @param callback The function to call on each polling interval
 * @param interval The polling interval in milliseconds
 * @param enabled Whether polling is enabled or not
 * @returns An object containing a function to manually trigger the callback
 */
export function usePolling(
  callback: () => void,
  interval: number = 1000,
  enabled: boolean = true
) {
  // Use a ref to store the callback to avoid unnecessary re-renders
  const callbackRef = useRef(callback);

  // Update the ref when the callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Set up the polling interval
  useEffect(() => {
    // Don't set up polling if it's disabled
    if (!enabled) return;

    // Call the callback immediately on mount
    callbackRef.current();

    // Set up the interval
    const intervalId = setInterval(() => {
      callbackRef.current();
    }, interval);

    // Clean up the interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [interval, enabled]);

  // Return a function to manually trigger the callback
  const trigger = () => {
    callbackRef.current();
  };

  return { trigger };
}

export default usePolling;
