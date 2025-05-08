'use client';

import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaWallet, FaTag } from 'react-icons/fa';
import { UserProfile } from '@/types/apiResponses';
import { formatApiTimestamp } from '@/utils/date';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
}

export default function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  if (!user) return null;

  // Format the created_at timestamp from the API
  const { dateString, timeString } = user.created_at ? 
    formatApiTimestamp(user.created_at) : 
    { dateString: 'N/A', timeString: '' };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-neutral-800 p-6 text-left align-middle shadow-xl transition-all border border-neutral-700">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-white mb-4 flex items-center"
                >
                  <FaUser className="mr-2 text-amber-500" /> User Details
                </Dialog.Title>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* User avatar and basic info */}
                  <div className="md:w-1/3 flex flex-col items-center">
                    <div className="h-32 w-32 rounded-full overflow-hidden mb-4 border-4 border-amber-600/30 shadow-lg">
                      {user.image_url ? (
                        <img
                          src={user.image_url}
                          alt={`${user.first_name} ${user.last_name}`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(`${user.first_name || ''} ${user.last_name || ''}`)}&background=D97706&color=ffffff`;
                          }}
                        />
                      ) : (
                        <div className="h-full w-full bg-amber-600/30 flex items-center justify-center text-amber-400 text-3xl font-medium">
                          {user.first_name?.[0]?.toUpperCase() || ''}
                          {user.last_name?.[0]?.toUpperCase() || ''}
                        </div>
                      )}
                    </div>
                    <h4 className="text-xl font-medium text-white">
                      {user.first_name} {user.last_name}
                    </h4>
                    <p className="text-neutral-400 mb-2">@{user.username}</p>
                    <div className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                      user.role === 'admin' 
                        ? 'bg-purple-900/50 text-purple-300 border border-purple-700' 
                        : user.role === 'seller' || user.role === 'vendor'
                          ? 'bg-blue-900/50 text-blue-300 border border-blue-700' 
                          : 'bg-green-900/50 text-green-300 border border-green-700'
                    }`}>
                      {user.role}
                    </div>
                    
                    <div className="mt-4 w-full">
                      <div className="bg-amber-50 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <FaWallet className="text-amber-600 mr-2" />
                          <span className="text-sm text-gray-600">Balance</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          Rp {(user.balance || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* User details */}
                  <div className="md:w-2/3 space-y-4">
                    <div className="flex items-center py-2 border-b border-neutral-700">
                      <div className="flex items-center">
                        <FaEnvelope className="h-5 w-5 text-amber-500 mr-3" />
                        <span className="text-sm text-neutral-400">Email</span>
                      </div>
                      <span className="font-semibold text-white ml-auto">
                        {user.email}
                      </span>
                    </div>

                    <div className="flex items-center py-2 border-b border-neutral-700">
                      <div className="flex items-center">
                        <FaPhone className="h-5 w-5 text-amber-500 mr-3" />
                        <span className="text-sm text-neutral-400">Phone</span>
                      </div>
                      <span className="font-semibold text-white ml-auto">
                        {user.phone || 'Not provided'}
                      </span>
                    </div>

                    <div className="flex items-center py-2">
                      <div className="flex items-center">
                        <FaUser className="h-5 w-5 text-amber-500 mr-3" />
                        <span className="text-sm text-neutral-400">Username</span>
                      </div>
                      <span className="font-semibold text-white ml-auto">
                        @{user.username}
                      </span>
                    </div>
                    
                    <div className="flex items-center py-2">
                      <div className="flex items-center">
                        <FaTag className="h-5 w-5 text-amber-500 mr-3" />
                        <span className="text-sm text-neutral-400">ID</span>
                      </div>
                      <span className="font-semibold text-white ml-auto">
                        {user.id}
                      </span>
                    </div>

                    <div className="bg-neutral-700/50 p-4 rounded-lg border border-neutral-600">
                      <div className="flex items-center mb-2">
                        <FaMapMarkerAlt className="text-amber-500 mr-2" />
                        <span className="text-sm text-neutral-300">Address</span>
                      </div>
                      <p className="text-white">
                        {user.address ? (
                          <>
                            {user.address}
                            {user.city && `, ${user.city}`}
                            {user.state && `, ${user.state}`}
                            {user.zip_code && ` ${user.zip_code}`}
                            {user.country && `, ${user.country}`}
                          </>
                        ) : (
                          'No address provided'
                        )}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-neutral-700/50 p-4 rounded-lg border border-neutral-600">
                        <div className="flex items-center mb-2">
                          <FaCalendarAlt className="text-amber-500 mr-2" />
                          <span className="text-sm text-neutral-300">Joined</span>
                        </div>
                        <p className="text-white">{dateString}</p>
                        {timeString && <p className="text-neutral-400 text-sm">{timeString}</p>}
                      </div>
                      
                      <div className="bg-neutral-700/50 p-4 rounded-lg border border-neutral-600">
                        <div className="flex items-center mb-2">
                          <FaTag className="text-amber-500 mr-2" />
                          <span className="text-sm text-neutral-300">Status</span>
                        </div>
                        <p className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          user.status === 'active' || user.is_active === true
                            ? 'bg-green-900/50 text-green-300 border border-green-700' 
                            : user.status === 'inactive' || user.is_active === false
                              ? 'bg-neutral-700/50 text-neutral-300 border border-neutral-600' 
                              : 'bg-red-900/50 text-red-300 border border-red-700'
                        }`}>
                          {user.status || (user.is_active ? 'active' : 'inactive')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-lg border border-amber-600 bg-transparent px-4 py-2 text-sm font-medium text-amber-500 hover:bg-amber-600/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 transition-colors shadow-md"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
