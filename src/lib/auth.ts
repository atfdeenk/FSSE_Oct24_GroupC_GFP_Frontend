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
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  if (typeof window === 'undefined') return null;
  
  try {
    // First try to get user data from localStorage
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userData && token) {
      try {
        // Return cached user data
        return JSON.parse(userData) as AuthUser;
      } catch (parseError) {
        console.error('Error parsing user data:', parseError);
      }
    }
    
    // If no valid user data in localStorage but we have a token, fetch from API
    if (token) {
      try {
        const user = await authService.getProfile();
        if (user) {
          // Store the fresh user data
          const authUser: AuthUser = { ...user, token };
          storeAuthData(authUser, token);
          return authUser;
        }
      } catch (apiError) {
        console.error('Error fetching user profile:', apiError);
        // If API call fails, token might be invalid
        logout();
      }
    }
    
    return null;
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
export const storeAuthData = (userData: AuthUser | User, token: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // Create a proper AuthUser object
    const authUser: AuthUser = { ...userData, token };
    
    // Store token and user data in localStorage and cookies
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(authUser));
    
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
 * Get the user role from the current user or token
 */
export const getUserRole = (): string | null => {
  // First try to get role from current user
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : null;
  if (user?.role) return user.role;
  
  // If not available, try to decode from token
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

/**
 * Check if the current user has a specific role
 */
export const hasRole = (role: string | string[]): boolean => {
  const userRole = getUserRole();
  if (!userRole) return false;
  
  if (Array.isArray(role)) {
    return role.includes(userRole);
  }
  
  return userRole === role;
};

export default {
  isAuthenticated,
  getCurrentUser,
  logout,
  storeAuthData,
  getToken,
  getUserRole,
  hasRole
};
