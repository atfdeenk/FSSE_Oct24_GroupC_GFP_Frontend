// src/services/api/topup.ts
import axiosInstance from './axios';
import { API_CONFIG } from './config';

export interface TopUpRequest {
  id?: number;
  request_id?: number; // API returns request_id
  user_id?: number;
  requested_by?: number; // API returns requested_by
  amount: number;
  status?: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
  notes?: string;
  user_name?: string;
  user_email?: string;
}

export interface TopUpRequestResponse {
  success: boolean;
  request?: TopUpRequest;
  requested?: TopUpRequest; // API returns 'requested' field
  requests?: TopUpRequest[];
  error?: string;
  msg?: string; // API returns 'msg' field
}

/**
 * Top-up service for balance top-up related API calls
 */
const topupService = {
  /**
   * Request a balance top-up
   * @param amount The amount to request for top-up
   * @param notes Optional notes for the request
   */
  async requestTopUp(amount: number, notes?: string): Promise<TopUpRequestResponse> {
    try {
      if (amount <= 0) {
        return {
          success: false,
          error: 'Top-up amount must be greater than zero'
        };
      }

      // Log request details for debugging
      console.log('Sending top-up request to:', API_CONFIG.ENDPOINTS.topup.request);
      console.log('Request payload:', { amount, notes });
      
      // Make the API request with the exact format expected by the API
      // The API might expect a specific format like { amount: number }
      const requestPayload = { amount };
      if (notes) {
        Object.assign(requestPayload, { notes });
      }
      
      console.log('Final request payload:', requestPayload);
      const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.topup.request, requestPayload);
      
      // Log response for debugging
      console.log('Top-up API response:', response.data);
      
      // Handle the API response format
      // The API returns { msg: string, requested: { amount, request_id, requested_by } }
      if (response.data && response.data.requested) {
        return {
          success: true,
          request: {
            id: response.data.requested.request_id,
            user_id: response.data.requested.requested_by,
            amount: response.data.requested.amount,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            notes: notes
          },
          msg: response.data.msg
        };
      } else {
        // Direct API response handling
        return {
          success: true,
          request: response.data
        };
      }
    } catch (error: any) {
      console.error('Failed to request top-up:', error);
      return {
        success: false,
        error: error?.response?.data?.message || error?.message || 'Failed to request top-up'
      };
    }
  },

  /**
   * Get all top-up requests (admin only)
   */
  async getAllRequests(): Promise<TopUpRequestResponse> {
    try {
      const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.topup.list);
      
      // Handle different possible response structures
      let requests = [];
      if (Array.isArray(response.data)) {
        // If the API returns an array directly
        requests = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // If the API returns an object with a data/items/requests property
        if (Array.isArray(response.data.requests)) {
          requests = response.data.requests;
        } else if (Array.isArray(response.data.data)) {
          requests = response.data.data;
        } else if (Array.isArray(response.data.items)) {
          requests = response.data.items;
        } else {
          // As a fallback, try to convert the object to an array if possible
          const possibleArray = Object.values(response.data).find(value => Array.isArray(value));
          if (possibleArray) {
            requests = possibleArray;
          }
        }
      }
      
      return {
        success: true,
        requests: requests
      };
    } catch (error: any) {
      console.error('Failed to fetch top-up requests:', error);
      return {
        success: false,
        requests: [],
        error: error?.response?.data?.message || error?.message || 'Failed to fetch top-up requests'
      };
    }
  },

  /**
   * Approve a top-up request (admin only)
   * @param requestId The ID of the top-up request to approve
   */
  async approveRequest(requestId: number): Promise<TopUpRequestResponse> {
    try {
      // First get the request details to get the user ID and amount
      const requestResponse = await axiosInstance.get(API_CONFIG.ENDPOINTS.topup.detail(requestId));
      const request = requestResponse.data;
      
      if (!request || !request.user_id || !request.amount) {
        return {
          success: false,
          error: 'Invalid request data'
        };
      }
      
      // Update the user's balance using the PATCH method to /users/{id}/balance
      const response = await axiosInstance.patch(
        `/users/${request.user_id}/balance`,
        { 
          amount: request.amount,
          description: `Top-up request #${requestId} approved`
        }
      );
      
      // Mark the request as approved
      await axiosInstance.patch(API_CONFIG.ENDPOINTS.topup.approve(requestId), {
        status: 'approved'
      });
      
      return {
        success: true,
        request: {
          ...request,
          status: 'approved'
        }
      };
    } catch (error: any) {
      console.error(`Failed to approve top-up request ${requestId}:`, error);
      return {
        success: false,
        error: error?.response?.data?.message || error?.message || 'Failed to approve top-up request'
      };
    }
  },

  /**
   * Reject a top-up request (admin only)
   * @param requestId The ID of the top-up request to reject
   */
  async rejectRequest(requestId: number): Promise<TopUpRequestResponse> {
    try {
      // First get the request details
      const requestResponse = await axiosInstance.get(API_CONFIG.ENDPOINTS.topup.detail(requestId));
      const request = requestResponse.data;
      
      if (!request) {
        return {
          success: false,
          error: 'Invalid request data'
        };
      }
      
      // Mark the request as rejected
      await axiosInstance.patch(API_CONFIG.ENDPOINTS.topup.reject(requestId), {
        status: 'rejected'
      });
      
      return {
        success: true,
        request: {
          ...request,
          status: 'rejected'
        }
      };
    } catch (error: any) {
      console.error(`Failed to reject top-up request ${requestId}:`, error);
      return {
        success: false,
        error: error?.response?.data?.message || error?.message || 'Failed to reject top-up request'
      };
    }
  }
};

export default topupService;
