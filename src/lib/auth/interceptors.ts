// src/lib/auth/interceptors.ts
// Handles authentication interceptors for API requests

import { getToken } from './storage';

/**
 * Set up fetch API interceptor to add authentication token to requests
 */
export function setupFetchInterceptor(): void {
  if (typeof window === 'undefined') return;
  
  const originalFetch = window.fetch;
  
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
    const token = getToken();
    
    if (!token) {
      return originalFetch(input, init);
    }
    
    // Add authorization header
    const headers = new Headers(init?.headers || {});
    headers.set('Authorization', `Bearer ${token}`);
    
    const modifiedInit = {
      ...init,
      headers
    };
    
    return originalFetch(input, modifiedInit);
  };
}

/**
 * Handle API response with auth error (401)
 * In a real app, this would handle token refresh or redirect to login
 */
export function handleAuthError(error: any): void {
  // Check if error is auth related (401)
  if (error?.status === 401 || error?.response?.status === 401) {
    // Could implement token refresh here
    // For now, just redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
}
