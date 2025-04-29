// src/lib/auth.ts
import { authService } from '@/services/api/auth';
import { User } from '@/types';
import { setCookie, getCookie, deleteCookie } from '@/utils';
import {
  TOKEN_KEY,
  USER_KEY,
  TOKEN_EXPIRED_EVENT,
  MSG_SESSION_EXPIRED,
  ERR_PARSING_USER_DATA,
  ERR_FETCHING_USER_PROFILE,
  ERR_GETTING_CURRENT_USER,
  ERR_LOGGING_OUT,
  ERR_STORING_AUTH_DATA,
  ERR_GETTING_TOKEN,
  ERR_CHECKING_TOKEN_EXPIRATION,
  ERR_DECODING_TOKEN
} from '@/constants';

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
    const userData = localStorage.getItem(USER_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (userData && token) {
      try {
        // Return cached user data
        return JSON.parse(userData) as AuthUser;
      } catch (parseError) {
        console.error(ERR_PARSING_USER_DATA, parseError);
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
        console.error(ERR_FETCHING_USER_PROFILE, apiError);
        // If API call fails, token might be invalid
        logout();
      }
    }
    
    return null;
  } catch (error) {
    console.error(ERR_GETTING_CURRENT_USER, error);
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
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    deleteCookie(TOKEN_KEY);
    
    // Call the auth service logout method
    authService.logout();
    
    // Dispatch a custom event to notify components about logout
    const logoutEvent = new CustomEvent('user:logout');
    window.dispatchEvent(logoutEvent);
    console.log('Dispatched user:logout event');
  } catch (error) {
    console.error(ERR_LOGGING_OUT, error);
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
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    
    // Also store token in cookies for middleware access
    setCookie(TOKEN_KEY, token, 7); // 7 days expiry
    
    // Dispatch a custom event to notify components about login
    const loginEvent = new CustomEvent('user:login', {
      detail: { user: authUser }
    });
    window.dispatchEvent(loginEvent);
    console.log('Dispatched user:login event');
  } catch (error) {
    console.error(ERR_STORING_AUTH_DATA, error);
  }
};

/**
 * Get the authentication token
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    // Get token from localStorage or cookies
    const token = localStorage.getItem('token') || getCookie('token');
    
    // Check if token is expired before returning
    if (token && isTokenExpired(token)) {
      // Token is expired, trigger logout
      const event = new CustomEvent(TOKEN_EXPIRED_EVENT, {
        detail: { message: MSG_SESSION_EXPIRED }
      });
      window.dispatchEvent(event);
      return null;
    }
    
    return token;
  } catch (error) {
    console.error(ERR_GETTING_TOKEN, error);
    return null;
  }
};

/**
 * Check if a JWT token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    // Extract the payload from the JWT token
    const base64Url = token.split('.')[1];
    if (!base64Url) return true;
    
    // Decode the base64 string
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    
    // Check if the token has an expiration claim
    if (!payload.exp) return false;
    
    // Convert exp to milliseconds and compare with current time
    const expirationTime = payload.exp * 1000; // Convert seconds to milliseconds
    const currentTime = Date.now();
    
    return currentTime >= expirationTime;
  } catch (error) {
    console.error(ERR_CHECKING_TOKEN_EXPIRATION, error);
    // If we can't parse the token, consider it expired for safety
    return true;
  }
};

/**
 * Get the user role from the current user or token
 */
export const getUserRole = (): string | null => {
  // First try to get role from current user
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(USER_KEY) || '{}') : null;
  if (user?.role) return user.role;
  
  // If not available, try to decode from token
  const token = getToken();
  if (!token) return null;
  
  try {
    // Decode JWT to get user role
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.role || null;
  } catch (error) {
    console.error(ERR_DECODING_TOKEN, error);
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
  hasRole,
  isTokenExpired
};
