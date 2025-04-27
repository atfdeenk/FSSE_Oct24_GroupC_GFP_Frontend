// src/lib/api/methods.ts
// Centralized API methods with improved error handling and type safety
// Aligned with actual API usage in the project

import { ApiResponse, ApiError } from './types';
import { API_CONFIG, getBaseUrl, getEnvironment } from '@/config/api';

// Export the base URL from the centralized configuration
export const BASE_URL = getBaseUrl();

// Get environment-specific timeout
const env = getEnvironment();
const isDevelopment = env === 'development';

// Export timeouts from the centralized configuration
// Use longer timeout in development mode
export const DEFAULT_TIMEOUT = isDevelopment 
  ? API_CONFIG.TIMEOUTS.development 
  : API_CONFIG.TIMEOUTS.default;

/**
 * Formats API errors consistently
 */
export class ApiRequestError extends Error {
  public status: number;
  public code?: string;
  public data?: any;

  constructor(message: string, status: number = 500, code?: string, data?: any) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
    this.data = data;
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
 * Creates a timeout promise that rejects after the specified time
 */
function createTimeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new ApiRequestError(
        `Request timed out after ${ms}ms. Please check your internet connection or try again later.`, 
        408, 
        'TIMEOUT'
      ));
    }, ms);
  });
}

/**
 * Constructs a valid URL for both browser and Node.js environments
 */
function getFullUrl(endpoint: string): string {
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  
  // Use the centralized configuration to get the base URL
  return BASE_URL + cleanEndpoint;
}

/**
 * Parse response based on content type
 */
async function parseResponse(res: Response): Promise<any> {
  const contentType = res.headers.get('content-type');
  
  if (contentType?.includes('application/json')) {
    return res.json();
  } else if (contentType?.includes('text/')) {
    return res.text();
  } else {
    // Try to parse as JSON first, fall back to text
    try {
      return await res.json();
    } catch (e) {
      return res.text();
    }
  }
}

/**
 * Process response errors consistently
 */
async function handleResponseError(res: Response, endpoint: string, method: string): Promise<never> {
  let errorData: any;
  try {
    errorData = await parseResponse(res);
  } catch (e) {
    errorData = { message: `${method} ${endpoint} failed: ${res.status}` };
  }
  
  const errorMessage = errorData?.message || errorData?.error || `${method} ${endpoint} failed: ${res.status}`;
  throw new ApiRequestError(
    errorMessage,
    res.status,
    errorData?.code,
    errorData
  );
}

import { interceptors, RequestConfig } from './interceptors';

// Type for request options with additional properties
export type EnhancedRequestOptions = RequestInit & { 
  timeout?: number; 
  body?: any; 
  metadata?: Record<string, any>;
  rawResponse?: boolean; // For backward compatibility
};

/**
 * Base request function that all other methods use
 */
async function baseRequest<T>(
  method: string,
  endpoint: string,
  options?: EnhancedRequestOptions
): Promise<T> {
  const url = getFullUrl(endpoint);
  const requestTimeout = options?.timeout || DEFAULT_TIMEOUT;
  
  // Create AbortController for timeout
  const controller = new AbortController();
  const { signal } = controller;
  
  // Set up timeout
  const timeoutId = setTimeout(() => {
    controller.abort(new Error('Request timeout'));
  }, requestTimeout);
  
  try {
    // Prepare request config
    const requestConfig = {
      method,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options?.headers || {}),
      },
      signal
    };
    
    // Stringify body if it's an object and not FormData
    if (requestConfig.body && 
        typeof requestConfig.body === 'object' && 
        !(requestConfig.body instanceof FormData)) {
      requestConfig.body = JSON.stringify(requestConfig.body);
    }
    
    // Process request through interceptors
    let processedConfig = { url, ...requestConfig } as RequestConfig;
    processedConfig = await interceptors.processRequest(processedConfig);
    
    // Extract what we need for fetch
    const { url: processedUrl, ...fetchOptions } = processedConfig;
    
    // Execute fetch with abort signal
    const response = await fetch(processedUrl, fetchOptions);
    
    // Process response through interceptors
    let processedResponse = response;
    processedResponse = await interceptors.processResponse(processedResponse);
    
    // Check if response is ok
    if (!processedResponse.ok) {
      await handleResponseError(processedResponse, endpoint, method);
    }
    
    // Return the raw response if requested (for backward compatibility)
    if (options?.rawResponse) {
      return processedResponse as unknown as T;
    }
    
    // Parse response based on content type
    try {
      const contentType = processedResponse.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const data = await processedResponse.json();
        return data as T;
      } else {
        // For non-JSON responses, return a formatted response object
        const text = await processedResponse.text();
        return {
          success: true,
          data: text,
          status: processedResponse.status,
          statusText: processedResponse.statusText
        } as unknown as T;
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      // If parsing fails, return a formatted error response
      return {
        success: false,
        error: 'Failed to parse response',
        status: processedResponse.status,
        statusText: processedResponse.statusText
      } as unknown as T;
    }
  } catch (error: any) {
    // Handle abort error (timeout)
    if (error.name === 'AbortError') {
      throw new ApiRequestError(
        `Request to ${endpoint} timed out after ${requestTimeout}ms. Please try again.`,
        408,
        'TIMEOUT'
      );
    }
    
    // Re-throw API request errors
    if (error instanceof ApiRequestError) {
      throw error;
    }
    
    // Handle other errors
    throw new ApiRequestError(
      error.message || 'An unexpected error occurred',
      500,
      'REQUEST_FAILED',
      { originalError: error }
    );
  } finally {
    // Always clear the timeout
    clearTimeout(timeoutId);
  }
}

/**
 * Enhanced GET request with improved error handling, timeouts, and type safety
 */
export async function apiGet<T>(
  endpoint: string, 
  options?: EnhancedRequestOptions
): Promise<T> {
  return baseRequest<T>('GET', endpoint, options);
}

/**
 * Enhanced POST request with improved error handling, timeouts, and type safety
 */
export async function apiPost<T>(
  endpoint: string, 
  body: any, 
  options?: EnhancedRequestOptions
): Promise<T> {
  return baseRequest<T>('POST', endpoint, { ...options, body });
}

/**
 * Enhanced PUT request with improved error handling, timeouts, and type safety
 */
export async function apiPut<T>(
  endpoint: string, 
  body: any, 
  options?: EnhancedRequestOptions
): Promise<T> {
  return baseRequest<T>('PUT', endpoint, { ...options, body });
}

/**
 * Enhanced PATCH request with improved error handling, timeouts, and type safety
 */
export async function apiPatch<T>(
  endpoint: string, 
  body: any, 
  options?: EnhancedRequestOptions
): Promise<T> {
  return baseRequest<T>('PATCH', endpoint, { ...options, body });
}

/**
 * Enhanced DELETE request with improved error handling, timeouts, and type safety
 */
export async function apiDelete<T>(
  endpoint: string, 
  options?: EnhancedRequestOptions
): Promise<T> {
  return baseRequest<T>('DELETE', endpoint, options);
}
