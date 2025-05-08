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
      return <FaSort className="h-3 w-3 text-gray-400" />;
    }
    return sortConfig.direction === 'ascending' ? (
      <FaSortUp className="h-3 w-3 text-amber-600" />
    ) : (
      <FaSortDown className="h-3 w-3 text-amber-600" />
    );
  };

  const renderSortableHeader = (label: string, key: string) => (
    <th
      scope="col"
      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-50"
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
      <div className="bg-white shadow-sm rounded-lg border border-amber-100 overflow-hidden">
        <div className="p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100">
            <svg 
              className="h-6 w-6 text-amber-600" 
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          
          {searchTerm ? (
            <div className="mt-3">
              <p className="text-sm text-gray-500">
                No users match your search criteria: <span className="font-medium">&quot;{searchTerm}&quot;</span>
              </p>
              <button
                type="button"
                className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                onClick={onClearSearch}
              >
                Clear search
              </button>
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-500">No users have been added to the system yet.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg border border-amber-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              {renderSortableHeader('Name', 'name')}
              {renderSortableHeader('Email', 'email')}
              {renderSortableHeader('Role', 'role')}
              {renderSortableHeader('Location', 'city')}
              {renderSortableHeader('Status', 'status')}
              {renderSortableHeader('Joined', 'joined')}
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {users.map((user) => {
              // Format the created_at timestamp from the API
              let dateString = 'N/A';
              if (user.created_at) {
                const formatted = formatApiTimestamp(user.created_at);
                dateString = formatted.dateString;
              }
              
              return (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img 
                          className="h-10 w-10 rounded-full object-cover" 
                          src={user.image_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.username || '')} 
                          alt="" 
                        />
                      </div>
                      <div className="ml-4">
                        {(user.first_name || user.last_name) ? (
                          <div className="font-medium text-gray-900">
                            {user.first_name || ''} {user.last_name || ''}
                          </div>
                        ) : (
                          <div className="font-medium text-gray-900">{user.username}</div>
                        )}
                        <div className="text-gray-500">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="text-gray-900">{user.email}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : (user.role === 'seller' || user.role === 'vendor')
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {user.city || 'N/A'}
                    {user.country && <div className="text-xs text-gray-400">{user.country}</div>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      user.is_active === true || user.status === 'active'
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.is_active === true ? 'active' : user.is_active === false ? 'inactive' : user.status || 'unknown'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {dateString}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => onViewDetails(user)}
                        className="text-amber-600 hover:text-amber-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      >
                        <FaEye className="h-4 w-4" />
                        <span className="sr-only">View details</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditUser(user)}
                        className="text-blue-600 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FaEdit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteUser(user)}
                        className="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
    </div>
  );
}
