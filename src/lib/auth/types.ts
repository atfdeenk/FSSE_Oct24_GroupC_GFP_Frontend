// src/lib/auth/types.ts
// Authentication related types

/**
 * Core user data structure
 */
export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  [key: string]: any; // For additional user properties
}

/**
 * API response for authentication
 */
export interface AuthResponse {
  access_token: string;
  [key: string]: any;
}

/**
 * API response for user profile
 */
export interface UserProfileResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  [key: string]: any;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegistrationData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
}
