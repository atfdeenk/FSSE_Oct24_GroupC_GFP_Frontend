// src/lib/api/methods.ts
// Centralized API methods with improved error handling and type safety
// Aligned with actual API usage in the project

import { ApiResponse, ApiError } from './types';

// Base URL for API requests
// In browser contexts, this will be a relative URL
// In Node.js contexts (like tests), this needs to be a full URL
const isNodeEnvironment = typeof window === 'undefined';
export const BASE_URL = isNodeEnvironment 
  ? "https://indirect-yasmin-ananana-483e9951.koyeb.app/" // Full URL for Node.js environment
  : "/api/"; // Relative URL for browser environment

/**
 * Formats API errors consistently
 */
export class ApiRequestError extends Error {
  public status: number;
  public code?: string;

  constructor(message: string, status: number = 500, code?: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Handles API errors consistently
 */
export function handleApiError(error: unknown): ApiRequestError {
  if (error instanceof ApiRequestError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new ApiRequestError(error.message);
  }
  
  return new ApiRequestError('An unknown error occurred');
}

/**
 * Constructs a valid URL for both browser and Node.js environments
 */
function getFullUrl(endpoint: string): string {
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  
  // In Node.js environment, we need to use the full URL
  // In browser environment, we can use relative URL
  return BASE_URL + cleanEndpoint;
}

/**
 * Generic GET request with improved error handling and type safety
 * Matches the original implementation but with better error handling
 */
export async function apiGet<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = getFullUrl(endpoint);
  
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(`API GET ${endpoint} failed: ${res.status}`);
  }
  
  return res.json();
}

/**
 * Generic POST request with improved error handling and type safety
 * Matches the original implementation but with better error handling
 */
export async function apiPost<T>(endpoint: string, body: any, options?: RequestInit): Promise<T> {
  const url = getFullUrl(endpoint);
  
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(`API POST ${endpoint} failed: ${res.status}`);
  }
  
  return res.json();
}

/**
 * Generic PUT request with improved error handling and type safety
 */
export async function apiPut<T>(endpoint: string, body: any, options?: RequestInit): Promise<T> {
  const url = getFullUrl(endpoint);
  
  const res = await fetch(url, {
    method: 'PUT',
    body: JSON.stringify(body),
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(`API PUT ${endpoint} failed: ${res.status}`);
  }
  
  return res.json();
}

/**
 * Generic DELETE request with improved error handling and type safety
 */
export async function apiDelete<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = getFullUrl(endpoint);
  
  const res = await fetch(url, {
    method: 'DELETE',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(`API DELETE ${endpoint} failed: ${res.status}`);
  }
  
  // Some DELETE endpoints may not return content
  try {
    return await res.json();
  } catch (e) {
    return {} as T;
  }
}
