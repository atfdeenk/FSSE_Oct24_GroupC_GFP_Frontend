// src/services/api/topup.ts
import axiosInstance from './axios';
import { API_CONFIG } from './config';

export interface TopUpRequest {
  // Fields from the API response
  request_id: number;  // Primary identifier in the API
  user_id: number;     // User who requested the top-up
  amount: number;      // Amount requested
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;   // API uses timestamp instead of created_at/updated_at
  
  // Additional fields we might add for UI purposes
  id?: number;         // For compatibility with existing code
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
  new_balance?: number; // API returns 'new_balance' field for approve operations
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
            request_id: response.data.requested.request_id,
            user_id: response.data.requested.requested_by,
            amount: response.data.requested.amount,
            status: 'pending',
            timestamp: new Date().toISOString(),
            id: response.data.requested.request_id, // For compatibility
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
      console.log('Fetching top-up requests from:', API_CONFIG.ENDPOINTS.topup.list);
      const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.topup.list);
      console.log('Top-up requests API response:', response.data);
      
      // Based on the actual API response format: { requests: [...] }
      let requests = [];
      if (response.data && response.data.requests && Array.isArray(response.data.requests)) {
        requests = response.data.requests;
        console.log(`Found ${requests.length} top-up requests`);
      } else {
        console.warn('Unexpected response format:', response.data);
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
      console.log(`Approving top-up request ${requestId}`);
      
      // Send the approval request directly to the API
      const approveEndpoint = API_CONFIG.ENDPOINTS.topup.approve(requestId);
      console.log(`Approving request at: ${approveEndpoint}`);
      
      // The API handles everything in one call - no need to update balance separately
      const approveResponse = await axiosInstance.post(approveEndpoint);
      console.log('Approve response:', approveResponse.data);
      
      // Handle the actual API response format
      // { msg: "Top-up approved and balance updated for user 10", new_balance: 601000.0 }
      if (approveResponse.data && approveResponse.data.msg) {
        return {
          success: true,
          msg: approveResponse.data.msg,
          new_balance: approveResponse.data.new_balance,
          // Create a minimal request object for UI compatibility
          request: {
            request_id: requestId,
            user_id: parseInt(approveResponse.data.msg.split('user ')[1]) || 0,
            amount: 0, // We don't get this back from the API
            status: 'approved',
            timestamp: new Date().toISOString()
          }
        };
      }
      
      return {
        success: true,
        msg: 'Top-up request approved successfully'
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
      console.log(`Rejecting top-up request ${requestId}`);
      
      // Send the rejection request directly to the API
      const rejectEndpoint = API_CONFIG.ENDPOINTS.topup.reject(requestId);
      console.log(`Rejecting request at: ${rejectEndpoint}`);
      
      // The API handles everything in one call
      const rejectResponse = await axiosInstance.post(rejectEndpoint);
      console.log('Reject response:', rejectResponse.data);
      
      // Handle the actual API response format
      // { msg: "Top-up request 14 rejected" }
      if (rejectResponse.data && rejectResponse.data.msg) {
        return {
          success: true,
          msg: rejectResponse.data.msg,
          // Create a minimal request object for UI compatibility
          request: {
            request_id: requestId,
            user_id: 0, // We don't get this back from the API
            amount: 0, // We don't get this back from the API
            status: 'rejected',
            timestamp: new Date().toISOString()
          }
        };
      }
      
      return {
        success: true,
        msg: 'Top-up request rejected successfully'
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
