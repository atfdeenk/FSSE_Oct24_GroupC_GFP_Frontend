'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { adminService } from '@/services/api/admin';
import { UserProfile } from '@/types/apiResponses';
import { usePolling } from '@/hooks/usePolling';

// Import the new components
import {
  UserHeader,
  UserSearchBar,
  UserTabs,
  UserTable,
  UserDetailsModal,
  UserEditModal,
  UserDeleteModal
} from './users';

export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'admin' | 'customer' | 'seller'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [processingAction, setProcessingAction] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newUsersDetected, setNewUsersDetected] = useState(false);
  const [lastUserCount, setLastUserCount] = useState(0);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('all');

  useEffect(() => {
    // Initial fetch
    fetchUsers();

    // Listen for profile update events
    const handleProfileUpdate = () => {
      console.log('Profile update detected, refreshing user list');
      fetchUsers();
    };
    window.addEventListener('profile:updated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profile:updated', handleProfileUpdate);
    };
  }, []);

  // Use the centralized polling hook to handle automatic user updates
  const { trigger: refreshUsers } = usePolling(
    () => fetchUsers(false), // Pass false to avoid showing loading state during polling
    5000, // Polling interval in milliseconds
    true // Always enable polling for admin
  );

  const fetchUsers = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      console.log('Fetching users from API...');
      
      // Fetch users from the API using the updated admin service
      const users = await adminService.getUsers();
      
      console.log(`Received ${users.length} users from API`);
      
      // Check if there are new users
      if (lastUserCount > 0 && users.length > lastUserCount) {
        setNewUsersDetected(true);
      }
      
      // Update the user count for next comparison
      setLastUserCount(users.length);
      
      // Extract unique cities for filtering
      const cities = users
        .map(user => user.city)
        .filter((city): city is string => Boolean(city)) // Filter out undefined/null values
        .filter((city, index, self) => self.indexOf(city) === index) // Get unique values
        .sort();
      
      console.log('Unique cities:', cities);
      setAvailableCities(cities);
      setUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUserSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';

    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    setSortConfig({ key, direction });
  };

  const getSortedUsers = (usersToSort: UserProfile[]) => {
    if (!sortConfig) return usersToSort;

    return [...usersToSort].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // Handle special case for name sorting
      if (sortConfig.key === 'name') {
        aValue = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
        bValue = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
      } else {
        // Handle specific properties directly instead of using dynamic key access
        switch (sortConfig.key) {
          case 'email':
            aValue = a.email || '';
            bValue = b.email || '';
            break;
          case 'role':
            aValue = a.role || '';
            bValue = b.role || '';
            break;
          case 'city':
            aValue = a.city || '';
            bValue = b.city || '';
            break;
          case 'status':
            aValue = a.status || '';
            bValue = b.status || '';
            break;
          case 'joined':
            // Use a different property since UserProfile doesn't have created_at
            // For now, we'll just use a default value
            aValue = '';
            bValue = '';
            break;
          case 'balance':
            aValue = a.balance || 0;
            bValue = b.balance || 0;
            break;
          default:
            aValue = a.first_name || '';
            bValue = b.first_name || '';
        }

        // Convert to lowercase for string comparison
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      }

      // Handle null/undefined values
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      // Compare the values
      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  };

  const handleViewDetails = (user: UserProfile) => {
    setCurrentUser(user);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (user: UserProfile) => {
    setCurrentUser(user);
    setIsEditModalOpen(true);
  };

  const handleDelete = (user: UserProfile) => {
    setCurrentUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitEdit = async (userData: Partial<UserProfile>) => {
    if (!currentUser?.id) return;

    setProcessingAction(true);
    try {
      const updatedUser = await adminService.updateUser(currentUser.id, userData);

      if (updatedUser) {
        toast.success('User updated successfully');

        // Update the user in the local state
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === currentUser.id ? { ...user, ...userData } : user
          )
        );

        setIsEditModalOpen(false);
      } else {
        toast.error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('An error occurred while updating the user');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!currentUser?.id) return;

    setProcessingAction(true);
    try {
      const success = await adminService.deleteUser(currentUser.id);

      if (success) {
        toast.success('User deleted successfully');

        // Remove the user from the local state
        setUsers(prevUsers => prevUsers.filter(user => user.id !== currentUser.id));

        setIsDeleteModalOpen(false);
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('An error occurred while deleting the user');
    } finally {
      setProcessingAction(false);
    }
  };

  // Filter users based on search term, role, and city
  const filteredUsers = users.filter(user => {
    // Filter by search term
    const firstNameMatch = user.first_name ? user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const lastNameMatch = user.last_name ? user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const emailMatch = user.email ? user.email.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const usernameMatch = user.username ? user.username.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const cityMatch = user.city ? user.city.toLowerCase().includes(searchTerm.toLowerCase()) : false;

    const searchMatch = firstNameMatch || lastNameMatch || emailMatch || usernameMatch || cityMatch;

    // Filter by role
    const roleMatch = activeTab === 'all' || 
      (activeTab === 'seller' ? (user.role === 'seller' || user.role === 'vendor') : user.role === activeTab);

    // Filter by city
    const cityFilterMatch = selectedCity === 'all' || (user.city && user.city === selectedCity);

    return searchMatch && roleMatch && cityFilterMatch;
  });

  // Apply sorting to the filtered users
  const sortedUsers = getSortedUsers(filteredUsers);

  return (
    <div className="space-y-6">
      {newUsersDetected && (
        <div className="bg-green-900/30 border-l-4 border-green-600 p-4 mb-6 rounded-lg shadow-md flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-400">
                New users have been detected!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setNewUsersDetected(false);
              fetchUsers();
            }}
            className="bg-green-800/50 hover:bg-green-700/50 text-green-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 border border-green-700"
          >
            View new users
          </button>
        </div>
      )}

      <div className="bg-neutral-750 p-6 rounded-lg shadow-lg border border-neutral-700 mb-6">
        {/* Header Component */}
        <UserHeader
          title="User Management"
          description="Manage all users in the system"
        />

        {/* Search Bar Component */}
        <UserSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          userCount={sortedUsers.length}
          onRefresh={() => {
            setNewUsersDetected(false);
            fetchUsers();
          }}
          isRefreshing={refreshing}
        />

        {/* Tabs Component */}
        <UserTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={{
            all: users.length,
            admin: users.filter(u => u.role === 'admin').length,
            customer: users.filter(u => u.role === 'customer').length,
            seller: users.filter(u => u.role === 'seller' || u.role === 'vendor').length
          }}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 p-6 animate-pulse">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-neutral-700 h-10 w-10 mr-3"></div>
                <div>
                  <div className="h-4 bg-neutral-700 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-neutral-700 rounded w-24"></div>
                </div>
                <div className="ml-auto h-6 bg-neutral-700 rounded w-20"></div>
              </div>
              <div className="h-4 bg-neutral-700 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-neutral-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <UserTable
          users={sortedUsers}
          sortConfig={sortConfig}
          onUserSort={handleUserSort}
          onViewDetails={handleViewDetails}
          onEditUser={handleEdit}
          onDeleteUser={handleDelete}
          searchTerm={searchTerm}
          onClearSearch={() => setSearchTerm('')}
        />
      )}

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        user={currentUser}
      />

      {/* User Edit Modal */}
      <UserEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={currentUser}
        onSubmit={handleSubmitEdit}
        processingAction={processingAction}
      />

      {/* User Delete Modal */}
      <UserDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        user={currentUser}
        onConfirm={handleConfirmDelete}
        processingAction={processingAction}
      />
    </div>
  );
}