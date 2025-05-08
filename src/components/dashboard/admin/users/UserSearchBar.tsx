'use client';

import React from 'react';
import { FaSearch, FaSync } from 'react-icons/fa';

interface UserSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  userCount: number;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export default function UserSearchBar({
  searchTerm,
  onSearchChange,
  userCount,
  onRefresh,
  isRefreshing = false
}: UserSearchBarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="h-4 w-4 text-amber-500" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-neutral-600 rounded-lg leading-5 bg-neutral-800 text-white placeholder-neutral-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm shadow-md"
          placeholder="Search by name, email, username, or city..."
          aria-label="Search users"
        />
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-neutral-400">
          {userCount} {userCount === 1 ? 'user' : 'users'} found
        </span>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center px-4 py-2 border border-amber-600 shadow-md text-sm font-medium rounded-lg text-amber-500 bg-transparent hover:bg-amber-600/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition-colors"
          aria-label="Refresh user list"
        >
          <FaSync className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
    </div>
  );
}
