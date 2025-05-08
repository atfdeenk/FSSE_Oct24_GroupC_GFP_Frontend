'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import topupService, { TopUpRequest } from '@/services/api/topup';
import usersService, { User } from '@/services/api/users';

// Import the new components
import {
  TopupRequestsHeader,
  TopupRequestsSearchBar,
  TopupRequestsTabs,
  TopupRequestsTable,
  TopupRequestsDetailsModal
} from './topup';

export default function TopupRequestsManagement() {
  const [requests, setRequests] = useState<TopUpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<TopUpRequest | null>(null);
  const [processingAction, setProcessingAction] = useState(false);
  const [usersMap, setUsersMap] = useState<Map<string | number, User>>(new Map());
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const [newRequestsDetected, setNewRequestsDetected] = useState(false);
  const [lastRequestCount, setLastRequestCount] = useState(0);

  useEffect(() => {
    fetchUsers();
    fetchRequests();

    // Set up polling interval to check for new requests every 30 seconds
    const pollingInterval = setInterval(() => {
      fetchRequests(false); // Pass false to avoid showing loading state during polling
    }, 1000);

    // Clean up interval on component unmount
    return () => clearInterval(pollingInterval);
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await usersService.getUsers();

      if (response.success && response.data) {
        // Create a map of user_id to user information for quick lookup
        const newUsersMap = new Map<string | number, User>();
        response.data.forEach((user: User) => {
          if (user.id) {
            newUsersMap.set(user.id, user);
            // Also store by string ID for compatibility
            newUsersMap.set(String(user.id), user);
          }
        });

        setUsersMap(newUsersMap);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchRequests = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const response = await topupService.getAllRequests();

      if (response.success && response.requests) {
        // Check if there are new requests
        if (lastRequestCount > 0 && response.requests.length > lastRequestCount) {
          setNewRequestsDetected(true);
        }

        // Update the request count for next comparison
        setLastRequestCount(response.requests.length);
        setRequests(response.requests);
      } else {
        console.error('Failed to fetch top-up requests:', response.error || response.msg);
      }
    } catch (error) {
      console.error('Error fetching top-up requests:', error);
      toast.error('Failed to load top-up requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: number) => {
    setProcessingAction(true);
    try {
      const response = await topupService.approveRequest(requestId);

      if (response.success) {
        // Use the message from the API response if available
        const successMessage = response.msg || 'Top-up request approved successfully';
        toast.success(successMessage);

        // If we have new_balance info, we could display it in a more detailed toast
        if (response.new_balance !== undefined) {
          toast.success(`New user balance: Rp ${response.new_balance.toLocaleString()}`, {
            position: 'bottom-right'
          });
        }

        fetchRequests(); // Refresh the list
        setIsDetailsModalOpen(false);
      } else {
        toast.error(response.error || 'Failed to approve top-up request');
      }
    } catch (error) {
      console.error('Error approving top-up request:', error);
      toast.error('An error occurred while approving the top-up request');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    setProcessingAction(true);
    try {
      const response = await topupService.rejectRequest(requestId);

      if (response.success) {
        // Use the message from the API response if available
        const successMessage = response.msg || 'Top-up request rejected successfully';
        toast.success(successMessage);
        fetchRequests(); // Refresh the list
        setIsDetailsModalOpen(false);
      } else {
        toast.error(response.error || 'Failed to reject top-up request');
      }
    } catch (error) {
      console.error('Error rejecting top-up request:', error);
      toast.error('An error occurred while rejecting the top-up request');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRequestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting to the requests
  const getSortedRequests = (requests: TopUpRequest[]) => {
    if (!sortConfig) return requests;

    return [...requests].sort((a, b) => {
      if (sortConfig.key === 'id' || sortConfig.key === 'request_id') {
        return sortConfig.direction === 'ascending'
          ? (a.request_id || 0) - (b.request_id || 0)
          : (b.request_id || 0) - (a.request_id || 0);
      }

      if (sortConfig.key === 'user') {
        const aName = usersMap.get(a.user_id)?.username || `User #${a.user_id}`;
        const bName = usersMap.get(b.user_id)?.username || `User #${b.user_id}`;
        return sortConfig.direction === 'ascending'
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName);
      }

      if (sortConfig.key === 'amount') {
        return sortConfig.direction === 'ascending'
          ? (a.amount || 0) - (b.amount || 0)
          : (b.amount || 0) - (a.amount || 0);
      }

      if (sortConfig.key === 'status') {
        return sortConfig.direction === 'ascending'
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }

      if (sortConfig.key === 'date') {
        const aDate = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const bDate = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return sortConfig.direction === 'ascending'
          ? aDate - bDate
          : bDate - aDate;
      }

      return 0;
    });
  };

  // Filter requests by search term and active tab
  const filteredRequests = requests.filter(request => {
    // Filter by search term
    const userNameMatch = usersMap.get(request.user_id)?.username ?
      usersMap.get(request.user_id)?.username.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const statusMatch = request.status ? request.status.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const cityMatch = usersMap.get(request.user_id)?.city ?
      usersMap.get(request.user_id)?.city?.toLowerCase().includes(searchTerm.toLowerCase()) : false;

    const searchMatch = userNameMatch || statusMatch || cityMatch || String(request.user_id).includes(searchTerm);

    // Filter by tab
    if (activeTab === 'all') return searchMatch;
    return searchMatch && request.status === activeTab;
  });

  // Apply sorting
  const sortedRequests = getSortedRequests(filteredRequests);

  const handleViewDetails = (request: TopUpRequest) => {
    setCurrentRequest(request);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {newRequestsDetected && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4 rounded shadow-sm flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                New top-up requests have been detected!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setNewRequestsDetected(false);
              fetchRequests();
            }}
            className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
          >
            View new requests
          </button>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-amber-100 mb-6">
        {/* Header Component */}
        <TopupRequestsHeader
          title="Top-up Requests"
          description="Manage customer balance top-up requests"
        />

        {/* Search Bar Component */}
        <TopupRequestsSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          requestCount={sortedRequests.length}
          onRefresh={() => {
            setNewRequestsDetected(false);
            fetchRequests();
          }}
        />

        {/* Tabs Component */}
        <TopupRequestsTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={{
            all: requests.length,
            pending: requests.filter(r => r.status === 'pending').length,
            approved: requests.filter(r => r.status === 'approved').length,
            rejected: requests.filter(r => r.status === 'rejected').length
          }}
        />
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
        <TopupRequestsTable
          requests={sortedRequests}
          usersMap={usersMap}
          sortConfig={sortConfig}
          onRequestSort={handleRequestSort}
          onViewDetails={handleViewDetails}
          searchTerm={searchTerm}
          onClearSearch={() => setSearchTerm('')}
        />
      )}

      <TopupRequestsDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        request={currentRequest}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
        processingAction={processingAction}
      />
    </div>
  );
}
