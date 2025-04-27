// src/utils/formatting/date.ts
// Date formatting utilities

/**
 * Format a date string to a readable format
 * @param dateString - ISO date string or Date object
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string | Date,
  options: {
    format?: 'short' | 'medium' | 'long' | 'full';
    includeTime?: boolean;
  } = {}
): string {
  if (!dateString) return '';
  
  const { format = 'medium', includeTime = false } = options;
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // Handle invalid dates
  if (isNaN(date.getTime())) return '';
  
  // Format options mapping
  const formatOptionsMap = {
    short: { year: 'numeric', month: 'numeric', day: 'numeric' } as Intl.DateTimeFormatOptions,
    medium: { year: 'numeric', month: 'short', day: 'numeric' } as Intl.DateTimeFormatOptions,
    long: { year: 'numeric', month: 'long', day: 'numeric' } as Intl.DateTimeFormatOptions,
    full: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' } as Intl.DateTimeFormatOptions,
  };
  
  // Get the format options based on the specified format
  const formatOptions: Intl.DateTimeFormatOptions = formatOptionsMap[format];
  
  // Add time if requested
  if (includeTime) {
    formatOptions.hour = '2-digit';
    formatOptions.minute = '2-digit';
  }
  
  return new Intl.DateTimeFormat('id-ID', formatOptions).format(date);
}

/**
 * Format a date as a relative time (e.g., "2 days ago")
 * @param dateString - ISO date string or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string | Date): string {
  if (!dateString) return '';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // Handle invalid dates
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Define time units in seconds
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;
  
  // Return appropriate relative time
  if (diffInSeconds < 30) {
    return 'just now';
  } else if (diffInSeconds < minute) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < hour) {
    const minutes = Math.floor(diffInSeconds / minute);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInSeconds < day) {
    const hours = Math.floor(diffInSeconds / hour);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInSeconds < week) {
    const days = Math.floor(diffInSeconds / day);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else if (diffInSeconds < month) {
    const weeks = Math.floor(diffInSeconds / week);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffInSeconds < year) {
    const months = Math.floor(diffInSeconds / month);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    const years = Math.floor(diffInSeconds / year);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
}
