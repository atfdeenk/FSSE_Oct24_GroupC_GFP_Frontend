// src/lib/auth/index.ts
// Main authentication module that exports all auth functionality

import { LoginFormData, RegisterFormData } from '../validations';
import { AuthUser, LoginCredentials, RegistrationData } from './types';
import { getToken, setToken, getUser, setUser, clearAuthData } from './storage';
import { loginWithApi, registerWithApi, getUserProfileFromApi } from './api';
import { setupFetchInterceptor } from './interceptors';

/**
 * Login user with email and password
 */
export async function loginUser(data: LoginFormData): Promise<AuthUser> {
  try {
    // Convert form data to API credentials
    const credentials: LoginCredentials = {
      email: data.email,
      password: data.password,
    };
    
    // Login with API
    const authResponse = await loginWithApi(credentials);
    
    // Store token
    setToken(authResponse.access_token);
    
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
    // Convert form data to API registration data
    const registrationData: RegistrationData = {
      email: data.email,
      password: data.password,
      first_name: data.firstName,
      last_name: data.lastName,
      role: data.role,
    };
    
    // Register user
    await registerWithApi(registrationData);
    
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
    if (!getToken()) {
      throw new Error('No authentication token found');
    }
    
    // Get user profile from API
    const userProfile = await getUserProfileFromApi();
    return userProfile;
  } catch (error: any) {
    // Clear invalid session
    logout();
    throw new Error(error?.message || 'Failed to get user profile');
  }
}

/**
 * Logout user
 */
export function logout(): void {
  clearAuthData();
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
  return getUser();
}

/**
 * Initialize authentication system
 * This should be called early in the application lifecycle
 */
export function initAuth(): void {
  setupFetchInterceptor();
}

// Re-export types
export type { AuthUser };
