'use client';

import React from 'react';
import { FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown, FaEye } from 'react-icons/fa';
import { UserProfile } from '@/types/apiResponses';
import { formatApiTimestamp } from '@/utils/date';

interface UserTableProps {
  users: UserProfile[];
  sortConfig: { key: string; direction: 'ascending' | 'descending' } | null;
  onUserSort: (key: string) => void;
  onViewDetails: (user: UserProfile) => void;
  onEditUser: (user: UserProfile) => void;
  onDeleteUser: (user: UserProfile) => void;
  searchTerm: string;
  onClearSearch: () => void;
}

export default function UserTable({
  users,
  sortConfig,
  onUserSort,
  onViewDetails,
  onEditUser,
  onDeleteUser,
  searchTerm,
  onClearSearch
}: UserTableProps) {
  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FaSort className="h-3 w-3 text-neutral-500" />;
    }
    return sortConfig.direction === 'ascending' ? (
      <FaSortUp className="h-3 w-3 text-amber-500" />
    ) : (
      <FaSortDown className="h-3 w-3 text-amber-500" />
    );
  };

  const renderSortableHeader = (label: string, key: string) => (
    <th
      scope="col"
      className="px-4 py-4 text-left text-sm font-semibold text-white cursor-pointer hover:bg-neutral-700 transition-colors"
      onClick={() => onUserSort(key)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <span className="ml-2">{getSortIcon(key)}</span>
      </div>
    </th>
  );

  if (users.length === 0) {
    return (
      <div className="bg-neutral-800 shadow-lg rounded-lg overflow-hidden border border-neutral-700">
        <div className="p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-600/20 mb-4">
            <svg 
              className="h-8 w-8 text-amber-500" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No users found</h3>
          
          {searchTerm ? (
            <div className="mt-4">
              <p className="text-neutral-400">
                No users match your search criteria: <span className="font-medium text-amber-500">"{searchTerm}"</span>
              </p>
              <button
                type="button"
                className="mt-4 inline-flex items-center px-4 py-2 border border-amber-600 shadow-md text-sm font-medium rounded-lg text-amber-500 bg-transparent hover:bg-amber-600/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
                onClick={onClearSearch}
              >
                Clear search
              </button>
            </div>
          ) : (
            <p className="text-neutral-400">No users have been added to the system yet.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-800 shadow-lg rounded-lg border border-neutral-700 overflow-hidden">
      {/* Desktop view - traditional table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-700">
          <thead className="bg-neutral-750">
            <tr>
              {renderSortableHeader('Name', 'name')}
              {renderSortableHeader('Email', 'email')}
              {renderSortableHeader('Role', 'role')}
              {renderSortableHeader('Location', 'city')}
              {renderSortableHeader('Status', 'status')}
              {renderSortableHeader('Joined', 'joined')}
              <th scope="col" className="relative py-4 pl-3 pr-4 sm:pr-6 text-white">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-700 bg-neutral-800">
            {users.map((user) => {
              const { dateString } = formatApiTimestamp(user.created_at);
              
              return (
                <tr key={user.id} className="hover:bg-neutral-750 transition-colors">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full object-cover border border-neutral-600 shadow-md"
                          src={user.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=D97706&color=ffffff`}
                          alt={user.username}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=D97706&color=ffffff`;
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        {(user.first_name || user.last_name) ? (
                          <div className="font-medium text-white">
                            {user.first_name || ''} {user.last_name || ''}
                          </div>
                        ) : (
                          <div className="font-medium text-white">{user.username}</div>
                        )}
                        <div className="text-neutral-400">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-neutral-300">
                    <div>{user.email}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-neutral-300">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      user.role === 'admin' 
                        ? 'bg-purple-900/50 text-purple-300 border border-purple-700' 
                        : (user.role === 'seller' || user.role === 'vendor')
                          ? 'bg-blue-900/50 text-blue-300 border border-blue-700' 
                          : 'bg-green-900/50 text-green-300 border border-green-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-neutral-300">
                    {user.city || 'N/A'}
                    {user.country && <div className="text-xs text-neutral-500 mt-1">{user.country}</div>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-neutral-300">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      user.is_active === true || user.status === 'active'
                        ? 'bg-green-900/50 text-green-300 border border-green-700' 
                        : 'bg-neutral-700/50 text-neutral-300 border border-neutral-600'
                    }`}>
                      {user.is_active === true ? 'active' : user.is_active === false ? 'inactive' : user.status || 'unknown'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-neutral-300">
                    {dateString}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => onViewDetails(user)}
                        className="text-amber-500 hover:text-amber-400 focus:outline-none transition-colors p-1 hover:bg-neutral-700 rounded"
                        title="View details"
                      >
                        <FaEye className="h-4 w-4" />
                        <span className="sr-only">View details</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditUser(user)}
                        className="text-blue-500 hover:text-blue-400 focus:outline-none transition-colors p-1 hover:bg-neutral-700 rounded"
                        title="Edit user"
                      >
                        <FaEdit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteUser(user)}
                        className="text-red-500 hover:text-red-400 focus:outline-none transition-colors p-1 hover:bg-neutral-700 rounded"
                        title="Delete user"
                      >
                        <FaTrash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile view - card-based layout */}
      <div className="md:hidden divide-y divide-neutral-700">
        {users.map((user) => {
          // Format date
          const formattedDate = user.created_at ? formatApiTimestamp(user.created_at) : { dateString: 'N/A', timeString: '' };
          
          return (
            <div key={user.id} className="p-4 hover:bg-neutral-750 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-neutral-700 flex items-center justify-center overflow-hidden">
                    {user.image_url ? (
                      <img src={user.image_url} alt="" className="h-10 w-10 object-cover" />
                    ) : (
                      <div className="text-neutral-400 font-medium text-lg">
                        {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.username ? user.username.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    {user.first_name || user.last_name ? (
                      <div className="font-medium text-white">
                        {user.first_name} {user.last_name}
                      </div>
                    ) : (
                      <div className="font-medium text-white">{user.username}</div>
                    )}
                    <div className="text-neutral-400 text-xs">@{user.username}</div>
                  </div>
                </div>
                
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                  user.role === 'admin' 
                    ? 'bg-purple-900/50 text-purple-300 border border-purple-700' 
                    : (user.role === 'seller' || user.role === 'vendor')
                      ? 'bg-blue-900/50 text-blue-300 border border-blue-700' 
                      : 'bg-green-900/50 text-green-300 border border-green-700'
                }`}>
                  {user.role}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div>
                  <div className="text-neutral-400">Email</div>
                  <div className="text-neutral-300 truncate">{user.email}</div>
                </div>
                
                <div>
                  <div className="text-neutral-400">Location</div>
                  <div className="text-neutral-300">{user.city || 'N/A'}</div>
                </div>
                
                <div>
                  <div className="text-neutral-400">Status</div>
                  <div className="text-neutral-300">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      user.is_active === true || user.status === 'active'
                        ? 'bg-green-900/50 text-green-300 border border-green-700' 
                        : 'bg-neutral-700/50 text-neutral-300 border border-neutral-600'
                    }`}>
                      {user.is_active === true ? 'active' : user.is_active === false ? 'inactive' : user.status || 'unknown'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="text-neutral-400">Joined</div>
                  <div className="text-neutral-300">{formattedDate.dateString}</div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 border-t border-neutral-700/50 pt-3">
                <button
                  type="button"
                  onClick={() => onViewDetails(user)}
                  className="text-amber-500 hover:text-amber-400 focus:outline-none transition-colors p-1.5 hover:bg-neutral-700 rounded-lg flex items-center text-xs"
                >
                  <FaEye className="h-3.5 w-3.5 mr-1" />
                  <span>View</span>
                </button>
                <button
                  type="button"
                  onClick={() => onEditUser(user)}
                  className="text-blue-500 hover:text-blue-400 focus:outline-none transition-colors p-1.5 hover:bg-neutral-700 rounded-lg flex items-center text-xs"
                >
                  <FaEdit className="h-3.5 w-3.5 mr-1" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteUser(user)}
                  className="text-red-500 hover:text-red-400 focus:outline-none transition-colors p-1.5 hover:bg-neutral-700 rounded-lg flex items-center text-xs"
                >
                  <FaTrash className="h-3.5 w-3.5 mr-1" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
