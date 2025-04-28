// src/services/api/feedback.ts
import axiosInstance from './axios';
import { API_CONFIG } from './config';
import { BaseResponse } from '@/types';

// Types for feedback
export interface Feedback {
  id: number | string;
  user_id: number | string;
  product_id: number | string;
  rating: number;
  comment: string;
  user_name?: string;
  created_at?: string;
  updated_at?: string;
}

// Define our internal feedback response types
export interface FeedbackResponse extends BaseResponse {
  data: Feedback;
}

export interface FeedbacksResponse extends BaseResponse {
  data: Feedback[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateFeedbackData {
  product_id: number | string;
  rating: number;
  comment: string;
}

export interface UpdateFeedbackData {
  rating?: number;
  comment?: string;
}

// Helper function to convert API response to our internal type
const convertApiResponseToFeedback = (apiResponse: any): Feedback => {
  return {
    id: apiResponse.id || 0,
    user_id: apiResponse.user_id || 0,
    product_id: apiResponse.product_id || 0,
    rating: apiResponse.rating || 0,
    comment: apiResponse.comment || '',
    user_name: apiResponse.user_name || '',
    created_at: apiResponse.created_at || '',
    updated_at: apiResponse.updated_at || ''
  };
};

// Feedback service with Axios
const feedbackService = {
  // Get all feedback
  getAllFeedback: async (page = 1, limit = 10): Promise<FeedbacksResponse> => {
    try {
      const response = await axiosInstance.get(
        API_CONFIG.ENDPOINTS.feedback.list,
        { params: { page, limit } }
      );
      
      // Convert API response to our internal type
      const responseData = response.data;
      const feedbacks = Array.isArray(responseData.data) 
        ? responseData.data.map((item: any) => convertApiResponseToFeedback(item))
        : [];
      
      return {
        success: responseData.success || true,
        message: responseData.message || 'Feedback retrieved successfully',
        data: feedbacks,
        total: responseData.total || feedbacks.length,
        page: responseData.page || page,
        limit: responseData.limit || limit
      };
    } catch (error: any) {
      console.error('Get all feedback error:', error);
      // Return empty feedback list on error
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch feedback',
        data: [],
        total: 0,
        page,
        limit
      };
    }
  },

  // Get feedback by ID
  getFeedback: async (id: number | string): Promise<FeedbackResponse> => {
    try {
      const response = await axiosInstance.get(
        API_CONFIG.ENDPOINTS.feedback.detail(id)
      );
      
      // Convert API response to our internal type
      const responseData = response.data;
      const feedback = convertApiResponseToFeedback(responseData.data || {});
      
      return {
        success: responseData.success || true,
        message: responseData.message || 'Feedback retrieved successfully',
        data: feedback
      };
    } catch (error: any) {
      console.error(`Get feedback ${id} error:`, error);
      return {
        success: false,
        message: error?.response?.data?.message || `Failed to fetch feedback ${id}`,
        data: {
          id: 0,
          user_id: 0,
          product_id: 0,
          rating: 0,
          comment: '',
        }
      };
    }
  },

  // Get feedback by product ID
  getFeedbackByProduct: async (productId: number | string, page = 1, limit = 10): Promise<FeedbacksResponse> => {
    try {
      const response = await axiosInstance.get(
        API_CONFIG.ENDPOINTS.feedback.byProduct(productId),
        { params: { page, limit } }
      );
      
      // Convert API response to our internal type
      const responseData = response.data;
      const feedbacks = Array.isArray(responseData.data) 
        ? responseData.data.map((item: any) => convertApiResponseToFeedback(item))
        : [];
      
      return {
        success: responseData.success || true,
        message: responseData.message || 'Feedback retrieved successfully',
        data: feedbacks,
        total: responseData.total || feedbacks.length,
        page: responseData.page || page,
        limit: responseData.limit || limit
      };
    } catch (error: any) {
      console.error(`Get feedback for product ${productId} error:`, error);
      return {
        success: false,
        message: error?.response?.data?.message || `Failed to fetch feedback for product ${productId}`,
        data: [],
        total: 0,
        page,
        limit
      };
    }
  },

  // Get feedback by user ID
  getFeedbackByUser: async (userId: number | string, page = 1, limit = 10): Promise<FeedbacksResponse> => {
    try {
      const response = await axiosInstance.get(
        API_CONFIG.ENDPOINTS.feedback.byUser(userId),
        { params: { page, limit } }
      );
      
      // Convert API response to our internal type
      const responseData = response.data;
      const feedbacks = Array.isArray(responseData.data) 
        ? responseData.data.map((item: any) => convertApiResponseToFeedback(item))
        : [];
      
      return {
        success: responseData.success || true,
        message: responseData.message || 'Feedback retrieved successfully',
        data: feedbacks,
        total: responseData.total || feedbacks.length,
        page: responseData.page || page,
        limit: responseData.limit || limit
      };
    } catch (error: any) {
      console.error(`Get feedback for user ${userId} error:`, error);
      return {
        success: false,
        message: error?.response?.data?.message || `Failed to fetch feedback for user ${userId}`,
        data: [],
        total: 0,
        page,
        limit
      };
    }
  },

  // Create new feedback
  createFeedback: async (feedbackData: CreateFeedbackData): Promise<FeedbackResponse> => {
    try {
      const response = await axiosInstance.post(
        API_CONFIG.ENDPOINTS.feedback.list,
        feedbackData
      );
      
      // Convert API response to our internal type
      const responseData = response.data;
      const feedback = convertApiResponseToFeedback(responseData.data || {});
      
      return {
        success: responseData.success || true,
        message: responseData.message || 'Feedback created successfully',
        data: feedback
      };
    } catch (error: any) {
      console.error('Create feedback error:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to create feedback',
        data: {
          id: 0,
          user_id: 0,
          product_id: feedbackData.product_id,
          rating: feedbackData.rating,
          comment: feedbackData.comment,
        }
      };
    }
  },

  // Update feedback
  updateFeedback: async (id: number | string, feedbackData: UpdateFeedbackData): Promise<FeedbackResponse> => {
    try {
      const response = await axiosInstance.patch(
        API_CONFIG.ENDPOINTS.feedback.detail(id),
        feedbackData
      );
      
      // Convert API response to our internal type
      const responseData = response.data;
      const feedback = convertApiResponseToFeedback(responseData.data || {});
      
      return {
        success: responseData.success || true,
        message: responseData.message || 'Feedback updated successfully',
        data: feedback
      };
    } catch (error: any) {
      console.error(`Update feedback ${id} error:`, error);
      return {
        success: false,
        message: error?.response?.data?.message || `Failed to update feedback ${id}`,
        data: {
          id,
          user_id: 0,
          product_id: 0,
          rating: feedbackData.rating || 0,
          comment: feedbackData.comment || '',
        }
      };
    }
  },

  // Delete feedback
  deleteFeedback: async (id: number | string): Promise<BaseResponse> => {
    try {
      const response = await axiosInstance.delete<BaseResponse>(
        API_CONFIG.ENDPOINTS.feedback.detail(id)
      );
      return response.data;
    } catch (error: any) {
      console.error(`Delete feedback ${id} error:`, error);
      return {
        success: false,
        message: error?.response?.data?.message || `Failed to delete feedback ${id}`,
        error: error?.message
      };
    }
  },
  
  // Get average rating for a product
  getProductAverageRating: async (productId: number | string): Promise<number> => {
    try {
      const feedbacks = await feedbackService.getFeedbackByProduct(productId);
      if (!feedbacks.success || !feedbacks.data || feedbacks.data.length === 0) {
        return 0;
      }
      
      const totalRating = feedbacks.data.reduce((sum, feedback) => sum + feedback.rating, 0);
      return totalRating / feedbacks.data.length;
    } catch (error) {
      console.error(`Get average rating for product ${productId} error:`, error);
      return 0;
    }
  },
  
  // Check if user has already reviewed a product
  hasUserReviewedProduct: async (userId: number | string, productId: number | string): Promise<boolean> => {
    try {
      const feedbacks = await feedbackService.getFeedbackByUser(userId);
      if (!feedbacks.success || !feedbacks.data) {
        return false;
      }
      
      return feedbacks.data.some(feedback => 
        feedback.product_id.toString() === productId.toString()
      );
    } catch (error) {
      console.error(`Check if user ${userId} reviewed product ${productId} error:`, error);
      return false;
    }
  }
};

export default feedbackService;
