/**
 * Centralized toast notification system
 * This utility provides a consistent interface for displaying toast notifications
 * throughout the application, following DRY principles.
 */
import toast, { ToastOptions } from 'react-hot-toast';

// Default toast options
const defaultOptions: ToastOptions = {
  duration: 4000,
  position: 'top-right',
};

// Success notification
export const showSuccess = (message: string, options?: ToastOptions) => {
  return toast.success(message, { ...defaultOptions, ...options });
};

// Error notification
export const showError = (message: string, options?: ToastOptions) => {
  return toast.error(message, { ...defaultOptions, ...options });
};

// Info notification
export const showInfo = (message: string, options?: ToastOptions) => {
  return toast(message, { ...defaultOptions, ...options });
};

// Warning notification
export const showWarning = (message: string, options?: ToastOptions) => {
  return toast(message, { 
    ...defaultOptions, 
    ...options,
    icon: '⚠️',
    style: { 
      background: '#FFF7E0', 
      color: '#7A4F01',
    },
  });
};

// Loading notification that can be updated
export const showLoading = (message: string, options?: ToastOptions) => {
  return toast.loading(message, { ...defaultOptions, ...options });
};

// Dismiss a specific toast by ID
export const dismiss = (toastId: string) => {
  toast.dismiss(toastId);
};

// Dismiss all toasts
export const dismissAll = () => {
  toast.dismiss();
};

// Export the Toaster component for use in layout
export { Toaster } from 'react-hot-toast';

// Default toast styling
export const toastOptions = {
  style: {
    background: '#333',
    color: '#fff',
    borderRadius: '8px',
  },
  success: {
    style: {
      background: 'rgba(84, 214, 44, 0.9)',
    },
  },
  error: {
    style: {
      background: 'rgba(255, 72, 66, 0.9)',
    },
  },
};
