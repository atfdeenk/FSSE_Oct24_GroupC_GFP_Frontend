"use client";

import { AuthUser } from "@/lib/auth";

interface ProfileViewModeProps {
  user: AuthUser;
}

export default function ProfileViewMode({ user }: ProfileViewModeProps) {
  return (
    <div className="flex flex-col md:flex-row items-center">
      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-amber-500/30 bg-neutral-800 flex items-center justify-center mb-4 md:mb-0 md:mr-8">
        {user?.first_name ? (
          <span className="text-amber-500 font-bold text-3xl">
            {user.first_name.charAt(0)}{user.last_name?.charAt(0)}
          </span>
        ) : (
          <svg className="w-12 h-12 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )}
      </div>

      <div className="text-center md:text-left">
        <h1 className="text-2xl font-bold text-white mb-1">
          {user?.first_name} {user?.last_name}
        </h1>
        <p className="text-white/60 mb-2">{user?.email}</p>
        <div className="flex flex-wrap justify-center md:justify-start gap-2">
          <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium">
            {user?.role === 'seller' ? 'Seller Account' : 'Consumer Account'}
          </span>
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
            Verified
          </span>
        </div>
      </div>

      <div className="ml-auto mt-4 md:mt-0 flex flex-col gap-2">
        <div className="text-white/60 text-sm text-right">Account Details</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-right">
          <span className="text-white/40">Phone:</span>
          <span className="text-white">{user?.phone || 'Not provided'}</span>
          
          <span className="text-white/40">Address:</span>
          <span className="text-white">{user?.address || 'Not provided'}</span>
          
          <span className="text-white/40">Location:</span>
          <span className="text-white">{user?.city}, {user?.state}</span>
          
          <span className="text-white/40">Country:</span>
          <span className="text-white">{user?.country} ({user?.zip_code})</span>
        </div>
      </div>
    </div>
  );
}
