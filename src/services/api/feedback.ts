// src/services/api/feedback.ts
import axiosInstance from './axios';
import { API_CONFIG } from './config';
import { BaseResponse } from '../../types/apiResponses';

// Types for feedback
export interface Feedback {
  id: number | string;
  user_id: number | string;
  product_id: number | string;
  rating: number;
  comment: string;
  created_at?: string;
  updated_at?: string;
}

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

// Feedback service with Axios
const feedbackService = {
  // Get all feedback
  getAllFeedback: async (page = 1, limit = 10) => {
    try {
      const response = await axiosInstance.get<FeedbacksResponse>(
        API_CONFIG.ENDPOINTS.feedback.list,
        { params: { page, limit } }
      );
      return response.data;
    } catch (error) {
      console.error('Get all feedback error:', error);
      throw error;
    }
  },

  // Get feedback by ID
  getFeedback: async (id: number | string) => {
    try {
      const response = await axiosInstance.get<FeedbackResponse>(
        API_CONFIG.ENDPOINTS.feedback.detail(id)
      );
      return response.data;
    } catch (error) {
      console.error(`Get feedback ${id} error:`, error);
      throw error;
    }
  },

  // Get feedback by product ID
  getFeedbackByProduct: async (productId: number | string, page = 1, limit = 10) => {
    try {
      const response = await axiosInstance.get<FeedbacksResponse>(
        API_CONFIG.ENDPOINTS.feedback.byProduct(productId),
        { params: { page, limit } }
      );
      return response.data;
    } catch (error) {
      console.error(`Get feedback for product ${productId} error:`, error);
      throw error;
    }
  },

  // Get feedback by user ID
  getFeedbackByUser: async (userId: number | string, page = 1, limit = 10) => {
    try {
      const response = await axiosInstance.get<FeedbacksResponse>(
        API_CONFIG.ENDPOINTS.feedback.byUser(userId),
        { params: { page, limit } }
      );
      return response.data;
    } catch (error) {
      console.error(`Get feedback for user ${userId} error:`, error);
      throw error;
    }
  },

  // Create new feedback
  createFeedback: async (feedbackData: CreateFeedbackData) => {
    try {
      const response = await axiosInstance.post<FeedbackResponse>(
        API_CONFIG.ENDPOINTS.feedback.list,
        feedbackData
      );
      return response.data;
    } catch (error) {
      console.error('Create feedback error:', error);
      throw error;
    }
  },

  // Update feedback
  updateFeedback: async (id: number | string, feedbackData: UpdateFeedbackData) => {
    try {
      const response = await axiosInstance.patch<FeedbackResponse>(
        API_CONFIG.ENDPOINTS.feedback.detail(id),
        feedbackData
      );
      return response.data;
    } catch (error) {
      console.error(`Update feedback ${id} error:`, error);
      throw error;
    }
  },

  // Delete feedback
  deleteFeedback: async (id: number | string) => {
    try {
      const response = await axiosInstance.delete<BaseResponse>(
        API_CONFIG.ENDPOINTS.feedback.detail(id)
      );
      return response.data;
    } catch (error) {
      console.error(`Delete feedback ${id} error:`, error);
      throw error;
    }
  }
};

export default feedbackService;
