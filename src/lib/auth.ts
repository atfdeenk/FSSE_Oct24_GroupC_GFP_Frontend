// src/lib/auth.ts
import { authService } from '../services/api/auth';
import { User } from '../types/apiResponses';
import { setCookie, getCookie, deleteCookie } from '../utils/cookies';
import { TOKEN_EXPIRED_EVENT } from '../services/api/axios';

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
    const token = localStorage.getItem('token') || getCookie('token');
    
    // Check if token is expired before returning
    if (token && isTokenExpired(token)) {
      // Token is expired, trigger logout
      const event = new CustomEvent(TOKEN_EXPIRED_EVENT, {
        detail: { message: 'Your session has expired. Please log in again.' }
      });
      window.dispatchEvent(event);
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
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
    console.error('Error checking token expiration:', error);
    // If we can't parse the token, consider it expired for safety
    return true;
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
  hasRole,
  isTokenExpired
};
