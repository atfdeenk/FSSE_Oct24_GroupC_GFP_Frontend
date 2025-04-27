// src/lib/auth.ts
import { authService } from '../services/api/auth';
import { User } from '../types/apiResponses';
import { setCookie, getCookie, deleteCookie } from '../utils/cookies';

// Define the AuthUser type
export interface AuthUser extends User {
  token?: string;
}

/**
 * Check if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check if token exists in localStorage and cookies
  const token = localStorage.getItem('token') || getCookie('token');
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
    // Clear auth data from localStorage and cookies
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    deleteCookie('token');
    
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
    // Store token and user data in localStorage and cookies
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Also store token in cookies for middleware access
    setCookie('token', token, 7); // 7 days expiry
  } catch (error) {
    console.error('Error storing auth data:', error);
  }
};

/**
 * Get the authentication token
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    // Get token from localStorage or cookies
    return localStorage.getItem('token') || getCookie('token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Get the user role from the token
 */
export const getUserRole = (): string | null => {
  const token = getToken();
  if (!token) return null;
  
  try {
    // Decode JWT to get user role
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.role || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export default {
  isAuthenticated,
  getCurrentUser,
  logout,
  storeAuthData,
  getToken,
  getUserRole
};
