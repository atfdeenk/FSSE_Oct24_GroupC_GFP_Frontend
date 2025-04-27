/**
 * Utility functions for handling images in the application
 */

const IMAGE_BASE_URL = 'https://indirect-yasmin-ananana-483e9951.koyeb.app/uploads/';
const PLACEHOLDER_IMAGE = '/coffee-placeholder.jpg';

/**
 * Formats an image URL to ensure it's properly constructed
 * @param imagePath The image path or URL from the API
 * @returns A fully formatted image URL
 */
export const getImageUrl = (imagePath?: string): string => {
  if (!imagePath) return PLACEHOLDER_IMAGE;
  
  // If the URL already includes the base URL, return it as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Otherwise, prepend the base URL
  return `${IMAGE_BASE_URL}${imagePath}`;
};

/**
 * Creates an onError handler for image elements
 * @param fallbackImage Optional custom fallback image path
 * @returns An onError handler function for React image elements
 */
export const handleImageError = (fallbackImage = PLACEHOLDER_IMAGE) => {
  return (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = fallbackImage;
  };
};

/**
 * Constants for image handling
 */
export const ImageConstants = {
  BASE_URL: IMAGE_BASE_URL,
  PLACEHOLDER: PLACEHOLDER_IMAGE
};
