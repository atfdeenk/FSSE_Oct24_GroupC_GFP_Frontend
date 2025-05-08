'use client';

import { useState, useEffect, Fragment } from 'react';
import { 
  FaMoneyBillWave, 
  FaSearch, 
  FaHistory, 
  FaPlus, 
  FaUserCircle, 
  FaCalendarAlt,
  FaInfoCircle,
  FaTimes,
  FaCheck
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { adminService, Transaction } from '@/services/api/admin';
import { UserProfile } from '@/types/apiResponses';

export default function BalanceManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [topUpAmount, setTopUpAmount] = useState<number>(0);
  const [topUpDescription, setTopUpDescription] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    // Fetch users and transactions from API
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get customer and seller users from API using the new methods
        const [customerUsers, sellerUsers] = await Promise.all([
          adminService.getCustomerUsers(),
          adminService.getSellerUsers()
        ]);
        
        // Combine and format users with balance and status
        const combinedUsers = [...customerUsers, ...sellerUsers];
        const formattedUsers = combinedUsers.map(user => ({
          ...user,
          balance: user.balance || 0,
          status: user.status || 'active'
        }));
        
        setUsers(formattedUsers);
        
        // Get recent transactions
        // For now, we'll use a sample user to get transactions
        if (formattedUsers.length > 0) {
          const sampleTransactions = await adminService.getUserTransactions(formattedUsers[0].id);
          setTransactions(sampleTransactions);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredUsers = users.filter(user => {
    // Safely check each property before calling toLowerCase()
    const firstNameMatch = user.first_name ? user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const lastNameMatch = user.last_name ? user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const emailMatch = user.email ? user.email.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const roleMatch = user.role ? user.role.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    
    return firstNameMatch || lastNameMatch || emailMatch || roleMatch;
  });

  const handleTopUp = (user: UserProfile) => {
    setCurrentUser(user);
    setTopUpAmount(0);
    setTopUpDescription('');
    setIsTopUpModalOpen(true);
  };

  const handleViewHistory = async (user: UserProfile) => {
    setCurrentUser(user);
    setIsHistoryModalOpen(true);
    setProcessingAction(true);
    
    try {
      // Fetch transactions for this user from API
      const userTxns = await adminService.getUserTransactions(user.id);
      setUserTransactions(userTxns);
    } catch (error) {
      console.error(`Error fetching transactions for user ${user.id}:`, error);
      toast.error('Failed to load transaction history');
      setUserTransactions([]);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleSubmitTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || topUpAmount <= 0) return;
    
    setProcessingAction(true);
    
    try {
      // Call API to update user balance
      const success = await adminService.updateUserBalance(
        currentUser.id, 
        topUpAmount, 
        topUpDescription || 'Manual top-up by admin'
      );
      
      if (success) {
        // Update user balance in local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === currentUser.id 
              ? { ...user, balance: (user.balance || 0) + topUpAmount } 
              : user
          )
        );
        
        // Fetch updated transactions
        const updatedTransactions = await adminService.getUserTransactions(currentUser.id);
        setTransactions(prev => [...updatedTransactions.slice(0, 5), ...prev.slice(5)]);
        
        toast.success(`Successfully added ${topUpAmount} to ${currentUser.first_name}'s balance`);
        setIsTopUpModalOpen(false);
      } else {
        toast.error('Failed to update balance');
      }
    } catch (error) {
      console.error('Error updating balance:', error);
      toast.error('Failed to update balance');
    } finally {
      setProcessingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-3"></div>
          <p className="text-gray-500 font-medium">Loading user data...</p>
          <p className="text-xs text-gray-400 mt-1">This may take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Balance Management</h2>
            <p className="text-sm text-gray-500 mt-1">Manage user balances and transaction history</p>
          </div>
          
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm shadow-sm"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <FaUserCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search terms or check back later.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                          <span className="text-amber-600 font-semibold">
                            {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role || 'customer'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className="text-amber-600">${user.balance?.toFixed(2) || '0.00'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleTopUp(user)}
                          className="text-amber-600 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-md transition-colors duration-150 flex items-center"
                        >
                          <FaPlus className="mr-1 h-3 w-3" />
                          Top Up
                        </button>
                        <button
                          onClick={() => handleViewHistory(user)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors duration-150 flex items-center"
                        >
                          <FaHistory className="mr-1 h-3 w-3" />
                          History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Top-up Modal */}
      <Transition appear show={isTopUpModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => !processingAction && setIsTopUpModalOpen(false)}>
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
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 flex items-center"
                  >
                    <FaMoneyBillWave className="mr-2 text-amber-500" />
                    Top Up Balance
                  </Dialog.Title>
                  
                  {currentUser && (
                    <div className="mt-4">
                      <div className="bg-amber-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <span className="text-amber-600 font-semibold">
                              {currentUser.first_name?.charAt(0)}{currentUser.last_name?.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">
                              {currentUser.first_name} {currentUser.last_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Current Balance: <span className="font-semibold text-amber-600">${currentUser.balance?.toFixed(2) || '0.00'}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <form onSubmit={handleSubmitTopUp}>
                        <div className="mb-4">
                          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                            Amount ($)
                          </label>
                          <input
                            type="number"
                            id="amount"
                            min="0.01"
                            step="0.01"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                            value={topUpAmount || ''}
                            onChange={(e) => setTopUpAmount(parseFloat(e.target.value) || 0)}
                            required
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description (Optional)
                          </label>
                          <input
                            type="text"
                            id="description"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                            value={topUpDescription}
                            onChange={(e) => setTopUpDescription(e.target.value)}
                            placeholder="e.g., Promotional credit"
                          />
                        </div>
                        
                        <div className="mt-6 flex justify-end space-x-3">
                          <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            onClick={() => setIsTopUpModalOpen(false)}
                            disabled={processingAction}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 flex items-center"
                            disabled={processingAction || topUpAmount <= 0}
                          >
                            {processingAction ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <FaCheck className="mr-2 h-3 w-3" />
                                Confirm Top Up
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      
      {/* Transaction History Modal */}
      <Transition appear show={isHistoryModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => !processingAction && setIsHistoryModalOpen(false)}>
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
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 flex items-center"
                    >
                      <FaHistory className="mr-2 text-amber-500" />
                      Transaction History
                    </Dialog.Title>
                    <button
                      onClick={() => setIsHistoryModalOpen(false)}
                      className="text-gray-400 hover:text-gray-500"
                      disabled={processingAction}
                    >
                      <FaTimes className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {currentUser && (
                    <div className="mt-4">
                      <div className="bg-amber-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <span className="text-amber-600 font-semibold">
                              {currentUser.first_name?.charAt(0)}{currentUser.last_name?.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">
                              {currentUser.first_name} {currentUser.last_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Current Balance: <span className="font-semibold text-amber-600">${currentUser.balance?.toFixed(2) || '0.00'}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {processingAction ? (
                        <div className="flex justify-center items-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500 mr-3"></div>
                          <p className="text-gray-500">Loading transaction history...</p>
                        </div>
                      ) : userTransactions.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                          <FaInfoCircle className="mx-auto h-10 w-10 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No transaction history</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            This user has no recorded transactions yet.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {userTransactions.map((transaction) => (
                                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors duration-150">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{transaction.id}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                                    <FaCalendarAlt className="mr-1 h-3 w-3 text-gray-400" />
                                    {transaction.date}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      transaction.type === 'top-up' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                      {transaction.type === 'top-up' ? 'Top-up' : 'Purchase'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <span className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)} USD
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.description}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {transaction.admin ? (
                                      <span className="text-amber-600 font-medium">{transaction.admin}</span>
                                    ) : (
                                      <span className="text-gray-400">System</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      
                      <div className="mt-6 flex justify-end">
                        <button
                          type="button"
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                          onClick={() => setIsHistoryModalOpen(false)}
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
