"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { AuthUser } from "@/lib/auth";
import { showError } from "@/utils/toast";
import { ProfileViewMode, ProfileEditMode } from "@/components/profile";
import Image from "next/image";

interface ProfileCardProps {
  user: AuthUser | null;
  onProfileUpdate?: (updatedUser: AuthUser) => void;
}

export default function ProfileCard({ user, onProfileUpdate }: ProfileCardProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<AuthUser>>(user || {});
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [avatarHover, setAvatarHover] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Generate avatar URL based on user's name
  const avatarUrl = user ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
    `${user.first_name || ''} ${user.last_name || ''}`
  )}&background=F59E0B&color=fff&size=200&font-size=0.35&rounded=true&bold=true` : '';

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.first_name?.trim()) errors.first_name = "First name is required";
    if (!formData.last_name?.trim()) errors.last_name = "Last name is required";
    if (!formData.email?.trim()) errors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = "Invalid email format";
    if (!formData.phone?.trim()) errors.phone = "Phone is required";
    if (!formData.address?.trim()) errors.address = "Address is required";
    if (!formData.city?.trim()) errors.city = "City is required";
    if (!formData.state?.trim()) errors.state = "State is required";
    if (!formData.country?.trim()) errors.country = "Country is required";
    if (!formData.zip_code?.trim()) errors.zip_code = "Zip code is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError("Please fix the errors in the form");
      // Scroll to the first error field
      const firstErrorField = Object.keys(validationErrors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (errorElement as HTMLElement).focus();
      }
      return;
    }

    setSaving(true);
    try {
      // In a real app, you would call an API to update the profile
      // For now, we'll simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the user in parent component if callback is provided
      if (user && onProfileUpdate) {
        const updatedUser = { ...user, ...formData };
        onProfileUpdate(updatedUser);
      }
      
      // Close edit mode
      setIsEditMode(false);
      
      // Scroll to top of card for better UX
      if (cardRef.current) {
        cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      console.error('Profile update error:', err);
      showError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditMode) {
      // If canceling edit, reset form data to current user data
      setFormData(user || {});
      setValidationErrors({});
    }
    setIsEditMode(!isEditMode);
  };

  // Add scroll to top effect when switching modes
  useEffect(() => {
    if (cardRef.current && !isEditMode) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isEditMode]);

  if (!user) return null;

  return (
    <div 
      ref={cardRef}
      className="bg-neutral-900 rounded-xl overflow-hidden shadow-xl relative mb-8"
    >
      {/* Banner */}
      <div className="h-32 bg-gradient-to-r from-amber-900 via-amber-700 to-amber-500 relative overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-[url('/patterns/pattern-1.png')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/80 via-amber-700/80 to-amber-500/80"></div>
        
        {/* Edit/Save/Cancel Buttons */}
        <div className="absolute top-4 right-4 z-10">
          {isEditMode ? (
            <div className="flex gap-2">
              <button
                onClick={toggleEditMode}
                className="px-3 py-1.5 text-sm bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-all"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-1.5 text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all flex items-center gap-1 font-medium"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : "Save Changes"}
              </button>
            </div>
          ) : (
            <button
              onClick={toggleEditMode}
              className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20 transition-all"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>
          )}
        </div>
      </div>
      
      <div className="relative px-8 pb-8">
        {/* Avatar */}
        <div className="absolute -top-12 left-8">
          <div 
            className="w-24 h-24 rounded-full overflow-hidden border-4 border-neutral-900 bg-neutral-800 flex items-center justify-center"
            onMouseEnter={() => setAvatarHover(true)}
            onMouseLeave={() => setAvatarHover(false)}
          >
            {!user ? (
              <svg className="w-12 h-12 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ) : (
              <Image 
                src={avatarUrl} 
                alt={`${user.first_name} ${user.last_name}`} 
                width={96} 
                height={96}
                className="object-cover"
              />
            )}
            {avatarHover && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            )}
          </div>
        </div>
        
        {/* Content area with proper spacing for avatar */}
        <div className="pt-16">
          {/* View Mode */}
          <div className={`${isEditMode ? 'hidden' : 'block'}`}>
            <ProfileViewMode user={user} />
          </div>
          
          {/* Edit Mode */}
          <div className={`${isEditMode ? 'block' : 'hidden'}`}>
            <ProfileEditMode
              formData={formData}
              validationErrors={validationErrors}
              handleInputChange={handleInputChange}
              user={user}
            />
          </div>
        </div>
      </div>
      
      {/* Decorative bottom border */}
      <div className="h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600"></div>
    </div>
  );
}
