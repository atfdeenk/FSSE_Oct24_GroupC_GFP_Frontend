// src/utils/storage/localStorage.ts
// Centralized local storage utilities for frontend-only operations

/**
 * Get an item from localStorage with type safety
 * @param key - Storage key
 * @param defaultValue - Default value if not found
 * @returns Parsed value or default value
 */
export function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error getting item from localStorage: ${key}`, error);
    return defaultValue;
  }
}

/**
 * Set an item in localStorage with type safety
 * @param key - Storage key
 * @param value - Value to store
 * @returns True if successful, false otherwise
 */
export function setItem<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting item in localStorage: ${key}`, error);
    return false;
  }
}

/**
 * Remove an item from localStorage
 * @param key - Storage key
 * @returns True if successful, false otherwise
 */
export function removeItem(key: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing item from localStorage: ${key}`, error);
    return false;
  }
}

/**
 * Clear all items from localStorage
 * @returns True if successful, false otherwise
 */
export function clearAll(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage', error);
    return false;
  }
}

/**
 * Check if an item exists in localStorage
 * @param key - Storage key
 * @returns True if exists, false otherwise
 */
export function hasItem(key: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(key) !== null;
}
