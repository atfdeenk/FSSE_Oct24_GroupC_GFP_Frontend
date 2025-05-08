'use client';

import { useState, useEffect, Fragment } from 'react';
import { 
  FaMoneyBillWave, 
  FaSearch, 
  FaCheck, 
  FaTimes, 
  FaUserCircle, 
  FaCalendarAlt,
  FaInfoCircle
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import topupService, { TopUpRequest } from '@/services/api/topup';
import { formatCurrency } from '@/utils/format';
import { adminService } from '@/services/api/admin';

export default function TopupRequestsManagement() {
  const [requests, setRequests] = useState<TopUpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<TopUpRequest | null>(null);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await topupService.getAllRequests();
      
      if (response.success && response.requests) {
        // Ensure requests is always an array
        const requestsArray = Array.isArray(response.requests) ? response.requests : [];
        console.log('Received top-up requests:', requestsArray);
        setRequests(requestsArray);
      } else {
        toast.error(response.error || 'Failed to fetch top-up requests');
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching top-up requests:', error);
      toast.error('Failed to load top-up requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (request: TopUpRequest) => {
    setCurrentRequest(request);
    setIsDetailsModalOpen(true);
  };

  const handleApproveRequest = async (requestId: number) => {
    setProcessingAction(true);
    try {
      const response = await topupService.approveRequest(requestId);
      
      if (response.success) {
        toast.success('Top-up request approved successfully');
        fetchRequests(); // Refresh the list
        setIsDetailsModalOpen(false);
      } else {
        toast.error(response.error || 'Failed to approve top-up request');
      }
    } catch (error) {
      console.error('Error approving top-up request:', error);
      toast.error('An error occurred while approving the request');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    setProcessingAction(true);
    try {
      const response = await topupService.rejectRequest(requestId);
      
      if (response.success) {
        toast.success('Top-up request rejected successfully');
        fetchRequests(); // Refresh the list
        setIsDetailsModalOpen(false);
      } else {
        toast.error(response.error || 'Failed to reject top-up request');
      }
    } catch (error) {
      console.error('Error rejecting top-up request:', error);
      toast.error('An error occurred while rejecting the request');
    } finally {
      setProcessingAction(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    const userNameMatch = request.user_name ? 
      request.user_name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const userEmailMatch = request.user_email ? 
      request.user_email.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const statusMatch = request.status ? request.status.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    
    return userNameMatch || userEmailMatch || statusMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-gradient-to-r from-amber-50 to-white p-4 rounded-lg shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 sm:mb-0 flex items-center">
            <div className="bg-amber-100 p-2 rounded-full mr-3">
              <FaMoneyBillWave className="text-amber-600" size={20} />
            </div>
            Top-up Requests
          </h2>
          <p className="text-gray-600 text-sm mt-1">Manage customer balance top-up requests</p>
        </div>
        
        <div className="w-full sm:w-64 relative mt-4 sm:mt-0">
          <input
            type="text"
            placeholder="Search requests..."
            className="w-full pl-10 pr-4 py-2.5 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-3.5 text-amber-400" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-amber-100 p-6 animate-pulse">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-amber-200/50 h-10 w-10 mr-3"></div>
                <div>
                  <div className="h-4 bg-amber-200/50 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-amber-100/50 rounded w-24"></div>
                </div>
                <div className="ml-auto h-6 bg-amber-100/50 rounded w-20"></div>
              </div>
              <div className="h-4 bg-amber-100/50 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-amber-100/50 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md border border-amber-100 p-8 text-center">
              <div className="bg-amber-50 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
                <FaInfoCircle className="h-10 w-10 text-amber-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No top-up requests found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm ? 'Try adjusting your search terms or clear the search filter' : 'There are no pending top-up requests at the moment'}
              </p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mt-4 px-4 py-2 bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 transition-colors duration-200"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-amber-100">
              <table className="min-w-full divide-y divide-amber-100">
                <thead className="bg-amber-50">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-amber-50">
                  {filteredRequests.map((request, index) => (
                    <tr key={request.id || `request-${index}`} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <span className="bg-amber-50 px-2 py-1 rounded-md font-mono">#{request.id || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shadow-inner">
                            <FaUserCircle className="h-6 w-6 text-amber-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {request.user_name || `User #${request.user_id}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.user_email || 'No email available'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-md inline-block">
                          {typeof request.amount === 'number' ? formatCurrency(request.amount, 'IDR', 'id-ID') : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-1 h-3 w-3 text-gray-400" />
                          {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {request.status === 'pending' ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDetails(request)}
                              className="text-amber-600 hover:text-amber-900 focus:outline-none"
                            >
                              View Details
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500">
                            {request.status === 'approved' ? 'Approved' : 'Rejected'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Request Details Modal */}
      <Transition appear show={isDetailsModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsDetailsModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  {currentRequest && (
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Top-up Request Details
                      </Dialog.Title>
                      
                      <div className="mt-4 space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">Request ID:</span>
                            <span className="text-sm font-medium">#{currentRequest.id}</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">User ID:</span>
                            <span className="text-sm font-medium">#{currentRequest.user_id}</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">User Name:</span>
                            <span className="text-sm font-medium">{currentRequest.user_name || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">User Email:</span>
                            <span className="text-sm font-medium">{currentRequest.user_email || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">Amount:</span>
                            <span className="text-sm font-medium text-amber-600">{typeof currentRequest.amount === 'number' ? formatCurrency(currentRequest.amount, 'IDR', 'id-ID') : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">Status:</span>
                            <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                              currentRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              currentRequest.status === 'approved' ? 'bg-green-100 text-green-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {currentRequest.status ? currentRequest.status.charAt(0).toUpperCase() + currentRequest.status.slice(1) : 'Unknown'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">Date Requested:</span>
                            <span className="text-sm font-medium">{currentRequest.created_at ? new Date(currentRequest.created_at).toLocaleString() : 'N/A'}</span>
                          </div>
                          {currentRequest.notes && (
                            <div className="mt-2">
                              <span className="text-sm text-gray-500 block mb-1">Notes:</span>
                              <p className="text-sm bg-white p-2 rounded border border-gray-200">{currentRequest.notes}</p>
                            </div>
                          )}
                        </div>
                        
                        {currentRequest.status === 'pending' && (
                          <div className="flex justify-between mt-6">
                            <button
                              type="button"
                              className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                              onClick={() => currentRequest.id ? handleRejectRequest(currentRequest.id) : null}
                              disabled={processingAction}
                            >
                              <FaTimes className="mr-2 h-4 w-4" />
                              Reject
                            </button>
                            <button
                              type="button"
                              className="inline-flex justify-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                              onClick={() => currentRequest.id ? handleApproveRequest(currentRequest.id) : null}
                              disabled={processingAction}
                            >
                              <FaCheck className="mr-2 h-4 w-4" />
                              Approve
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <button
                          type="button"
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                          onClick={() => setIsDetailsModalOpen(false)}
                          disabled={processingAction}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
