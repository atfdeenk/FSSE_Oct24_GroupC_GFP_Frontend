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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  User Details
                </Dialog.Title>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* User avatar and basic info */}
                  <div className="md:w-1/3 flex flex-col items-center">
                    <div className="h-32 w-32 rounded-full overflow-hidden mb-4 border-4 border-amber-100">
                      {user.image_url ? (
                        <img
                          src={user.image_url}
                          alt={`${user.first_name} ${user.last_name}`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + 
                              encodeURIComponent(`${user.first_name || ''} ${user.last_name || ''}`);
                          }}
                        />
                      ) : (
                        <div className="h-full w-full bg-amber-100 flex items-center justify-center text-amber-800 text-3xl font-medium">
                          {user.first_name?.[0]?.toUpperCase() || ''}
                          {user.last_name?.[0]?.toUpperCase() || ''}
                        </div>
                      )}
                    </div>
                    <h4 className="text-xl font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </h4>
                    <p className="text-gray-500 mb-2">@{user.username}</p>
                    <div className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : user.role === 'seller' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center mb-1">
                          <FaEnvelope className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-500">Email</span>
                        </div>
                        <p className="text-gray-900">{user.email}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center mb-1">
                          <FaPhone className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-500">Phone</span>
                        </div>
                        <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex items-center py-2">
                      <div className="flex items-center">
                        <FaUser className="h-5 w-5 text-amber-500 mr-3" />
                        <span className="text-sm text-gray-600">Username</span>
                      </div>
                      <span className="font-semibold text-gray-900 ml-auto">
                        @{user.username}
                      </span>
                    </div>
                    
                    <div className="flex items-center py-2">
                      <div className="flex items-center">
                        <FaTag className="h-5 w-5 text-amber-500 mr-3" />
                        <span className="text-sm text-gray-600">ID</span>
                      </div>
                      <span className="font-semibold text-gray-900 ml-auto">
                        {user.id}
                      </span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center mb-1">
                        <FaMapMarkerAlt className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500">Address</span>
                      </div>
                      <p className="text-gray-900">
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
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center mb-1">
                          <FaCalendarAlt className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-500">Joined</span>
                        </div>
                        <p className="text-gray-900">{dateString}</p>
                        {timeString && <p className="text-gray-500 text-sm">{timeString}</p>}
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center mb-1">
                          <FaTag className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-500">Status</span>
                        </div>
                        <p className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : user.status === 'inactive' 
                              ? 'bg-gray-100 text-gray-800' 
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status || 'active'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
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
