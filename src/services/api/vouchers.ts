// src/services/api/vouchers.ts
import { AxiosError } from 'axios';
import { API_CONFIG } from './config';
import axiosInstance from './axios';
import { toast } from 'react-hot-toast';
import { Voucher } from '@/services/vouchers';

// API response types based on the actual API responses
export interface VoucherResponse {
  id: number;
  code: string;
  discount_percent: number;
  discount_amount: number | null;
  expires_at: string | null;
  is_active: boolean;
  vendor_id: number;
  created_at: string;
  usage_limit?: number;
  usage_count?: number;
}

// For GET /vouchers - returns an array of vouchers directly
export type VouchersListResponse = VoucherResponse[];

// For GET /vouchers/:id - returns a single voucher directly
export type VoucherDetailResponse = VoucherResponse;

// Request types based on the actual API requests
export interface CreateVoucherRequest {
  code: string;
  discount_percent: number;
  discount_amount?: number | null;
  is_active: boolean;
  expires_at?: string | null;
}

export interface UpdateVoucherRequest {
  code?: string;
  discount_percent?: number;
  discount_amount?: number | null;
  is_active?: boolean;
  expires_at?: string | null;
}

// Helper function to convert API response to local Voucher format
const mapApiVoucherToLocal = (apiVoucher: VoucherResponse): Voucher => {
  return {
    id: apiVoucher.id.toString(),
    code: apiVoucher.code,
    vendorId: apiVoucher.vendor_id || 0,
    discountPercentage: apiVoucher.discount_percent,
    maxDiscount: apiVoucher.discount_amount || undefined,
    expiryDate: apiVoucher.expires_at ? new Date(apiVoucher.expires_at) : new Date(),
    isActive: apiVoucher.is_active,
    createdAt: apiVoucher.created_at ? new Date(apiVoucher.created_at) : new Date(),
    usage_limit: apiVoucher.usage_limit,
    usage_count: apiVoucher.usage_count
  };
};

// Helper function to convert local Voucher to API request format for creation
const mapLocalVoucherToCreateRequest = (localVoucher: Partial<Voucher>): CreateVoucherRequest => {
  return {
    code: localVoucher.code || '',
    discount_percent: localVoucher.discountPercentage || 0,
    discount_amount: localVoucher.maxDiscount || null,
    is_active: localVoucher.isActive || true,
    expires_at: localVoucher.expiryDate?.toISOString() || null
  };
};

// Helper function to convert local Voucher to API request format for update
const mapLocalVoucherToUpdateRequest = (localVoucher: Partial<Voucher>): UpdateVoucherRequest => {
  const request: UpdateVoucherRequest = {};
  
  if (localVoucher.code !== undefined) request.code = localVoucher.code;
  if (localVoucher.discountPercentage !== undefined) request.discount_percent = localVoucher.discountPercentage;
  if (localVoucher.maxDiscount !== undefined) request.discount_amount = localVoucher.maxDiscount;
  if (localVoucher.isActive !== undefined) request.is_active = localVoucher.isActive;
  if (localVoucher.expiryDate !== undefined) request.expires_at = localVoucher.expiryDate.toISOString();
  
  return request;
};

/**
 * Voucher service for interacting with the voucher API endpoints
 */
const apiVoucherService = {
  /**
   * Get all vouchers
   */
  async getAllVouchers() {
    try {
      const response = await axiosInstance.get<VouchersListResponse>(
        API_CONFIG.ENDPOINTS.vouchers.list
      );
      
      // API returns array directly, not wrapped in data/success properties
      return response.data.map(mapApiVoucherToLocal);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      return [];
    }
  },

  /**
   * Get a voucher by its ID
   */
  async getVoucherById(voucherId: string | number) {
    try {
      const response = await axiosInstance.get<VoucherDetailResponse>(
        API_CONFIG.ENDPOINTS.vouchers.detail(voucherId)
      );
      
      // API returns voucher directly, not wrapped in data/success properties
      return mapApiVoucherToLocal(response.data);
    } catch (error) {
      console.error(`Error fetching voucher ${voucherId}:`, error);
      return null;
    }
  },

  /**
   * Create a new voucher
   */
  async createVoucher(voucher: Omit<Voucher, 'id' | 'createdAt'>) {
    try {
      const voucherData = mapLocalVoucherToCreateRequest(voucher);
      
      console.log('Creating voucher with data:', voucherData);
      
      const response = await axiosInstance.post<VoucherResponse>(
        API_CONFIG.ENDPOINTS.vouchers.create,
        voucherData
      );
      
      toast.success('Voucher created successfully');
      return mapApiVoucherToLocal(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const errorMessage = axiosError.response?.data?.message || 'Failed to create voucher';
      toast.error(errorMessage);
      console.error('Error creating voucher:', error);
      return null;
    }
  },

  /**
   * Update an existing voucher
   */
  async updateVoucher(id: string | number, updates: Partial<Omit<Voucher, 'id' | 'createdAt'>>) {
    try {
      const voucherData = mapLocalVoucherToUpdateRequest(updates);
      
      console.log('Updating voucher with data:', voucherData);
      
      const response = await axiosInstance.put<VoucherResponse>(
        API_CONFIG.ENDPOINTS.vouchers.update(id),
        voucherData
      );
      
      toast.success('Voucher updated successfully');
      return mapApiVoucherToLocal(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const errorMessage = axiosError.response?.data?.message || 'Failed to update voucher';
      toast.error(errorMessage);
      console.error(`Error updating voucher ${id}:`, error);
      return null;
    }
  },
  
  /**
   * Deactivate a voucher
   */
  async deactivateVoucher(id: string | number) {
    try {
      const response = await axiosInstance.put<VoucherResponse>(
        API_CONFIG.ENDPOINTS.vouchers.deactivate(id)
      );
      
      toast.success('Voucher deactivated successfully');
      return true;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const errorMessage = axiosError.response?.data?.message || 'Failed to deactivate voucher';
      toast.error(errorMessage);
      console.error(`Error deactivating voucher ${id}:`, error);
      return false;
    }
  },

  /**
   * Delete a voucher
   */
  async deleteVoucher(id: string | number) {
    try {
      const response = await axiosInstance.delete(
        API_CONFIG.ENDPOINTS.vouchers.delete(id)
      );
      
      toast.success('Voucher deleted successfully');
      return true;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const errorMessage = axiosError.response?.data?.message || 'Failed to delete voucher';
      toast.error(errorMessage);
      console.error(`Error deleting voucher ${id}:`, error);
      return false;
    }
  },

  

  /**
   * Generate a unique voucher code
   * Note: This is a client-side utility function
   */
  generateVoucherCode(prefix = 'BUMI') {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${randomPart}`;
  }
};

export default apiVoucherService;
