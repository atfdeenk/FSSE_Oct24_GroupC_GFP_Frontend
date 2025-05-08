'use client';

import { useState, useEffect, Fragment } from 'react';
import { 
  FaCheck, 
  FaTimes, 
  FaSearch, 
  FaEye, 
  FaFilter, 
  FaCheckSquare, 
  FaRegCheckSquare,
  FaInfoCircle,
  FaCalendarAlt,
  FaTag,
  FaExclamationTriangle,
  FaClock
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';
import { adminService, ProductApprovalItem } from '@/services/api/admin';
import { API_CONFIG } from '@/services/api/config';
import { formatApiTimestamp } from '@/utils/date';

export default function ProductApproval() {
  const [products, setProducts] = useState<ProductApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<ProductApprovalItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [isBatchActionModalOpen, setIsBatchActionModalOpen] = useState(false);
  const [batchActionType, setBatchActionType] = useState<'approve' | 'reject'>('approve');
  const [batchRejectionReason, setBatchRejectionReason] = useState('');

  useEffect(() => {
    // Fetch pending products from API
    const fetchPendingProducts = async () => {
      try {
        setLoading(true);
        const pendingProducts = await adminService.getPendingProducts();
        setProducts(pendingProducts);
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(pendingProducts.map(product => product.category)));
        setCategories(['all', ...uniqueCategories]);
      } catch (error) {
        console.error('Error fetching pending products:', error);
        toast.error('Failed to load pending products');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.seller.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleView = (product: ProductApprovalItem) => {
    setCurrentProduct(product);
    setIsViewModalOpen(true);
  };

  const handleApprove = async (product: ProductApprovalItem) => {
    try {
      // Call API to approve product
      const success = await adminService.approveProduct(product.id);
      
      if (success) {
        // Update local state
        setProducts(prevProducts => 
          prevProducts.filter(p => p.id !== product.id)
        );
        
        toast.success(`Product "${product.name}" approved successfully`);
      } else {
        throw new Error('Failed to approve product');
      }
    } catch (error) {
      console.error('Error approving product:', error);
      toast.error('Failed to approve product');
    }
  };

  const handleReject = (product: ProductApprovalItem) => {
    setCurrentProduct(product);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!currentProduct || !rejectionReason.trim()) return;
    
    try {
      // Call API to reject product
      const success = await adminService.rejectProduct(currentProduct.id, rejectionReason);
      
      if (success) {
        // Update local state
        setProducts(prevProducts => 
          prevProducts.filter(p => p.id !== currentProduct.id)
        );
        
        // Clear from selected products if it was selected
        if (selectedProducts.includes(currentProduct.id)) {
          setSelectedProducts(prev => prev.filter(id => id !== currentProduct.id));
        }
        
        toast.success(`Product "${currentProduct.name}" rejected`);
        setIsRejectModalOpen(false);
      } else {
        throw new Error('Failed to reject product');
      }
    } catch (error) {
      console.error('Error rejecting product:', error);
      toast.error('Failed to reject product');
    }
  };
  
  // Toggle product selection for batch actions
  const toggleProductSelection = (productId: number) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };
  
  // Select all visible products
  const selectAllProducts = () => {
    if (selectedProducts.length === filteredProducts.length) {
      // If all are selected, deselect all
      setSelectedProducts([]);
    } else {
      // Otherwise, select all visible products
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };
  
  // Open batch action modal
  const openBatchActionModal = (actionType: 'approve' | 'reject') => {
    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product');
      return;
    }
    
    setBatchActionType(actionType);
    if (actionType === 'reject') {
      setBatchRejectionReason('');
    }
    setIsBatchActionModalOpen(true);
  };
  
  // Handle batch approval
  const handleBatchApprove = async () => {
    if (selectedProducts.length === 0) return;
    
    try {
      let successCount = 0;
      let failCount = 0;
      
      // Process each selected product
      for (const productId of selectedProducts) {
        try {
          const success = await adminService.approveProduct(productId);
          if (success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          console.error(`Error approving product ${productId}:`, error);
          failCount++;
        }
      }
      
      // Update local state to remove approved products
      setProducts(prevProducts => 
        prevProducts.filter(p => !selectedProducts.includes(p.id))
      );
      
      // Clear selection
      setSelectedProducts([]);
      
      // Show success message
      if (successCount > 0) {
        toast.success(`Successfully approved ${successCount} products`);
      }
      if (failCount > 0) {
        toast.error(`Failed to approve ${failCount} products`);
      }
      
      setIsBatchActionModalOpen(false);
    } catch (error) {
      console.error('Error in batch approval:', error);
      toast.error('Failed to process batch approval');
    }
  };
  
  // Handle batch rejection
  const handleBatchReject = async () => {
    if (selectedProducts.length === 0 || !batchRejectionReason.trim()) return;
    
    try {
      let successCount = 0;
      let failCount = 0;
      
      // Process each selected product
      for (const productId of selectedProducts) {
        try {
          const success = await adminService.rejectProduct(productId, batchRejectionReason);
          if (success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          console.error(`Error rejecting product ${productId}:`, error);
          failCount++;
        }
      }
      
      // Update local state to remove rejected products
      setProducts(prevProducts => 
        prevProducts.filter(p => !selectedProducts.includes(p.id))
      );
      
      // Clear selection
      setSelectedProducts([]);
      
      // Show success message
      if (successCount > 0) {
        toast.success(`Successfully rejected ${successCount} products`);
      }
      if (failCount > 0) {
        toast.error(`Failed to reject ${failCount} products`);
      }
      
      setIsBatchActionModalOpen(false);
    } catch (error) {
      console.error('Error in batch rejection:', error);
      toast.error('Failed to process batch rejection');
    }
  };

  // Function to handle image errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/images/placeholder.jpg';
  };
  
  // Function to get the full image URL
  const getImageUrl = (imagePath: string) => {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Use the API's image URL endpoint
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.products.imageUrl(imagePath)}`;
  };

  if (loading) {
    return (
      <div className="bg-neutral-800 shadow-lg rounded-lg p-6 border border-neutral-700">
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-3"></div>
          <p className="text-neutral-300 font-medium">Loading pending products...</p>
          <p className="text-xs text-neutral-400 mt-1">This may take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-800 shadow-lg rounded-lg p-6 border border-neutral-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Product Approval</h2>
          <p className="text-sm text-neutral-400 mt-1">Review and manage pending product submissions</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Category Filter */}
          <div className="relative w-full sm:w-auto">
            <select
              className="w-full sm:w-auto pl-10 pr-4 py-2.5 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400 appearance-none bg-neutral-700 text-neutral-200 shadow-md"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by category"
            >
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
            <FaFilter className="absolute left-3 top-3.5 text-amber-500" />
          </div>
          
          {/* Search Input */}
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full sm:w-auto pl-10 pr-4 py-2.5 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400 bg-neutral-700 text-neutral-200 shadow-md placeholder-neutral-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search products"
            />
            <FaSearch className="absolute left-3 top-3.5 text-amber-500" />
          </div>
        </div>
      </div>
      
      {/* Batch Actions */}
      <div className="mb-6 p-4 bg-neutral-750 rounded-lg border border-neutral-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <button
            onClick={selectAllProducts}
            className="flex items-center text-sm font-medium text-neutral-300 hover:text-amber-400 transition-colors duration-200 bg-neutral-700 px-3 py-1.5 rounded-md border border-neutral-600 shadow-md"
            aria-label={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0 ? 'Deselect all products' : 'Select all products'}
          >
            {selectedProducts.length === filteredProducts.length && filteredProducts.length > 0 ? (
              <>
                <FaCheckSquare className="mr-2 text-amber-500" />
                <span>Deselect All</span>
              </>
            ) : (
              <>
                <FaRegCheckSquare className="mr-2 text-neutral-400" />
                <span>Select All</span>
              </>
            )}
          </button>
          <div className="flex items-center mt-2 sm:mt-0">
            <span className="text-sm font-medium text-neutral-300 bg-neutral-700 px-3 py-1.5 rounded-md border border-neutral-600 shadow-md">
              {selectedProducts.length} of {filteredProducts.length} selected
            </span>
            {selectedProducts.length > 0 && (
              <span className="ml-2 text-xs text-amber-500">
                Ready for batch action
              </span>
            )}
          </div>
        </div>
        
        {selectedProducts.length > 0 && (
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => openBatchActionModal('approve')}
              className="flex-1 sm:flex-initial px-4 py-2 bg-green-700 text-white font-medium rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center shadow-md border border-green-600"
              aria-label="Approve selected products"
            >
              <FaCheck className="mr-2" /> 
              <span>Approve {selectedProducts.length > 1 ? `(${selectedProducts.length})` : ''}</span>
            </button>
            <button
              onClick={() => openBatchActionModal('reject')}
              className="flex-1 sm:flex-initial px-4 py-2 bg-red-700 text-white font-medium rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center shadow-md border border-red-600"
              aria-label="Reject selected products"
            >
              <FaTimes className="mr-2" /> 
              <span>Reject {selectedProducts.length > 1 ? `(${selectedProducts.length})` : ''}</span>
            </button>
          </div>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 px-4 bg-neutral-750 rounded-lg border border-dashed border-neutral-600 shadow-md">
          <div className="flex flex-col items-center">
            <div className="bg-neutral-700 p-4 rounded-full mb-4">
              <FaFilter className="text-neutral-400 text-2xl" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No pending products found</h3>
            <p className="text-neutral-400 max-w-md mb-4">
              {searchTerm || selectedCategory !== 'all' ? 
                'Try adjusting your search or filter criteria to find what you\'re looking for.' : 
                'There are no products waiting for your approval at this time.'}
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 bg-amber-900/30 text-amber-400 rounded-lg hover:bg-amber-900/40 transition-colors duration-200 font-medium flex items-center border border-amber-700 shadow-md"
              >
                <FaTimes className="mr-2" /> Clear filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto border border-neutral-700 rounded-lg shadow-lg">
          <table className="min-w-full divide-y divide-neutral-700">
            <thead>
              <tr className="bg-gradient-to-r from-amber-900/30 to-amber-800/20 border-b border-amber-700/30">
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  <span className="sr-only">Select</span>
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Seller
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-neutral-800 divide-y divide-neutral-700">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-neutral-750 transition-colors duration-150">
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      <div className="relative inline-flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-amber-600 border-neutral-600 rounded focus:ring-amber-500 bg-neutral-700"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                          aria-label={`Select product ${product.name}`}
                        />
                        <label htmlFor={`product-${product.id}`} className="sr-only">Select product</label>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-neutral-600 shadow-md group-hover:shadow-lg transition-all duration-200">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={getImageUrl(product.images[0])}
                            alt={product.name}
                            className="h-full w-full object-cover object-center transition-opacity duration-200"
                            onError={handleImageError}
                          />
                        ) : (
                          <div className="h-full w-full bg-neutral-700 flex items-center justify-center text-amber-500 text-xs">
                            <span className="font-medium">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-white hover:text-amber-400 cursor-pointer" onClick={() => handleView(product)}>
                          {product.name}
                        </div>
                        <div className="text-sm text-neutral-400 truncate max-w-xs mt-0.5">
                          {product.description.length > 50 
                            ? `${product.description.substring(0, 50)}...` 
                            : product.description}
                        </div>
                        <div className="text-xs text-amber-500 mt-1">
                          ID: #{product.id} • Submitted {formatApiTimestamp(product.created_at).dateString}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-600/20 text-amber-400 border border-amber-600/30">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-white">${product.price.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-white">{product.seller.name}</div>
                      <div className="text-xs text-neutral-400 mt-0.5">{product.seller.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-neutral-400">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-1 h-3 w-3 text-amber-500" />
                        {formatApiTimestamp(product.created_at).dateString}
                      </div>
                      <div className="flex items-center mt-1 text-xs text-neutral-500">
                        <FaClock className="mr-1 h-2.5 w-2.5" />
                        {formatApiTimestamp(product.created_at).timeString}
                      </div>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-3 justify-end">
                      <button
                        onClick={() => handleView(product)}
                        className="p-2 text-amber-500 hover:text-amber-400 bg-amber-900/20 hover:bg-amber-800/30 rounded-md transition-colors duration-150 shadow-md hover:shadow-lg border border-amber-700/50"
                        title="View Details"
                        aria-label="View product details"
                      >
                        <FaEye size={16} />
                      </button>
                      <button
                        onClick={() => handleApprove(product)}
                        className="p-2 text-green-500 hover:text-green-400 bg-green-900/20 hover:bg-green-800/30 rounded-md transition-colors duration-150 shadow-md hover:shadow-lg border border-green-700/50"
                        title="Approve Product"
                        aria-label="Approve product"
                      >
                        <FaCheck size={16} />
                      </button>
                      <button
                        onClick={() => handleReject(product)}
                        className="p-2 text-red-500 hover:text-red-400 bg-red-900/20 hover:bg-red-800/30 rounded-md transition-colors duration-150 shadow-md hover:shadow-lg border border-red-700/50"
                        title="Reject Product"
                        aria-label="Reject product"
                      >
                        <FaTimes size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Batch Action Modal */}
      <Transition appear show={isBatchActionModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsBatchActionModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-40" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-neutral-800 p-6 text-left align-middle shadow-xl transition-all border border-neutral-700">
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title as="h3" className="text-lg font-bold text-white">
                      {batchActionType === 'approve' ? 'Approve Selected Products' : 'Reject Selected Products'}
                    </Dialog.Title>
                    <button
                      type="button"
                      onClick={() => setIsBatchActionModalOpen(false)}
                      className="text-neutral-400 hover:text-neutral-300 focus:outline-none"
                    >
                      <span className="sr-only">Close</span>
                      <FaTimes className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                  
                  <div className="bg-amber-900/20 border-l-4 border-amber-600 p-4 mb-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        {batchActionType === 'approve' ? (
                          <FaCheck className="h-5 w-5 text-amber-500" aria-hidden="true" />
                        ) : (
                          <FaTimes className="h-5 w-5 text-amber-500" aria-hidden="true" />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-amber-400">
                          {batchActionType === 'approve' 
                            ? `You are about to approve ${selectedProducts.length} selected product${selectedProducts.length > 1 ? 's' : ''}.` 
                            : `You are about to reject ${selectedProducts.length} selected product${selectedProducts.length > 1 ? 's' : ''}.`}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {batchActionType === 'reject' && (
                    <div className="mt-4">
                      <label htmlFor="batch-rejection-reason" className="block text-sm font-medium text-neutral-300">
                        Rejection Reason <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        id="batch-rejection-reason"
                        rows={4}
                        className="mt-1 block w-full px-4 py-3 border border-neutral-600 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none bg-neutral-700 text-neutral-200 placeholder-neutral-400"
                        placeholder="Please provide a detailed reason for rejection..."
                        value={batchRejectionReason}
                        onChange={(e) => setBatchRejectionReason(e.target.value)}
                        required
                      />
                      <p className="mt-1 text-xs text-neutral-400">
                        This reason will be sent to the sellers of all rejected products.
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className="px-4 py-2.5 text-sm font-medium text-neutral-300 bg-neutral-700 border border-neutral-600 rounded-lg hover:bg-neutral-650 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200 shadow-md"
                      onClick={() => setIsBatchActionModalOpen(false)}
                    >
                      Cancel
                    </button>
                    {batchActionType === 'approve' ? (
                      <button
                        type="button"
                        className="px-4 py-2.5 text-sm font-medium text-white bg-green-700 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 shadow-md flex items-center border border-green-600"
                        onClick={handleBatchApprove}
                      >
                        <FaCheck className="mr-2" />
                        Approve {selectedProducts.length} Products
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="px-4 py-2.5 text-sm font-medium text-white bg-red-700 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 shadow-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed border border-red-600"
                        onClick={handleBatchReject}
                        disabled={!batchRejectionReason.trim()}
                      >
                        <FaTimes className="mr-2" />
                        Reject {selectedProducts.length} Products
                      </button>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      
      {/* View Product Modal */}
      <Transition appear show={isViewModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsViewModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-40" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-neutral-800 p-6 text-left align-middle shadow-xl transition-all border border-neutral-700">
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-bold text-white flex items-center"
                    >
                      <span className="bg-amber-900/30 text-amber-400 p-1.5 rounded-md mr-2 border border-amber-700/50">
                        <FaEye className="h-4 w-4" />
                      </span>
                      Product Details
                    </Dialog.Title>
                    <button
                      type="button"
                      onClick={() => setIsViewModalOpen(false)}
                      className="text-neutral-400 hover:text-neutral-300 focus:outline-none"
                    >
                      <span className="sr-only">Close</span>
                      <FaTimes className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                  
                  {currentProduct && (
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-neutral-750 border border-neutral-600 shadow-md">
                            {currentProduct.images && currentProduct.images.length > 0 ? (
                              <img 
                                src={getImageUrl(currentProduct.images[0])} 
                                alt={currentProduct.name}
                                className="h-full w-full object-cover object-center"
                                onError={handleImageError}
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-neutral-700">
                                <span className="text-amber-500 font-medium">No image available</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-4 bg-amber-900/20 rounded-lg p-4 border border-amber-700/50">
                            <h4 className="font-medium text-amber-400 mb-2 flex items-center">
                              <FaInfoCircle className="mr-2" /> Product Status
                            </h4>
                            <p className="text-sm text-amber-300">
                              This product is awaiting your approval before it can be listed in the marketplace.
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-5">
                          <div className="pb-3 border-b border-neutral-700">
                            <h4 className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Product Name</h4>
                            <p className="mt-1 text-lg font-semibold text-white">{currentProduct.name}</p>
                          </div>
                          
                          <div className="pb-3 border-b border-neutral-700">
                            <h4 className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Description</h4>
                            <p className="mt-1 text-neutral-300 whitespace-pre-line">{currentProduct.description}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 pb-3 border-b border-neutral-700">
                            <div>
                              <h4 className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Price</h4>
                              <p className="mt-1 text-lg font-semibold text-white">
                                ${currentProduct.price.toFixed(2)} {currentProduct.currency && currentProduct.currency !== 'USD' ? `(${currentProduct.currency})` : ''}
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Category</h4>
                              <p className="mt-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-900/20 text-amber-400 border border-amber-700/50">
                                  {currentProduct.category}
                                </span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 pb-3 border-b border-neutral-700">
                            <div>
                              <h4 className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Stock Quantity</h4>
                              <p className="mt-1 text-sm text-neutral-300">
                                {currentProduct.stock_quantity} units
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Submitted On</h4>
                              <p className="mt-1 text-sm text-neutral-300 flex items-center">
                                <FaCalendarAlt className="mr-1.5 h-3 w-3 text-amber-500" />
                                {formatApiTimestamp(currentProduct.created_at).dateString}
                              </p>
                            </div>
                          </div>
                          
                          <div className="pb-3 border-b border-neutral-700">
                            <h4 className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Seller Information</h4>
                            <div className="mt-2 flex items-center">
                              <div className="h-8 w-8 rounded-full bg-neutral-700 flex items-center justify-center text-amber-400 border border-neutral-600">
                                {currentProduct.seller.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-white">{currentProduct.seller.name}</p>
                                <p className="text-xs text-neutral-400">{currentProduct.seller.email}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Submission Details</h4>
                            <div className="mt-2 flex items-center text-sm text-neutral-300">
                              <FaCalendarAlt className="mr-2 text-amber-500" />
                              <div>
                                <div className="flex items-center">
                                  <span>Submitted on {formatApiTimestamp(currentProduct.created_at).dateString}</span>
                                </div>
                                <div className="flex items-center mt-1 text-xs text-neutral-500">
                                  <FaClock className="mr-1 h-2.5 w-2.5 text-amber-500" />
                                  <span>at {formatApiTimestamp(currentProduct.created_at).timeString}</span>
                                </div>
                              </div>  
                            </div>
                            <div className="mt-1 flex items-center text-sm text-gray-700">
                              <FaTag className="mr-2 text-gray-400" />
                              <span>Product ID: #{currentProduct.id}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-8 pt-4 border-t border-neutral-700 flex justify-between items-center">
                        <button
                          type="button"
                          className="px-4 py-2 text-sm font-medium text-neutral-300 bg-neutral-700 border border-neutral-600 rounded-lg hover:bg-neutral-650 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200 shadow-md"
                          onClick={() => setIsViewModalOpen(false)}
                        >
                          Close
                        </button>
                        
                        <div className="flex space-x-3">
                          <button
                            type="button"
                            className="px-4 py-2.5 text-sm font-medium text-white bg-red-700 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 shadow-md flex items-center border border-red-600"
                            onClick={() => {
                              setIsViewModalOpen(false);
                              handleReject(currentProduct);
                            }}
                          >
                            <FaTimes className="mr-2" /> Reject Product
                          </button>
                          <button
                            type="button"
                            className="px-4 py-2.5 text-sm font-medium text-white bg-green-700 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 shadow-md flex items-center border border-green-600"
                            onClick={() => {
                              setIsViewModalOpen(false);
                              handleApprove(currentProduct);
                            }}
                          >
                            <FaCheck className="mr-2" /> Approve Product
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Reject Product Modal */}
      <Transition appear show={isRejectModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsRejectModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-40" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-neutral-800 p-6 text-left align-middle shadow-xl transition-all border border-red-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-bold text-white flex items-center"
                    >
                      <span className="bg-red-900/30 text-red-400 p-1.5 rounded-md mr-2 border border-red-700/50">
                        <FaTimes className="h-4 w-4" />
                      </span>
                      Reject Product
                    </Dialog.Title>
                    <button
                      type="button"
                      onClick={() => setIsRejectModalOpen(false)}
                      className="text-neutral-400 hover:text-neutral-300 focus:outline-none"
                    >
                      <span className="sr-only">Close</span>
                      <FaTimes className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                  
                  <div className="bg-red-900/20 border-l-4 border-red-700 p-4 mb-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FaExclamationTriangle className="h-5 w-5 text-red-500" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-400">
                          You are about to reject <span className="font-semibold">"{currentProduct?.name}"</span>. This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="rejection-reason" className="block text-sm font-medium text-neutral-300">
                      Rejection Reason <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      id="rejection-reason"
                      rows={4}
                      className="mt-1 block w-full px-4 py-3 border border-neutral-600 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none bg-neutral-700 text-neutral-200 placeholder-neutral-400"
                      placeholder="Please provide a detailed reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      required
                    />
                    <p className="mt-1 text-xs text-neutral-400">
                      This reason will be sent to the seller of the rejected product.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className="px-4 py-2.5 text-sm font-medium text-neutral-300 bg-neutral-700 border border-neutral-600 rounded-lg hover:bg-neutral-650 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200 shadow-md"
                      onClick={() => setIsRejectModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2.5 text-sm font-medium text-white bg-red-700 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 shadow-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed border border-red-600"
                      onClick={handleConfirmReject}
                      disabled={!rejectionReason.trim()}
                    >
                      <FaTimes className="mr-2" /> Confirm Rejection
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
