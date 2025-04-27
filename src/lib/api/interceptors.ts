// src/lib/api/interceptors.ts
// Centralized request/response interceptor system for API calls

import { ApiRequestError } from './methods';

/**
 * Types for request and response interceptors
 */
export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
export type ResponseInterceptor = (response: any) => any | Promise<any>;
export type ErrorInterceptor = (error: any) => any | Promise<any>;

/**
 * Extended RequestInit with additional properties
 */
export interface RequestConfig extends RequestInit {
  url: string;
  timeout?: number;
  metadata?: Record<string, any>;
}

/**
 * Interceptor manager for handling request and response transformations
 */
class InterceptorManager {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  /**
   * Add a request interceptor
   * @param interceptor - Function to transform request config
   * @returns Function to remove this interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index !== -1) {
        this.requestInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * Add a response interceptor
   * @param interceptor - Function to transform response
   * @returns Function to remove this interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    this.responseInterceptors.push(interceptor);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor);
      if (index !== -1) {
        this.responseInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * Add an error interceptor
   * @param interceptor - Function to transform error
   * @returns Function to remove this interceptor
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    this.errorInterceptors.push(interceptor);
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor);
      if (index !== -1) {
        this.errorInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * Process request through all request interceptors
   * @param config - Request configuration
   * @returns Transformed request configuration
   */
  async processRequest(config: RequestConfig): Promise<RequestConfig> {
    let transformedConfig = { ...config };
    
    for (const interceptor of this.requestInterceptors) {
      try {
        transformedConfig = await interceptor(transformedConfig);
      } catch (error) {
        console.error('Error in request interceptor:', error);
        throw error;
      }
    }
    
    return transformedConfig;
  }

  /**
   * Process response through all response interceptors
   * @param response - Response object
   * @returns Transformed response
   */
  async processResponse(response: any): Promise<any> {
    let transformedResponse = response;
    
    for (const interceptor of this.responseInterceptors) {
      try {
        transformedResponse = await interceptor(transformedResponse);
      } catch (error) {
        console.error('Error in response interceptor:', error);
        throw error;
      }
    }
    
    return transformedResponse;
  }

  /**
   * Process error through all error interceptors
   * @param error - Error object
   * @returns Transformed error or rethrows
   */
  async processError(error: any): Promise<never> {
    let transformedError = error;
    
    for (const interceptor of this.errorInterceptors) {
      try {
        transformedError = await interceptor(transformedError);
        
        // If an interceptor returns a non-error value, 
        // we consider the error "handled" and return the value
        if (!(transformedError instanceof Error)) {
          return transformedError as never;
        }
      } catch (newError) {
        // If an interceptor throws, use that as the new error
        transformedError = newError;
      }
    }
    
    // If we get here, the error wasn't handled, so throw it
    throw transformedError;
  }

  /**
   * Clear all interceptors
   */
  clear(): void {
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.errorInterceptors = [];
  }
}

// Create and export a singleton instance
export const interceptors = new InterceptorManager();

// Add default interceptors

// 1. Add authentication token to requests if available
interceptors.addRequestInterceptor((config) => {
  // Use the correct token key from auth.ts
  const token = typeof window !== 'undefined' ? localStorage.getItem('bumibrew_token') : null;
  
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  
  return config;
});

// 2. Log requests in development mode
if (process.env.NODE_ENV !== 'production') {
  interceptors.addRequestInterceptor((config) => {
    console.log(`🚀 Request: ${config.method || 'GET'} ${config.url}`);
    return config;
  });
  
  interceptors.addResponseInterceptor((response) => {
    console.log(`✅ Response:`, response);
    return response;
  });
  
  interceptors.addErrorInterceptor((error) => {
    console.error(`❌ Error:`, error);
    throw error;
  });
}

// 3. Transform common error patterns
interceptors.addErrorInterceptor((error) => {
  // Handle network errors
  if (error instanceof Error && error.message === 'Failed to fetch') {
    return new ApiRequestError(
      'Network error. Please check your internet connection.',
      0,
      'NETWORK_ERROR'
    );
  }
  
  // Add more error transformations as needed
  
  throw error;
});

export default interceptors;
