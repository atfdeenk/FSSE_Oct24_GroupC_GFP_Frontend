// src/lib/utils/imageUtils.ts

/**
 * Get the full image URL for a product image
 * @param imageUrl The image URL from the API
 * @returns The full image URL
 */
export const getImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) return '/images/placeholder.jpg';
  
  // If the URL is already absolute, return it
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Otherwise, construct the URL using our API endpoint
  return `/products/upload/${imageUrl}`;
};

/**
 * Handle image loading errors by setting a fallback image
 * @param event The error event
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>): void => {
  const target = event.target as HTMLImageElement;
  target.src = '/images/placeholder.jpg';
  target.onerror = null; // Prevent infinite loop
};
