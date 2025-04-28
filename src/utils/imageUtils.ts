// src/utils/imageUtils.ts
// Centralized utility functions for handling images across the application
import { API_CONFIG } from '@/services/api/config';

// Define image types for different contexts
export type ImageType = 'product' | 'category' | 'user' | 'banner';

// Default placeholder images for each type
import { PLACEHOLDER_IMAGE_URL, PLACEHOLDER_CATEGORY_IMAGE_URL, PLACEHOLDER_USER_IMAGE_URL, PLACEHOLDER_BANNER_IMAGE_URL } from '@/constants';

const PLACEHOLDER_IMAGES: Record<ImageType, string> = {
  product: PLACEHOLDER_IMAGE_URL,
  category: PLACEHOLDER_CATEGORY_IMAGE_URL,
  user: PLACEHOLDER_USER_IMAGE_URL,
  banner: PLACEHOLDER_BANNER_IMAGE_URL
};

/**
 * Gets the full URL for an image based on its type
 * @param imageUrl The image filename or path from the API
 * @param type The type of image (product, category, user, banner)
 * @returns The complete URL to the image
 */
export const getImageUrl = (imageUrl?: string, type: ImageType = 'product'): string => {
  // If no image URL provided, return the appropriate placeholder
  if (!imageUrl) return PLACEHOLDER_IMAGES[type];
  
  // If it's already a full URL, return it
  if (imageUrl.startsWith('http')) return imageUrl;
  
  // If it's a relative URL starting with /, it's already a path
  if (imageUrl.startsWith('/')) return imageUrl;
  
  // For product images, use the API endpoint
  if (type === 'product') {
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.products.imageUrl(imageUrl)}`;
  }
  
  // For other types, construct a generic URL
  return `${API_CONFIG.BASE_URL}/uploads/${type}s/${imageUrl}`;
};

/**
 * Handles image loading errors by setting a fallback image
 * @param type The type of image to use for the fallback
 * @returns Event handler function for onError
 */
export const handleImageError = (type: ImageType = 'product') => {
  return (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = event.currentTarget;
    target.src = PLACEHOLDER_IMAGES[type];
    target.onerror = null; // Prevent infinite loops
  };
};

/**
 * Creates a direct image URL handler for a specific image type
 * @param type The type of image
 * @returns A function that takes an imageUrl and returns the full URL
 */
export const createImageUrlHandler = (type: ImageType) => {
  return (imageUrl?: string) => getImageUrl(imageUrl, type);
};

// Pre-configured image URL handlers for common types
export const getProductImageUrl = createImageUrlHandler('product');
export const getCategoryImageUrl = createImageUrlHandler('category');
export const getUserImageUrl = createImageUrlHandler('user');
export const getBannerImageUrl = createImageUrlHandler('banner');

// Pre-configured error handlers for common types
export const handleProductImageError = handleImageError('product');
export const handleCategoryImageError = handleImageError('category');
export const handleUserImageError = handleImageError('user');
export const handleBannerImageError = handleImageError('banner');
