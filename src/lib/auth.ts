// src/lib/auth.ts
import { authService } from '@/services/api/auth';
import { UserProfile } from '@/types/apiResponses';
import { setCookie, getCookie, deleteCookie } from '@/utils';
import {
  TOKEN_KEY,
  TOKEN_EXPIRED_EVENT,
  MSG_SESSION_EXPIRED,
  ERR_FETCHING_USER_PROFILE,
  ERR_GETTING_CURRENT_USER,
  ERR_LOGGING_OUT,
  ERR_STORING_AUTH_DATA,
  ERR_GETTING_TOKEN,
  ERR_CHECKING_TOKEN_EXPIRATION,
  ERR_DECODING_TOKEN
} from '@/constants';

// Define the AuthUser type to extend UserProfile
export interface AuthUser extends UserProfile {
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
 * Always fetches from API to ensure data is up-to-date
 */
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  if (typeof window === 'undefined') return null;
  
  try {
    const token = localStorage.getItem(TOKEN_KEY) || getCookie(TOKEN_KEY);
    
    // If we have a token, fetch user data from API
    if (token) {
      try {
        const user = await authService.getProfile();
        if (user) {
          // Return user with token but don't store in localStorage
          return { ...user, token };
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
 * Only stores the token, not the user profile
 */
export const storeAuthData = (userData: AuthUser | UserProfile, token: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // Create a proper AuthUser object for the event, but don't store in localStorage
    const authUser: AuthUser = { ...userData, token };
    
    // Store only the token in localStorage and cookies
    localStorage.setItem(TOKEN_KEY, token);
    
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
 * Get the user role from the token
 */
export const getUserRole = async (): Promise<string | null> => {
  // Always try to get the current user from the API first
  try {
    const currentUser = await getCurrentUser();
    if (currentUser?.role) return currentUser.role;
  } catch (error) {
    console.error('Error getting user role from API', error);
  }
  
  // Fallback: try to decode from token
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
export const hasRole = async (role: string | string[]): Promise<boolean> => {
  const userRole = await getUserRole();
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
