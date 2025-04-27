// src/lib/auth/api.ts
// Handles API calls related to authentication

import { api } from '../api';
import { 
  AuthUser, 
  AuthResponse, 
  UserProfileResponse, 
  LoginCredentials, 
  RegistrationData 
} from './types';

/**
 * Login user with API
 */
export async function loginWithApi(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await api.login({
      email: credentials.email,
      password: credentials.password,
    });
    
    // Validate response
    if (!(response as any).access_token) {
      throw new Error('Invalid response from server');
    }
    
    return response as AuthResponse;
  } catch (error: any) {
    throw new Error(error?.message || 'Login failed. Please check your credentials.');
  }
}

/**
 * Register user with API
 */
export async function registerWithApi(data: RegistrationData): Promise<void> {
  try {
    await api.register({
      email: data.email,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
      role: data.role,
    });
  } catch (error: any) {
    throw new Error(error?.message || 'Registration failed. Please try again.');
  }
}

/**
 * Get user profile from API
 */
export async function getUserProfileFromApi(): Promise<AuthUser> {
  try {
    const response = await api.me();
    
    // Transform API response to AuthUser
    const user: AuthUser = {
      id: (response as any).id,
      email: (response as any).email,
      firstName: (response as any).first_name,
      lastName: (response as any).last_name,
      role: (response as any).role,
    };
    
    return user;
  } catch (error: any) {
    throw new Error(error?.message || 'Failed to get user profile');
  }
}
