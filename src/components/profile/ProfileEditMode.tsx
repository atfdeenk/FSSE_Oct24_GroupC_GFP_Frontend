"use client";

import { AuthUser } from "@/lib/auth";
import { ChangeEvent } from "react";

interface ProfileEditModeProps {
  user: AuthUser;
  formData: Partial<AuthUser>;
  validationErrors: Record<string, string>;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfileEditMode({
  user,
  formData,
  validationErrors,
  handleInputChange
}: ProfileEditModeProps) {
  // Reusable input field component to follow DRY principles
  const InputField = ({
    label,
    name,
    type = "text",
    value,
    error,
    icon
  }: {
    label: string;
    name: string;
    type?: string;
    value: string;
    error?: string;
    icon?: React.ReactNode;
  }) => (
    <div className="relative">
      <label className="block text-white/70 text-sm mb-1.5 font-medium">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500">
            {icon}
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleInputChange}
          className={`w-full px-4 py-2.5 ${icon ? 'pl-10' : 'pl-4'} bg-white/5 backdrop-blur-sm rounded-lg border ${error ? 'border-red-500' : 'border-white/10'} focus:outline-none focus:border-amber-500 transition-colors duration-200 shadow-sm`}
        />
      </div>
      {error && (
        <p className="text-red-400 text-xs mt-1.5 flex items-center">
          <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );

  return (
    <div className="animate-fadeIn">
      {/* User Identity Banner */}
      <div className="bg-gradient-to-r from-amber-900/20 to-amber-500/10 rounded-xl p-4 border border-amber-500/20 flex items-center mb-8">
        <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mr-4">
          <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <div>
          <h3 className="text-white font-medium flex items-center">
            Editing Profile
            <span className="ml-3 px-3 py-1 bg-gradient-to-r from-amber-500/20 to-amber-400/30 text-amber-400 rounded-full text-xs font-medium inline-flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
              {user?.role === 'seller' ? 'Seller Account' : 'Consumer Account'}
            </span>
          </h3>
          <p className="text-amber-400/80 text-sm">User ID: {user?.id}</p>
        </div>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-white">
        {/* Personal Information */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-amber-500/30 transition-colors duration-300 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-5 flex items-center">
            <svg className="w-5 h-5 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Personal Information
          </h3>

          <div className="space-y-5">
            <InputField
              label="First Name"
              name="first_name"
              value={formData.first_name || ''}
              error={validationErrors.first_name}
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>}
            />

            <InputField
              label="Last Name"
              name="last_name"
              value={formData.last_name || ''}
              error={validationErrors.last_name}
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>}
            />

            <InputField
              label="Email"
              name="email"
              type="email"
              value={formData.email || ''}
              error={validationErrors.email}
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>}
            />

            <InputField
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone || ''}
              error={validationErrors.phone}
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>}
            />
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-amber-500/30 transition-colors duration-300 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-5 flex items-center">
            <svg className="w-5 h-5 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Address Information
          </h3>

          <div className="space-y-5">
            <InputField
              label="Address"
              name="address"
              value={formData.address || ''}
              error={validationErrors.address}
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>}
            />

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="City"
                name="city"
                value={formData.city || ''}
                error={validationErrors.city}
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>}
              />

              <InputField
                label="State"
                name="state"
                value={formData.state || ''}
                error={validationErrors.state}
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Country"
                name="country"
                value={formData.country || ''}
                error={validationErrors.country}
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>}
              />

              <InputField
                label="Zip Code"
                name="zip_code"
                value={formData.zip_code || ''}
                error={validationErrors.zip_code}
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>}
              />
            </div>
          </div>
        </div>
      </form>

      {/* Form Tips */}
      <div className="mt-8 bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-400">Profile Update Tips</h3>
            <div className="mt-2 text-sm text-amber-300/70 space-y-1">
              <p>• All fields marked with an asterisk (*) are required</p>
              <p>• Your email address will be used for account recovery</p>
              <p>• Make sure your address information is accurate for shipping</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
