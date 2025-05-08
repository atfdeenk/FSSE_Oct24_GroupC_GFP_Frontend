/**
 * Date utility functions for formatting and manipulating dates
 */

/**
 * Format an API timestamp to date and time strings
 * @param timestamp - API timestamp in format "YYYY-MM-DD HH:MM:SS.ssssss"
 * @returns Object with formatted date and time strings
 */
export const formatApiTimestamp = (timestamp?: string) => {
  if (!timestamp) {
    return {
      dateString: 'N/A',
      timeString: ''
    };
  }
  
  try {
    // Format from API: "2025-05-08 04:31:42.253331"
    // This timestamp is in UTC, we need to convert it to local time (UTC+7)
    
    // First, parse the timestamp components
    const [datePart, timeWithMsPart] = timestamp.split(' ');
    const [timePart] = timeWithMsPart.split('.');
    
    // Create a date string in ISO format that JavaScript can parse
    // Note: We're explicitly treating this as UTC by adding 'Z'
    const isoString = `${datePart}T${timePart}Z`;
    
    // Parse as UTC and convert to local time
    const date = new Date(isoString);
    
    // Format the date in "Month Day, Year" format
    const dateString = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    // Format the time with leading zeros for hours (e.g., "04:40 AM")
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    const timeString = `${hour12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
    
    return {
      dateString,
      timeString
    };
  } catch (e) {
    console.error('Error parsing API timestamp:', e, timestamp);
    return {
      dateString: 'Invalid date',
      timeString: 'Invalid time'
    };
  }
};

/**
 * Format a date string to a human-readable format
 * @param dateString - The date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Format options
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error formatting date';
  }
};

/**
 * Format a date to YYYY-MM-DD format
 * @param date - The date to format
 * @returns Formatted date string in YYYY-MM-DD format
 */
export const formatDateYYYYMMDD = (date?: Date): string => {
  if (!date) return '';
  
  try {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date to YYYY-MM-DD:', error);
    return '';
  }
};

/**
 * Get relative time string (e.g., "2 days ago", "just now")
 * @param dateString - The date string to format
 * @returns Relative time string
 */
export const getRelativeTimeString = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
  } catch (error) {
    console.error('Error getting relative time:', error);
    return 'N/A';
  }
};
