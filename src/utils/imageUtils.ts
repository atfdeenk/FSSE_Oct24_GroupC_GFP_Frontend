// src/utils/imageUtils.ts
// Utility functions for handling images

/**
 * Gets the full URL for a product image
 * @param imageUrl The image filename or path from the API
 * @returns The complete URL to the image
 */
export const getImageUrl = (imageUrl?: string): string => {
  if (!imageUrl) return '/coffee-placeholder.jpg';
  
  // If it's already a full URL, return it
  if (imageUrl.startsWith('http')) return imageUrl;
  
  // If it's just a filename, construct the full URL
  // Format: https://indirect-yasmin-ananana-483e9951.koyeb.app/uploads/image-name.png
  return `https://indirect-yasmin-ananana-483e9951.koyeb.app/uploads/${imageUrl}`;
};

/**
 * Handles image loading errors by setting a fallback image
 * @returns Event handler function for onError
 */
export const handleImageError = () => (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.src = '/coffee-placeholder.jpg';
};
