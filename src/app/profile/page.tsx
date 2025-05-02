"use client";
import React, { useEffect, useState, FormEvent } from "react";
import { UserProfile } from '@/types/apiResponses';
import { authService } from '@/services/api/auth';
import { getCurrentUser, isAuthenticated } from "@/lib/auth";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { toast } from "react-hot-toast";



export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Fetch user profile on component mount
  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      setError("");
      try {
        if (!isAuthenticated()) {
          setError("You must be logged in to view your profile.");
          setLoading(false);
          return;
        }
        const userData = await authService.getProfile();
        if (userData) {
          setUser(userData);
          setFormData(userData); // Initialize form data with user data
        }
      } catch (err: any) {
        console.error('Profile fetch error:', err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

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
      toast.error("Please fix the errors in the form");
      return;
    }
    
    setSaving(true);
    try {
      if (!user?.id) {
        throw new Error("User ID not found");
      }
      
      // Call the auth service to update the profile
      const result = await authService.updateUser(user.id, formData);
      
      if (result.success) {
        // The page will automatically refresh due to the shouldRefreshPage flag in refreshProfile
        toast.success("Profile updated successfully! Page will refresh...");
      } else {
        throw new Error(result.message || "Failed to update profile");
      }
    } catch (err: any) {
      console.error('Profile update error:', err);
      toast.error(err.message || "Failed to update profile");
      setSaving(false); // Only set saving to false on error, as page will refresh on success
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

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <LoadingOverlay message="Loading profile..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-red-400 font-semibold mb-2">{error}</p>
      </div>
    );
  }
  
  if (!user) return null;

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-amber-100/20 via-amber-200/10 to-neutral-900/90 py-16 px-2">
      <div className="w-full max-w-2xl mx-auto rounded-xl shadow-2xl bg-white/90 dark:bg-neutral-900/90 ring-1 ring-amber-100/40 backdrop-blur-md p-0 md:p-8 animate-fade-in">
        {/* Edit/Save/Cancel Buttons */}
        <div className="flex justify-end p-4 md:p-0 mb-4">
          {isEditMode ? (
            <div className="flex gap-2">
              <button 
                onClick={toggleEditMode}
                className="px-3 py-1.5 text-sm bg-neutral-700 text-white rounded-md hover:bg-neutral-600 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                className="px-3 py-1.5 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-400 transition-colors flex items-center gap-1"
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
              className="px-3 py-1.5 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-400 transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>
          )}
        </div>

        {isEditMode ? (
          // Edit Mode - Form
          <form className="p-6 md:p-0">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10">
              <div className="flex flex-col items-center md:items-start">
                <div className="relative">
                  <img
                    src={user.image_url || ("https://ui-avatars.com/api/?name=" + encodeURIComponent(user.first_name + " " + user.last_name) + "&background=amber&color=fff")}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-amber-400 shadow-md bg-neutral-200 dark:bg-neutral-800"
                  />
                  <span className="absolute bottom-0 right-0 bg-amber-500 text-white text-xs px-2 py-1 rounded-full shadow-lg border border-white dark:border-neutral-900">
                    {user.role === "seller" ? "Seller" : "Consumer"}
                  </span>
                </div>
                {/* Image URL input */}
                <div className="mt-4 w-full">
                  <label className="block text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Profile Image URL</label>
                  <input
                    type="text"
                    name="image_url"
                    value={formData.image_url || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white/50 dark:bg-neutral-800/50 rounded-md border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Image URL"
                  />
                </div>
              </div>

              <div className="flex-1 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name fields */}
                  <div>
                    <label className="block text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name || ''}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 bg-white/50 dark:bg-neutral-800/50 rounded-md border ${validationErrors.first_name ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} focus:outline-none focus:ring-2 focus:ring-amber-500`}
                      placeholder="First Name"
                    />
                    {validationErrors.first_name && <p className="text-red-500 text-xs mt-1">{validationErrors.first_name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name || ''}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 bg-white/50 dark:bg-neutral-800/50 rounded-md border ${validationErrors.last_name ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} focus:outline-none focus:ring-2 focus:ring-amber-500`}
                      placeholder="Last Name"
                    />
                    {validationErrors.last_name && <p className="text-red-500 text-xs mt-1">{validationErrors.last_name}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {/* Contact fields */}
                  <div>
                    <label className="block text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 bg-white/50 dark:bg-neutral-800/50 rounded-md border ${validationErrors.email ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} focus:outline-none focus:ring-2 focus:ring-amber-500`}
                      placeholder="Email"
                    />
                    {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 bg-white/50 dark:bg-neutral-800/50 rounded-md border ${validationErrors.phone ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} focus:outline-none focus:ring-2 focus:ring-amber-500`}
                      placeholder="Phone"
                    />
                    {validationErrors.phone && <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>}
                  </div>
                </div>

                {/* Address fields */}
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-white/50 dark:bg-neutral-800/50 rounded-md border ${validationErrors.address ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} focus:outline-none focus:ring-2 focus:ring-amber-500`}
                    placeholder="Address"
                  />
                  {validationErrors.address && <p className="text-red-500 text-xs mt-1">{validationErrors.address}</p>}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city || ''}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 bg-white/50 dark:bg-neutral-800/50 rounded-md border ${validationErrors.city ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} focus:outline-none focus:ring-2 focus:ring-amber-500`}
                      placeholder="City"
                    />
                    {validationErrors.city && <p className="text-red-500 text-xs mt-1">{validationErrors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state || ''}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 bg-white/50 dark:bg-neutral-800/50 rounded-md border ${validationErrors.state ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} focus:outline-none focus:ring-2 focus:ring-amber-500`}
                      placeholder="State"
                    />
                    {validationErrors.state && <p className="text-red-500 text-xs mt-1">{validationErrors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country || ''}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 bg-white/50 dark:bg-neutral-800/50 rounded-md border ${validationErrors.country ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} focus:outline-none focus:ring-2 focus:ring-amber-500`}
                      placeholder="Country"
                    />
                    {validationErrors.country && <p className="text-red-500 text-xs mt-1">{validationErrors.country}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Zip Code</label>
                    <input
                      type="text"
                      name="zip_code"
                      value={formData.zip_code || ''}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 bg-white/50 dark:bg-neutral-800/50 rounded-md border ${validationErrors.zip_code ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} focus:outline-none focus:ring-2 focus:ring-amber-500`}
                      placeholder="Zip Code"
                    />
                    {validationErrors.zip_code && <p className="text-red-500 text-xs mt-1">{validationErrors.zip_code}</p>}
                  </div>
                </div>
              </div>
            </div>
          </form>
        ) : (
          // View Mode
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10 p-6 md:p-0">
            <div className="flex flex-col items-center md:items-start">
              <div className="relative">
                <img
                  src={user.image_url || ("https://ui-avatars.com/api/?name=" + encodeURIComponent(user.first_name + " " + user.last_name) + "&background=amber&color=fff")}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-amber-400 shadow-md bg-neutral-200 dark:bg-neutral-800"
                />
                <span className="absolute bottom-0 right-0 bg-amber-500 text-white text-xs px-2 py-1 rounded-full shadow-lg border border-white dark:border-neutral-900">
                  {user.role === "seller" ? "Seller" : "Consumer"}
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-extrabold text-neutral-800 dark:text-white text-center md:text-left">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-neutral-500 dark:text-neutral-300 text-center md:text-left mb-2">@{user.username}</p>
            </div>
            <div className="flex-1 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Contact Info</span>
                  <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-200">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12A4 4 0 118 12a4 4 0 018 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v2m0 4h.01" /></svg>
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-200">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <span>{user.phone}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Location</span>
                  <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-200">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 21.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span>{user.address}, {user.city}, {user.state}, {user.country}, {user.zip_code}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Role</span>
                  <div className="flex items-center gap-2 mt-1">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 1.656-1.344 3-3 3s-3-1.344-3-3 1.344-3 3-3 3 1.344 3 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15.4A8 8 0 104.6 15.4" /></svg>
                    <span className="ml-2 text-neutral-700 dark:text-neutral-200 font-medium capitalize">{user.role}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">ID</span>
                  <div className="flex items-center gap-2 mt-1">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 5 5-5" /></svg>
                    <span className="ml-2 text-neutral-700 dark:text-neutral-200 font-medium">{user.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
