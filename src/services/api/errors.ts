// src/services/api/errors.ts
// API error handling for Axios-based services

import { AxiosError } from 'axios';

/**
 * API Request Error class for handling Axios errors
 */
export class ApiRequestError extends Error {
  public status: number;
  public code?: string;
  public details?: any;
  public timestamp: number;

  constructor(
    message: string,
    status: number = 500,
    code?: string,
    details?: any
  ) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.timestamp = Date.now();
  }

  /**
   * Create an ApiRequestError from an Axios error
   */
  static fromAxiosError(error: AxiosError): ApiRequestError {
    const status = error.response?.status || 500;
    
    // Handle different response data formats
    let message = 'Unknown API error';
    let code: string | undefined = undefined;
    let details: any = undefined;
    
    if (error.response?.data) {
      // Try to extract message and code from response data
      const data = error.response.data as any;
      message = data.message || data.error || error.message || 'Unknown API error';
      code = data.code || error.code;
      details = data;
    } else {
      message = error.message;
    }

    return new ApiRequestError(message, status, code, details);
  }
}

export default ApiRequestError;
