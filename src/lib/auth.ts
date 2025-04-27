// src/lib/auth.ts
import { authService } from '../services/api/auth';
import { User } from '../types/apiResponses';

// Define the AuthUser type
export interface AuthUser extends User {
  token?: string;
}

/**
 * Check if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check if token exists in localStorage
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    
    return JSON.parse(userData) as AuthUser;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Logout the current user
 */
export const logout = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // Clear auth data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Call the auth service logout method
    authService.logout();
  } catch (error) {
    console.error('Error logging out:', error);
  }
};

/**
 * Store authentication data
 */
export const storeAuthData = (userData: AuthUser, token: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // Store token and user data in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  } catch (error) {
    console.error('Error storing auth data:', error);
  }
};

export default {
  isAuthenticated,
  getCurrentUser,
  logout,
  storeAuthData
};
