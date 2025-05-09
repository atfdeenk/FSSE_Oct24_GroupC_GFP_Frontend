"use client";

import { AuthUser } from "@/lib/auth";

interface ProfileViewModeProps {
  user: AuthUser;
}

export default function ProfileViewMode({ user }: ProfileViewModeProps) {
  return (
    <div className="animate-fadeIn">
      {/* User Name and Basic Info */}
      <div className="mb-8">
        <div className="flex flex-col space-y-2 sm:space-y-0 mb-2">
          <h1 className="text-2xl font-bold text-white flex items-center flex-wrap">
            <span className="mr-2">{user?.first_name} {user?.last_name}</span>
          </h1>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-amber-400/30 text-amber-400 rounded-full text-xs font-medium inline-flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
              {user?.role === 'seller' ? 'Seller Account' : 'Consumer Account'}
            </span>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium inline-flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
              Verified
            </span>
          </div>
        </div>
        <p className="text-white/60 flex items-center mt-2 break-all">
          <svg className="w-4 h-4 mr-2 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="break-all">{user?.email}</span>
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
        {/* Contact Information */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-amber-500/30 transition-colors duration-300 shadow-lg hover:shadow-amber-500/5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Contact Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div className="min-w-0">
                <p className="text-white/40 text-sm">Phone</p>
                <p className="text-white break-all">{user?.phone || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div className="min-w-0">
                <p className="text-white/40 text-sm">Email</p>
                <p className="text-white break-all">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-amber-500/30 transition-colors duration-300 shadow-lg hover:shadow-amber-500/5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Location Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <div className="min-w-0">
                <p className="text-white/40 text-sm">Address</p>
                <p className="text-white break-words">{user?.address || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
              </svg>
              <div className="min-w-0">
                <p className="text-white/40 text-sm">City/State</p>
                <p className="text-white break-words">{user?.city}, {user?.state}</p>
              </div>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="min-w-0">
                <p className="text-white/40 text-sm">Country/Zip</p>
                <p className="text-white break-words">{user?.country} ({user?.zip_code})</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
