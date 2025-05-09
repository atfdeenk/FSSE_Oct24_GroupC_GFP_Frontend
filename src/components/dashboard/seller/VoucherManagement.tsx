"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '@/utils/format';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import { useAuthUser } from '@/hooks/useAuthUser';
import voucherService, { Voucher as VoucherType } from '@/services/vouchers';
import productService from '@/services/api/products';
import { Product } from '@/types';

// Define voucher interface for the component
interface Voucher {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase: number;
  max_discount?: number;
  valid_from: string;
  valid_until: string;
  usage_limit?: number;
  usage_count?: number;
  status: 'active' | 'expired' | 'used';
  productIds?: number[];
  productNames?: string[];
  vendorId: number | string;
}

export default function VoucherManagement() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'used'>('all');
  
  // Form state
  const [formData, setFormData] = useState<Partial<Voucher>>({
    code: '',
    discount_type: 'percentage',
    discount_value: 10,
    min_purchase: 0,
    max_discount: 0,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usage_limit: 100,
    status: 'active',
    productIds: [],
    vendorId: 0
  });

  const { user } = useAuthUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  
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
        
        // Fetch vouchers from localStorage
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
          let productNames: string[] = [];
          if (v.productIds && v.productIds.length > 0) {
            productNames = products
              .filter(p => {
                const productId = typeof p.id === 'string' ? parseInt(p.id) : p.id;
                return v.productIds?.includes(productId);
              })
              .map(p => p.name);
          }
          
          return {
            id: v.id,
            code: v.code,
            discount_type: 'percentage' as const, // Our service only supports percentage for now
            discount_value: v.discountPercentage,
            min_purchase: v.minPurchase || 0,
            max_discount: v.maxDiscount,
            valid_from: validFrom,
            valid_until: validUntil,
            status,
            productIds: v.productIds,
            productNames,
            vendorId: v.vendorId
          };
        });
        
        setVouchers(formattedVouchers);
        console.log(`Loaded ${formattedVouchers.length} vouchers`);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

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
    
    // Handle numeric values
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : parseFloat(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle discount type change
  const handleDiscountTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const discountType = e.target.value as 'percentage' | 'fixed';
    
    // Reset discount value when changing type
    let discountValue = formData.discount_value;
    if (discountType === 'percentage' && (discountValue as number) > 100) {
      discountValue = 10;
    } else if (discountType === 'fixed' && (discountValue as number) < 1000) {
      discountValue = 10000;
    }
    
    setFormData(prev => ({
      ...prev,
      discount_type: discountType,
      discount_value: discountValue
    }));
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
        ? prev.productIds?.filter(id => id !== productId) 
        : [...(prev.productIds || []), productId]
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate form
      if (!formData.code || !formData.discount_value || !formData.valid_from || !formData.valid_until) {
        toast.error('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }
      
      // Check if dates are valid
      const validFrom = new Date(formData.valid_from);
      const validUntil = new Date(formData.valid_until);
      const now = new Date();
      
      if (validFrom > validUntil) {
        toast.error('Start date must be before end date');
        setIsSubmitting(false);
        return;
      }
      
      // Ensure vendor ID is set
      if (!user || !user.id) {
        toast.error('User information is missing');
        setIsSubmitting(false);
        return;
      }
      
      // Convert form data to voucher service format
      const voucherData = {
        code: formData.code || '',
        vendorId: user.id,
        discountPercentage: formData.discount_value || 0,
        maxDiscount: formData.max_discount,
        minPurchase: formData.min_purchase,
        productIds: formData.productIds,
        expiryDate: new Date(formData.valid_until || ''),
        isActive: true,
        description: `${formData.discount_value}% off voucher` + 
          (formData.productIds && formData.productIds.length > 0 ? ' for selected products' : '')
      };
      
      if (editingVoucher) {
        // Update existing voucher
        const updatedVoucher = voucherService.updateVoucher(editingVoucher.id, voucherData);
        
        if (updatedVoucher) {
          toast.success('Voucher updated successfully');
          
          // Refresh vouchers list
          const storedVouchers = voucherService.getVendorVouchers(user.id);
          setVouchers(storedVouchers.map(v => ({
            id: v.id,
            code: v.code,
            discount_type: 'percentage' as const,
            discount_value: v.discountPercentage,
            min_purchase: v.minPurchase || 0,
            max_discount: v.maxDiscount,
            valid_from: new Date(v.createdAt).toISOString().split('T')[0],
            valid_until: new Date(v.expiryDate).toISOString().split('T')[0],
            status: new Date(v.expiryDate) > new Date() ? 'active' as const : 'expired' as const,
            productIds: v.productIds,
            vendorId: v.vendorId
          })));
        } else {
          toast.error('Failed to update voucher');
        }
      } else {
        // Create new voucher
        const newVoucher = voucherService.createVoucher(voucherData);
        
        toast.success('Voucher created successfully');
        
        // Refresh vouchers list
        const storedVouchers = voucherService.getVendorVouchers(user.id);
        setVouchers(storedVouchers.map(v => ({
          id: v.id,
          code: v.code,
          discount_type: 'percentage' as const,
          discount_value: v.discountPercentage,
          min_purchase: v.minPurchase || 0,
          max_discount: v.maxDiscount,
          valid_from: new Date(v.createdAt).toISOString().split('T')[0],
          valid_until: new Date(v.expiryDate).toISOString().split('T')[0],
          status: new Date(v.expiryDate) > new Date() ? 'active' as const : 'expired' as const,
          productIds: v.productIds,
          vendorId: v.vendorId
        })));
      }
      
      // Reset form and state
      resetForm();
      setShowForm(false);
      setEditingVoucher(null);
      setSelectedProductIds([]);
    } catch (error) {
      console.error('Error submitting voucher:', error);
      toast.error('Failed to save voucher');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle voucher edit
  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setFormData({
      ...voucher
    });
    
    // Set selected product IDs
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
      discount_type: 'percentage',
      discount_value: 10,
      min_purchase: 0,
      max_discount: 0,
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usage_limit: 100,
      status: 'active',
      productIds: [],
      vendorId: user?.id || 0
    });
    setEditingVoucher(null);
    setSelectedProductIds([]);
    setShowForm(false); // Close the form
  };

  // Filter vouchers based on search term and status
  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = voucher.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || voucher.status === statusFilter;
    
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
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-white/70 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="used">Used</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="discount_type" className="block text-sm font-medium text-white/70 mb-1">
                  Discount Type*
                </label>
                <select
                  id="discount_type"
                  name="discount_type"
                  value={formData.discount_type}
                  onChange={handleDiscountTypeChange}
                  className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (Rp)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="discount_value" className="block text-sm font-medium text-white/70 mb-1">
                  {formData.discount_type === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount (Rp)'}*
                </label>
                <input
                  type="number"
                  id="discount_value"
                  name="discount_value"
                  value={formData.discount_value}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  min={formData.discount_type === 'percentage' ? 1 : 1000}
                  max={formData.discount_type === 'percentage' ? 100 : undefined}
                  step={formData.discount_type === 'percentage' ? 1 : 1000}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="min_purchase" className="block text-sm font-medium text-white/70 mb-1">
                  Minimum Purchase (Rp)
                </label>
                <input
                  type="number"
                  id="min_purchase"
                  name="min_purchase"
                  value={formData.min_purchase}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  min="0"
                  step="1000"
                />
              </div>
              
              {formData.discount_type === 'percentage' && (
                <div>
                  <label htmlFor="max_discount" className="block text-sm font-medium text-white/70 mb-1">
                    Maximum Discount (Rp)
                  </label>
                  <input
                    type="number"
                    id="max_discount"
                    name="max_discount"
                    value={formData.max_discount}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    min="0"
                    step="1000"
                    placeholder="No limit"
                  />
                </div>
              )}
              
              <div>
                <label htmlFor="valid_from" className="block text-sm font-medium text-white/70 mb-1">
                  Valid From*
                </label>
                <input
                  type="date"
                  id="valid_from"
                  name="valid_from"
                  value={formData.valid_from}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="valid_until" className="block text-sm font-medium text-white/70 mb-1">
                  Valid Until*
                </label>
                <input
                  type="date"
                  id="valid_until"
                  name="valid_until"
                  value={formData.valid_until}
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
                  value={formData.usage_limit}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  min="1"
                  required
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
                        {voucher.discount_type === 'percentage' ? (
                          <>
                            {voucher.discount_value}%
                            {voucher.max_discount ? (
                              <span className="text-white/50 text-xs ml-1">
                                (max {formatCurrency(voucher.max_discount)})
                              </span>
                            ) : null}
                          </>
                        ) : (
                          formatCurrency(voucher.discount_value)
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {voucher.min_purchase > 0 ? formatCurrency(voucher.min_purchase) : '-'}
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
