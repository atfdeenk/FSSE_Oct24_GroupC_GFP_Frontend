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
    const response = await api.login({
      email: data.email,
      password: data.password,
    });
    
    // Check if response has access_token
    if (!(response as any).access_token) {
      throw new Error('Invalid response from server');
    }
    
    // Store token
    setToken((response as any).access_token);
    
    // Get user profile
    const userProfile = await getUserProfile();
    
    // Store user data
    setUser(userProfile);
    
    return userProfile;
  } catch (error: any) {
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
    
    // Get user profile from API
    const response = await api.me();
    
    // Transform API response to AuthUser
    const user: AuthUser = {
      id: (response as any).id,
      email: (response as any).email,
      firstName: (response as any).first_name,
      lastName: (response as any).last_name,
      role: (response as any).role,
      // Add any other user properties
    };
    
    return user;
  } catch (error: any) {
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
  // This is a mock implementation since we're not using a real HTTP client like axios
  // In a real app, you would set up interceptors to add the token to all requests
  // and handle token refresh, etc.
  
  // Example with fetch API:
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
