"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '@/utils/format';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import { useAuthUser } from '@/hooks/useAuthUser';
import voucherService, { Voucher as VoucherType } from '@/services/vouchers';
import apiVoucherService from '@/services/api/vouchers';
import axiosInstance from '@/services/api/axios';
import productService from '@/services/api/products';
import { Product } from '@/types';
import { TOKEN_KEY } from '@/constants';

// Define voucher interface for the component - aligned with API structure
interface Voucher {
  id: string;
  code: string;
  vendorId: number | string;
  productIds?: number[];
  productNames?: string[];
  
  // Local UI fields
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  min_purchase?: number;
  max_discount?: number;
  valid_from?: string;
  valid_until?: string;
  status?: 'active' | 'expired' | 'used';
  
  // API fields
  discount_percent?: number;
  is_active?: boolean;
  expires_at?: string;
  
  // Mapped fields from API to local
  discountPercentage?: number;
  expiryDate?: Date;
  isActive?: boolean;
  createdAt?: Date;
  usage_limit?: number;
  usage_count?: number;
}

export default function VoucherManagement() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'used'>('all');
  
  // Form state interface matching API requirements
  interface VoucherFormData {
    code: string;
    discount_percent: number;
    is_active: boolean;
    expires_at: string;
    // Additional fields for UI purposes
    productIds?: number[];
    usage_limit?: number;
    status?: string;
  }
  
  // Form state - using API field names directly with additional UI fields
  const [formData, setFormData] = useState<VoucherFormData>({
    code: '',
    discount_percent: 10,
    is_active: true,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    productIds: [],
    usage_limit: 100
  });

  const { user } = useAuthUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  
  // Function to fetch vouchers directly from the API
  const fetchVouchers = async () => {
    try {
      console.log('Fetching vouchers directly from API...');
      
      // Get the current token to ensure we're authenticated
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (!token) {
        console.error('No authentication token found');
        toast.error('You are not authenticated. Please log in again.');
        return;
      }
      
      // Use explicit auth header for debugging
      const response = await axiosInstance.get('/vouchers/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('API vouchers response:', response.data);
      
      // Map API vouchers to our component format
      const formattedVouchers = response.data.map((v: any) => {
        // Determine status based on expiry date
        const now = new Date();
        const expiryDate = new Date(v.expires_at);
        let status: 'active' | 'expired' | 'used' = 'active';
        
        if (!v.is_active) {
          status = 'used';
        } else if (expiryDate < now) {
          status = 'expired';
        }
        
        // Format dates for form inputs
        const validFrom = new Date(v.created_at).toISOString().split('T')[0];
        const validUntil = expiryDate.toISOString().split('T')[0];
        
        return {
          id: v.id.toString(),
          code: v.code,
          discount_type: 'percentage' as const,
          discount_value: v.discount_percent,
          min_purchase: 0, // Not provided in API response
          max_discount: v.discount_amount || undefined,
          valid_from: validFrom,
          valid_until: validUntil,
          usage_limit: v.usage_limit || 100,
          usage_count: v.usage_count || 0,
          status,
          vendorId: v.vendor_id
        };
      });
      
      setVouchers(formattedVouchers);
    } catch (error) {
      console.error('Error fetching vouchers from API:', error);
      toast.error('Failed to load vouchers from server');
    }
  };
  
  // Fetch vouchers and products
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch products for this vendor
        if (user && user.id) {
          const productsResponse = await productService.getProductsByVendor(user.id);
          if (productsResponse && Array.isArray(productsResponse.products)) {
            // Double-check that we only have products from this vendor
            const vendorId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
            const filteredProducts = productsResponse.products.filter(product => {
              const productVendorId = typeof product.vendor_id === 'string' ? 
                parseInt(product.vendor_id) : product.vendor_id;
              return productVendorId === vendorId;
            });
            
            setProducts(filteredProducts);
            console.log(`Loaded ${filteredProducts.length} products for voucher selection (vendor ID: ${vendorId})`);
            
            // Log for debugging
            if (filteredProducts.length !== productsResponse.products.length) {
              console.warn(`Filtered out ${productsResponse.products.length - filteredProducts.length} products that didn't belong to vendor ${vendorId}`);
            }
          }
        }
        
        // Fetch vouchers from API
        try {
          console.log('Fetching vouchers from API...');
          const apiVouchers = await apiVoucherService.getAllVouchers();
          console.log('API vouchers:', apiVouchers);
          
          // Map API vouchers to our component format
          const formattedVouchers = apiVouchers.map(v => {
            // Determine status based on expiry date
            const now = new Date();
            const expiryDate = new Date(v.expiryDate);
            let status: 'active' | 'expired' | 'used' = 'active';
            
            if (!v.isActive) {
              status = 'used';
            } else if (expiryDate < now) {
              status = 'expired';
            }
            
            // Format dates for form inputs
            const validFrom = new Date(v.createdAt).toISOString().split('T')[0];
            const validUntil = expiryDate.toISOString().split('T')[0];
            
            // Get product names if product IDs are specified
            const productNames = v.productIds && v.productIds.length > 0 ? 
              v.productIds.map(id => {
                const product = products.find(p => {
                  const productId = typeof p.id === 'string' ? parseInt(p.id) : p.id;
                  return productId === id;
                });
                return product ? product.name : `Product #${id}`;
              }) : 
              [];
            
            return {
              id: v.id,
              code: v.code,
              discount_type: 'percentage' as const,
              discount_value: v.discountPercentage,
              min_purchase: v.minPurchase || 0,
              max_discount: v.maxDiscount,
              valid_from: validFrom,
              valid_until: validUntil,
              usage_limit: v.usage_limit || 100,
              usage_count: v.usage_count || 0,
              status,
              productIds: v.productIds,
              productNames,
              vendorId: v.vendorId
            };
          });
          
          setVouchers(formattedVouchers);
        } catch (apiError) {
          console.error('Error fetching vouchers from API:', apiError);
          toast.error('Failed to load vouchers from server');
          
          // Fallback to local storage if API fails
          console.log('Falling back to local storage vouchers...');
          const storedVouchers = voucherService.getVendorVouchers(user?.id || 0);
          
          // Map vouchers to our component format
          const formattedVouchers = storedVouchers.map(v => {
            // Determine status based on expiry date
            const now = new Date();
            const expiryDate = new Date(v.expiryDate);
            let status: 'active' | 'expired' | 'used' = 'active';
            
            if (expiryDate < now) {
              status = 'expired';
            }
            
            // Format dates for form inputs
            const validFrom = new Date(v.createdAt).toISOString().split('T')[0];
            const validUntil = expiryDate.toISOString().split('T')[0];
            
            // Get product names if product IDs are specified
            const productNames = v.productIds && v.productIds.length > 0 ? 
              v.productIds.map(id => {
                const product = products.find(p => {
                  const productId = typeof p.id === 'string' ? parseInt(p.id) : p.id;
                  return productId === id;
                });
                return product ? product.name : `Product #${id}`;
              }) : 
              [];
            
            return {
              id: v.id,
              code: v.code,
              discount_type: 'percentage' as const,
              discount_value: v.discountPercentage,
              min_purchase: v.minPurchase || 0,
              max_discount: v.maxDiscount,
              valid_from: validFrom,
              valid_until: validUntil,
              usage_limit: v.usage_limit || 100,
              usage_count: v.usage_count || 0,
              status,
              productIds: v.productIds,
              productNames,
              vendorId: v.vendorId
            };
          });
          
          setVouchers(formattedVouchers);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, products.length]);

  // Generate random voucher code
  const generateVoucherCode = () => {
    const code = voucherService.generateVoucherCode();
    
    setFormData(prev => ({
      ...prev,
      code
    }));
    
    return code;
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle numeric values - specifically for discount_percent
    if (name === 'discount_percent' && type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : parseFloat(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // No longer needed since we're only using percentage discounts for the API
  // Keeping as a stub for backward compatibility
  const handleDiscountTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // No-op - API only supports percentage discounts via discount_percent
    console.log('Discount type change ignored - API only supports percentage discounts');
  };
  
  // Handle product selection
  const handleProductSelection = (productId: number) => {
    setSelectedProductIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
    
    // Update form data with selected product IDs
    setFormData(prev => ({
      ...prev,
      productIds: selectedProductIds.includes(productId) 
        ? prev.productIds?.filter((id: number) => id !== productId) 
        : [...(prev.productIds || []), productId]
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate form - using exact API field names
      if (!formData.code || !formData.discount_percent || !formData.expires_at) {
        toast.error('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }
      
      // Check if expiry date is valid
      const expiryDate = new Date(formData.expires_at);
      const now = new Date();
      
      if (expiryDate < now) {
        toast.error('Expiry date must be in the future');
        setIsSubmitting(false);
        return;
      }
      
      // Ensure vendor ID is set
      if (!user || !user.id) {
        toast.error('User information is missing');
        setIsSubmitting(false);
        return;
      }
      
      // Use form data directly - exact match with API fields
      // This matches the expected format: { code, discount_percent, is_active, expires_at }
      const apiVoucherData = {
        code: formData.code,
        discount_percent: Number(formData.discount_percent),
        is_active: formData.is_active,
        expires_at: new Date(formData.expires_at).toISOString()
      };
      
      console.log('Sending voucher data to API:', apiVoucherData);
      
      // Define resetForm function at the beginning to avoid reference error
      const resetFormAndState = () => {
        setFormData({
          code: '',
          discount_percent: 10,
          is_active: true,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          productIds: [],
          usage_limit: 100,
          status: 'active'
        });
        setShowForm(false);
        setEditingVoucher(null);
        setSelectedProductIds([]);
      };
      
      if (editingVoucher) {
        // Update existing voucher via API - direct approach
        console.log('Updating voucher via API:', apiVoucherData);
        
        try {
          // Get the current token to ensure we're authenticated
          const token = localStorage.getItem(TOKEN_KEY);
          
          if (!token) {
            toast.error('You are not authenticated. Please log in again.');
            return;
          }
          
          // Use axios directly with explicit auth header for debugging
          const response = await axiosInstance.put(`/vouchers/${editingVoucher.id}`, apiVoucherData, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('API response:', response.data);
          
          // If we get here, the API call was successful
          toast.success('Voucher updated successfully');
          
          // Refresh vouchers list directly from API
          fetchVouchers();
          
          // Reset form and state
          resetFormAndState();
        } catch (error: any) {
          console.error('Error updating voucher:', error);
          toast.error(error.response?.data?.message || 'Failed to update voucher');
        }
      } else {
        // Create new voucher via API - direct approach
        console.log('Creating voucher via API:', apiVoucherData);
        
        try {
          // Get the current token to ensure we're authenticated
          const token = localStorage.getItem(TOKEN_KEY);
          
          if (!token) {
            toast.error('You are not authenticated. Please log in again.');
            return;
          }
          
          // Use axios directly with explicit auth header for debugging
          const response = await axiosInstance.post('/vouchers', apiVoucherData, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('API response:', response.data);
          
          // If we get here, the API call was successful
          toast.success('Voucher created successfully');
          
          // Refresh vouchers list directly from API
          fetchVouchers();
          
          // Reset form and state
          resetFormAndState();
        } catch (error: any) {
          console.error('Error creating voucher:', error);
          toast.error(error.response?.data?.message || 'Failed to create voucher');
        }
      }
    } catch (error) {
      console.error('Error submitting voucher:', error);
      toast.error('Failed to save voucher');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle voucher edit - map component data to API field names
  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    
    // Map the voucher data to match API field names
    setFormData({
      code: voucher.code,
      discount_percent: voucher.discountPercentage || 0,
      is_active: voucher.isActive || true, // Always set to active in the form
      expires_at: new Date(voucher.expiryDate || new Date()).toISOString().split('T')[0]
    });
    
    // Set selected product IDs if needed for UI
    if (voucher.productIds && voucher.productIds.length > 0) {
      setSelectedProductIds(voucher.productIds);
    } else {
      setSelectedProductIds([]);
    }
    
    setShowForm(true);
    
    // Scroll to form
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Handle voucher delete
  const handleDelete = (voucherId: string) => {
    if (window.confirm('Are you sure you want to delete this voucher?')) {
      setLoading(true);
      
      try {
        // Delete voucher using the service
        const deleted = voucherService.deleteVoucher(voucherId);
        
        if (deleted) {
          // Update local state
          setVouchers(vouchers.filter(v => v.id !== voucherId));
          toast.success('Voucher deleted successfully');
        } else {
          toast.error('Failed to delete voucher');
        }
      } catch (error) {
        console.error('Error deleting voucher:', error);
        toast.error('Failed to delete voucher');
      } finally {
        setLoading(false);
      }
    }
  };

  // Reset form and close it
  const resetForm = () => {
    setFormData({
      code: '',
      discount_percent: 10,
      is_active: true,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      productIds: [],
      usage_limit: 100,
      status: 'active'
    });
    setEditingVoucher(null);
    setSelectedProductIds([]);
    setShowForm(false); // Close the form
  };

  // Filter vouchers based on search term and status
  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = voucher.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Map API is_active to local status for filtering
    let voucherStatus = 'active';
    if (voucher.status) {
      voucherStatus = voucher.status;
    } else if (voucher.is_active === false) {
      voucherStatus = 'expired';
    }
    
    const matchesStatus = statusFilter === 'all' || voucherStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading && vouchers.length === 0) {
    return <LoadingOverlay message="Loading vouchers..." />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Voucher Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-500 text-black px-4 py-2 rounded-md font-medium hover:bg-amber-400 transition-all flex items-center gap-2"
        >
          {showForm ? (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Voucher
            </>
          )}
        </button>
      </div>

      {/* Voucher Form */}
      {showForm && (
        <div className="bg-neutral-900/50 rounded-lg border border-white/10 p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">
            {editingVoucher ? 'Edit Voucher' : 'Create New Voucher'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-white/70 mb-1">
                  Voucher Code*
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="flex-1 bg-neutral-800 border border-white/10 rounded-l-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 uppercase"
                    required
                    placeholder="e.g. SUMMER25"
                  />
                  <button
                    type="button"
                    onClick={generateVoucherCode}
                    className="bg-neutral-700 text-white px-3 py-2 rounded-r-md hover:bg-neutral-600 transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>
              
              {/* Status is now handled by is_active field */}
              
              <div>
                <label htmlFor="is_active" className="block text-sm font-medium text-white/70 mb-1">
                  Status
                </label>
                <select
                  id="is_active"
                  name="is_active"
                  value={formData.is_active ? 'true' : 'false'}
                  onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
                  className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="discount_percent" className="block text-sm font-medium text-white/70 mb-1">
                  Discount Percentage*
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    id="discount_percent"
                    name="discount_percent"
                    value={formData.discount_percent}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    min={1}
                    max={100}
                    step={1}
                    required
                  />
                </div>
              </div>
              
              {/* API only requires code, discount_percent, is_active, and expires_at */}
              
              <div>
                <label htmlFor="expires_at" className="block text-sm font-medium text-white/70 mb-1">
                  Expires At*
                </label>
                <input
                  type="date"
                  id="expires_at"
                  name="expires_at"
                  value={formData.expires_at}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="usage_limit" className="block text-sm font-medium text-white/70 mb-1">
                  Usage Limit*
                </label>
                <input
                  type="number"
                  id="usage_limit"
                  name="usage_limit"
                  value={formData.usage_limit || 100}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  min="1"
                />
              </div>
            </div>

            {/* Product Selection Section */}
            <div className="mt-6">
              <h4 className="text-lg font-medium text-white mb-3">Apply Voucher to Specific Products</h4>
              <p className="text-sm text-white/70 mb-4">
                Select products this voucher can be applied to. If none are selected, the voucher will apply to all your products.  
              </p>
              
              {products.length === 0 ? (
                <div className="bg-neutral-800/50 p-4 rounded-md text-white/70 text-sm">
                  No products found. Add products first to apply vouchers to them.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-2">
                  {products.map(product => {
                    const productId = typeof product.id === 'string' ? parseInt(product.id) : product.id;
                    const isSelected = selectedProductIds.includes(productId);
                    
                    return (
                      <div 
                        key={product.id}
                        onClick={() => handleProductSelection(productId)}
                        className={`p-3 rounded-md cursor-pointer border transition-colors ${isSelected 
                          ? 'border-amber-500 bg-amber-500/10' 
                          : 'border-white/10 hover:border-white/30 bg-neutral-800/50'}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-sm flex items-center justify-center ${isSelected ? 'bg-amber-500' : 'border border-white/30'}`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="text-sm text-white truncate">{product.name}</div>
                        </div>
                        <div className="text-xs text-white/50 mt-1 pl-6">{formatCurrency(product.price || 0)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className="mt-3 text-sm text-amber-500">
                {selectedProductIds.length > 0 
                  ? `Selected ${selectedProductIds.length} product${selectedProductIds.length > 1 ? 's' : ''}` 
                  : 'No products selected - voucher will apply to all your products'}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-600 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 text-black rounded-md font-medium hover:bg-amber-400 transition-colors flex items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {editingVoucher ? 'Update Voucher' : 'Create Voucher'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search vouchers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-800 border border-white/10 rounded-md pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            <svg className="w-5 h-5 text-white/50 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="w-full md:w-64">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="used">Used</option>
          </select>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-neutral-900/50 rounded-lg border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-neutral-800/30">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Code
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Discount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Min. Purchase
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Validity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Products
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Usage
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-neutral-900/30 divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-white/50">
                    Loading vouchers...
                  </td>
                </tr>
              ) : filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-white/50">
                    No vouchers found
                  </td>
                </tr>
              ) : (
                filteredVouchers.map(voucher => (
                  <tr key={voucher.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono font-medium text-amber-500">{voucher.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {/* Display discount percentage from API field */}
                        {(voucher.discount_percent || voucher.discountPercentage || 0)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {/* Minimum purchase may not be available in API response */}
                        {voucher.min_purchase ? formatCurrency(Number(voucher.min_purchase)) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {voucher.valid_from} to {voucher.valid_until}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {voucher.productIds && voucher.productIds.length > 0 ? (
                          <div>
                            <span className="text-amber-500 text-xs font-medium px-2 py-1 bg-amber-500/10 rounded-full">
                              {voucher.productIds.length} specific product{voucher.productIds.length > 1 ? 's' : ''}
                            </span>
                            {voucher.productNames && voucher.productNames.length > 0 && (
                              <div className="mt-1 text-xs text-white/60 max-w-xs truncate">
                                {voucher.productNames.slice(0, 2).join(', ')}
                                {voucher.productNames.length > 2 && ` +${voucher.productNames.length - 2} more`}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-white/60">All products</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {voucher.usage_count} / {voucher.usage_limit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        voucher.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : voucher.status === 'expired'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {voucher.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(voucher)}
                          className="text-amber-500 hover:text-amber-400 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(voucher.id)}
                          className="text-red-500 hover:text-red-400 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
