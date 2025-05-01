"use client";

import { useState, FormEvent } from "react";
import { AuthUser } from "@/lib/auth";
import { showError } from "@/utils/toast";
import { ProfileViewMode, ProfileEditMode } from "@/components/profile";

interface ProfileCardProps {
  user: AuthUser | null;
  onProfileUpdate?: (updatedUser: AuthUser) => void;
}

export default function ProfileCard({ user, onProfileUpdate }: ProfileCardProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<AuthUser>>(user || {});
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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
      
      // Just close edit mode, let parent component handle success notification
      setIsEditMode(false);
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

  if (!user) return null;

  return (
    <div className="bg-neutral-900/80 backdrop-blur-sm rounded-sm border border-white/10 p-8 mb-8">
      {/* Edit/Save/Cancel Buttons */}
      <div className="flex justify-end mb-6">
        {isEditMode ? (
          <div className="flex gap-2">
            <button
              onClick={toggleEditMode}
              className="px-3 py-1.5 text-sm bg-neutral-700 text-white rounded-sm hover:bg-neutral-600 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-3 py-1.5 text-sm bg-amber-500 text-white rounded-sm hover:bg-amber-400 transition-colors flex items-center gap-1"
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
            className="inline-flex items-center px-4 py-2 border border-white/20 rounded-sm text-white hover:bg-white/5 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </button>
        )}
      </div>

      {isEditMode ? (
        <ProfileEditMode
          formData={formData}
          validationErrors={validationErrors}
          handleInputChange={handleInputChange}
          user={user}
        />
      ) : (
        <ProfileViewMode user={user} />
      )}
    </div>
  );
}
