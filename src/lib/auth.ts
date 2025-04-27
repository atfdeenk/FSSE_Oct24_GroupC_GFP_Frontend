// src/lib/auth.ts
// Centralized authentication service for frontend-only implementation
import { api } from './api';
import { LoginFormData, RegisterFormData } from './validations';

// Token storage key
const TOKEN_KEY = 'bumibrew_token';
const USER_KEY = 'bumibrew_user';

// Types
export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  [key: string]: any; // For additional user properties
}

/**
 * Login user with email and password
 */
export async function loginUser(data: LoginFormData): Promise<AuthUser> {
  try {
    // Use the enhanced API with longer timeout for login
    const response = await api.login({
      email: data.email,
      password: data.password,
    }, { timeout: 60000 }); // 60 second timeout for login
    
    // Handle different response formats
    let accessToken = '';
    
    if (response.success && response.data && response.data.access_token) {
      // New API format
      accessToken = response.data.access_token;
    } else if ((response as any).access_token) {
      // Old API format
      accessToken = (response as any).access_token;
    } else {
      console.error('Login response:', response);
      throw new Error('Invalid response from server');
    }
    
    // Store token
    setToken(accessToken);
    
    // Get user profile
    const userProfile = await getUserProfile();
    
    // Store user data
    setUser(userProfile);
    
    return userProfile;
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.name === 'AbortError' || error.code === 'TIMEOUT') {
      throw new Error('Login request timed out. Please try again.');
    }
    throw new Error(error?.message || 'Login failed. Please check your credentials.');
  }
}

/**
 * Register a new user
 */
export async function registerUser(data: RegisterFormData): Promise<AuthUser> {
  try {
    // Register user
    await api.register({
      email: data.email,
      password: data.password,
      first_name: data.firstName,
      last_name: data.lastName,
      role: data.role,
    });
    
    // Login after successful registration
    return await loginUser({
      email: data.email,
      password: data.password,
    });
  } catch (error: any) {
    throw new Error(error?.message || 'Registration failed. Please try again.');
  }
}

/**
 * Get user profile from API
 */
export async function getUserProfile(): Promise<AuthUser> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // Get user profile from API with auth header
    const response = await api.me({
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 30000 // 30 second timeout
    });
    
    // Handle different response formats
    let userData: any;
    
    if (response.success && response.data) {
      // New API format
      userData = response.data;
    } else {
      // Old API format
      userData = response;
    }
    
    // Transform API response to AuthUser
    const user: AuthUser = {
      id: userData.id,
      email: userData.email,
      firstName: userData.first_name || userData.firstName || '',
      lastName: userData.last_name || userData.lastName || '',
      role: userData.role || 'user',
      // Add any other user properties
    };
    
    return user;
  } catch (error: any) {
    console.error('Get user profile error:', error);
    if (error.name === 'AbortError' || error.code === 'TIMEOUT') {
      throw new Error('Request timed out. Please try again.');
    }
    logout(); // Clear invalid session
    throw new Error(error?.message || 'Failed to get user profile');
  }
}

/**
 * Logout user
 */
export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  // In a real app with Next.js, we might use a more sophisticated approach
  // such as using next-auth or a context provider
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * Get current user
 */
export function getCurrentUser(): AuthUser | null {
  try {
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;
    return JSON.parse(userJson) as AuthUser;
  } catch (e) {
    return null;
  }
}

/**
 * Get authentication token
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Set authentication token
 */
function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Set user data
 */
function setUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Add headers with authentication token to all API requests
export function setupAuthInterceptor() {
  // This function is no longer needed as we're using the interceptor system
  // from our enhanced API layer. The token is automatically added to requests
  // by the interceptor in src/lib/api/interceptors.ts
  
  // However, we'll keep this function for backward compatibility
  console.info('Using enhanced API interceptor system for authentication');
  
  // We could still set up the fetch interceptor for non-API requests
  const originalFetch = window.fetch;
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
    const token = getToken();
    if (token && init && init.headers) {
      (init.headers as any).Authorization = `Bearer ${token}`;
    } else if (token) {
      init = {
        ...init,
        headers: {
          ...init?.headers,
          Authorization: `Bearer ${token}`,
        },
      };
    }
    return originalFetch(input, init);
  };
}
