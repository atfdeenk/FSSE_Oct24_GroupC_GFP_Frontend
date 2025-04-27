// src/utils/error/index.ts
// Centralized error handling system

import { ApiRequestError } from '../../services/api/errors';

/**
 * Different types of errors in the application
 */
export enum ErrorType {
  API = 'api_error',
  VALIDATION = 'validation_error',
  AUTHENTICATION = 'authentication_error',
  AUTHORIZATION = 'authorization_error',
  NOT_FOUND = 'not_found_error',
  NETWORK = 'network_error',
  TIMEOUT = 'timeout_error',
  UNKNOWN = 'unknown_error',
}

/**
 * Application error class with standardized structure
 */
export class AppError extends Error {
  public type: ErrorType;
  public status?: number;
  public code?: string;
  public details?: any;
  public timestamp: number;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    status?: number,
    code?: string,
    details?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.status = status;
    this.code = code;
    this.details = details;
    this.timestamp = Date.now();
  }

  /**
   * Convert to a user-friendly error message
   */
  toUserMessage(): string {
    switch (this.type) {
      case ErrorType.API:
        return 'There was a problem communicating with the server. Please try again later.';
      case ErrorType.VALIDATION:
        return 'Please check your input and try again.';
      case ErrorType.AUTHENTICATION:
        return 'You need to sign in to access this feature.';
      case ErrorType.AUTHORIZATION:
        return 'You don\'t have permission to access this resource.';
      case ErrorType.NOT_FOUND:
        return 'The requested resource was not found.';
      case ErrorType.NETWORK:
        return 'Please check your internet connection and try again.';
      case ErrorType.TIMEOUT:
        return 'The request took too long to complete. Please try again.';
      default:
        return 'An unexpected error occurred. Please try again later.';
    }
  }

  /**
   * Convert to a JSON object for logging
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      status: this.status,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

/**
 * Convert API errors to AppError
 */
export function fromApiError(error: ApiRequestError): AppError {
  let type = ErrorType.API;

  // Determine error type based on status code
  if (error.status) {
    if (error.status === 401) {
      type = ErrorType.AUTHENTICATION;
    } else if (error.status === 403) {
      type = ErrorType.AUTHORIZATION;
    } else if (error.status === 404) {
      type = ErrorType.NOT_FOUND;
    } else if (error.status === 408 || error.code === 'TIMEOUT') {
      type = ErrorType.TIMEOUT;
    }
  }

  return new AppError(
    error.message,
    type,
    error.status,
    error.code,
    error.details
  );
}

/**
 * Create a validation error
 */
export function createValidationError(message: string, details?: any): AppError {
  return new AppError(
    message,
    ErrorType.VALIDATION,
    400,
    'VALIDATION_ERROR',
    details
  );
}

/**
 * Global error handler for unexpected errors
 */
export function handleGlobalError(error: unknown): AppError {
  // Log error to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('Global error:', error);
  }

  // Convert to AppError
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ApiRequestError) {
    return fromApiError(error);
  }

  if (error instanceof Error) {
    return new AppError(error.message);
  }

  return new AppError('An unknown error occurred');
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    // Common network error messages
    const networkErrorMessages = [
      'Failed to fetch',
      'Network request failed',
      'Network error',
      'The Internet connection appears to be offline',
    ];

    return networkErrorMessages.some(msg => error.message.includes(msg));
  }

  return false;
}

/**
 * Format error for display in UI
 */
export function formatErrorForDisplay(error: unknown): string {
  if (error instanceof AppError) {
    return error.toUserMessage();
  }

  if (error instanceof Error) {
    if (isNetworkError(error)) {
      return 'Please check your internet connection and try again.';
    }
    return error.message;
  }

  return 'An unexpected error occurred. Please try again later.';
}

export default {
  AppError,
  ErrorType,
  fromApiError,
  createValidationError,
  handleGlobalError,
  isNetworkError,
  formatErrorForDisplay,
};
