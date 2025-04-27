// src/lib/auth/storage.ts
// Handles local storage of authentication data

import { AuthUser } from './types';

// Storage keys
const TOKEN_KEY = 'bumibrew_token';
const USER_KEY = 'bumibrew_user';

/**
 * Get authentication token from storage
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Set authentication token in storage
 */
export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove authentication token from storage
 */
export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Get user data from storage
 */
export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;
    return JSON.parse(userJson) as AuthUser;
  } catch (e) {
    return null;
  }
}

/**
 * Set user data in storage
 */
export function setUser(user: AuthUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Remove user data from storage
 */
export function removeUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
}

/**
 * Clear all auth-related data from storage
 */
export function clearAuthData(): void {
  removeToken();
  removeUser();
}
