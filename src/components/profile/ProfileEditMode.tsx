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
    error 
  }: { 
    label: string; 
    name: string; 
    type?: string; 
    value: string; 
    error?: string 
  }) => (
    <div>
      <label className="block text-white/60 text-sm mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleInputChange}
        className={`w-full px-3 py-2 bg-neutral-800/50 rounded-sm border ${error ? 'border-red-500' : 'border-white/10'} focus:outline-none focus:border-amber-500`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Avatar and Role Section */}
      <div className="md:col-span-2 flex flex-col md:flex-row items-center mb-6">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-amber-500/30 bg-neutral-800 flex items-center justify-center mb-4 md:mb-0 md:mr-8">
          {formData.first_name ? (
            <span className="text-amber-500 font-bold text-3xl">
              {formData.first_name.charAt(0)}{formData.last_name?.charAt(0)}
            </span>
          ) : (
            <svg className="w-12 h-12 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </div>
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium">
              {user?.role === 'seller' ? 'Seller Account' : 'Consumer Account'}
            </span>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
              Verified
            </span>
          </div>
          <div className="text-white/60 text-sm">User ID: {user?.id}</div>
        </div>
      </div>

      {/* Personal Information */}
      <div>
        <h3 className="text-amber-500 text-sm font-semibold uppercase tracking-wider mb-4">Personal Information</h3>
        
        <div className="space-y-4">
          <InputField 
            label="First Name" 
            name="first_name" 
            value={formData.first_name || ''} 
            error={validationErrors.first_name} 
          />
          
          <InputField 
            label="Last Name" 
            name="last_name" 
            value={formData.last_name || ''} 
            error={validationErrors.last_name} 
          />
          
          <InputField 
            label="Email" 
            name="email" 
            type="email" 
            value={formData.email || ''} 
            error={validationErrors.email} 
          />
          
          <InputField 
            label="Phone" 
            name="phone" 
            type="tel" 
            value={formData.phone || ''} 
            error={validationErrors.phone} 
          />
        </div>
      </div>
      
      {/* Address Information */}
      <div>
        <h3 className="text-amber-500 text-sm font-semibold uppercase tracking-wider mb-4">Address Information</h3>
        
        <div className="space-y-4">
          <InputField 
            label="Address" 
            name="address" 
            value={formData.address || ''} 
            error={validationErrors.address} 
          />
          
          <div className="grid grid-cols-2 gap-4">
            <InputField 
              label="City" 
              name="city" 
              value={formData.city || ''} 
              error={validationErrors.city} 
            />
            
            <InputField 
              label="State" 
              name="state" 
              value={formData.state || ''} 
              error={validationErrors.state} 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <InputField 
              label="Country" 
              name="country" 
              value={formData.country || ''} 
              error={validationErrors.country} 
            />
            
            <InputField 
              label="Zip Code" 
              name="zip_code" 
              value={formData.zip_code || ''} 
              error={validationErrors.zip_code} 
            />
          </div>
        </div>
      </div>
    </form>
  );
}
