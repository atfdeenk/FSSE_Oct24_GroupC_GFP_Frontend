"use client";

import React, { useState } from "react";
import { ERROR_FIRST_NAME_REQUIRED, ERROR_LAST_NAME_REQUIRED, ERROR_REGISTRATION_FAILED } from '@/constants';
import authService, { RegisterData } from "@/services/api/auth";
import { BackToHomeButton } from "../index";

interface RegisterFormProps {
  onRegister: (userData: any) => void;
  error?: string;
  initialRole?: 'customer' | 'vendor';
}

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'vendor';
}

export default function RegisterForm({ onRegister, error, initialRole = 'customer' }: RegisterFormProps) {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    role: 'customer', // Default to customer role
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: Account, 2: Personal Info
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNextStep = () => {
    // Simple validation
    const errors: Record<string, string> = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setFormError(null);
    setValidationErrors({});
    setStep(2);
  };

  const handlePrevStep = () => {
    setFormError(null);
    setValidationErrors({});
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation for step 2
    const errors: Record<string, string> = {};
    
    if (!formData.firstName) {
      errors.firstName = ERROR_FIRST_NAME_REQUIRED;
    }
    
    if (!formData.lastName) {
      errors.lastName = ERROR_LAST_NAME_REQUIRED;
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setLoading(true);
    setFormError(null);
    
    try {
      // Prepare data for API in the format expected by the backend
      const apiUserData: RegisterData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.role
      };
      
      // Call the auth service to register the user
      const response = await authService.register(apiUserData);
      
      // After successful registration, automatically log in the user
      if (response.success) {
        const loginResponse = await authService.login({
          email: formData.email,
          password: formData.password
        });
        
        // Pass the user data to the parent component
        onRegister(loginResponse.data);
      }
    } catch (err: any) {
      // Handle registration errors
      if (err?.response?.data?.message) {
        setFormError(err.response.data.message);
      } else if (err?.message) {
        setFormError(err.message);
      } else {
        setFormError(ERROR_REGISTRATION_FAILED);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-neutral-900/80 backdrop-blur-sm p-8 rounded-sm border border-white/10 w-full max-w-md mx-auto">
      <BackToHomeButton className="absolute left-4 top-4" />
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-white/60">Join our community of coffee enthusiasts</p>
      </div>

      {(formError || error) && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-sm mb-6 text-center">
          {formError || error}
        </div>
      )}

      <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNextStep(); } : handleSubmit}>
        {step === 1 ? (
          // Step 1: Account Information
          <>
            <div className="mb-6">
              <label className="block text-white/80 text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  className={`bg-black/50 border ${validationErrors.email ? 'border-red-500' : 'border-white/10'} rounded-sm pl-10 pr-3 py-3 w-full text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50`}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-red-400 text-sm">{validationErrors.email}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-white/80 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className={`bg-black/50 border ${validationErrors.password ? 'border-red-500' : 'border-white/10'} rounded-sm pl-10 pr-12 py-3 w-full text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50`}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-500/70 hover:text-amber-500 transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-red-400 text-sm">{validationErrors.password}</p>
              )}
              <p className="text-white/40 text-xs mt-1">Must be at least 8 characters</p>
            </div>

            <div className="mb-8">
              <label className="block text-white/80 text-sm font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  className={`bg-black/50 border ${validationErrors.confirmPassword ? 'border-red-500' : 'border-white/10'} rounded-sm pl-10 pr-3 py-3 w-full text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                />
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-red-400 text-sm">{validationErrors.confirmPassword}</p>
              )}
            </div>
          </>
        ) : (
          // Step 2: Personal Information
          <>
            <div className="mb-6">
              <label className="block text-white/80 text-sm font-medium mb-2">First Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="firstName"
                  className={`bg-black/50 border ${validationErrors.firstName ? 'border-red-500' : 'border-white/10'} rounded-sm pl-10 pr-3 py-3 w-full text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50`}
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="John"
                />
              </div>
              {validationErrors.firstName && (
                <p className="mt-1 text-red-400 text-sm">{validationErrors.firstName}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-white/80 text-sm font-medium mb-2">Last Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="lastName"
                  className={`bg-black/50 border ${validationErrors.lastName ? 'border-red-500' : 'border-white/10'} rounded-sm pl-10 pr-3 py-3 w-full text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50`}
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Doe"
                />
              </div>
              {validationErrors.lastName && (
                <p className="mt-1 text-red-400 text-sm">{validationErrors.lastName}</p>
              )}
            </div>



            <div className="mb-8">
              <label className="block text-white/80 text-sm font-medium mb-2">I am a</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div
                  className={`border rounded-sm p-4 cursor-pointer flex items-center ${formData.role === 'customer'
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-white/10 bg-black/30 hover:bg-black/50'
                    }`}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'customer' }))}
                >
                  <input
                    type="radio"
                    name="role"
                    value="customer"
                    checked={formData.role === 'customer'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full mr-3 flex items-center justify-center ${formData.role === 'customer' ? 'bg-amber-500' : 'bg-white/10'
                    }`}>
                    {formData.role === 'customer' && (
                      <div className="w-2 h-2 rounded-full bg-black"></div>
                    )}
                  </div>
                  <span className="text-white">Coffee Buyer</span>
                </div>
                <div
                  className={`border rounded-sm p-4 cursor-pointer flex items-center ${formData.role === 'vendor'
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-white/10 bg-black/30 hover:bg-black/50'
                    }`}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'vendor' }))}
                >
                  <input
                    type="radio"
                    name="role"
                    value="vendor"
                    checked={formData.role === 'vendor'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full mr-3 flex items-center justify-center ${formData.role === 'vendor' ? 'bg-amber-500' : 'bg-white/10'
                    }`}>
                    {formData.role === 'vendor' && (
                      <div className="w-2 h-2 rounded-full bg-black"></div>
                    )}
                  </div>
                  <span className="text-white">Coffee Seller</span>
                </div>

              </div>
              {validationErrors.role && (
                <p className="mt-1 text-red-400 text-sm">{validationErrors.role}</p>
              )}
            </div>
          </>
        )}

        <div className={`flex ${step === 1 ? 'justify-end' : 'justify-between'} mt-8`}>
          {step === 2 && (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-6 py-3 border border-white/10 rounded-sm text-white font-medium hover:bg-white/5 transition-colors"
            >
              Back
            </button>
          )}

          <button
            type={step === 1 ? "button" : "submit"}
            onClick={step === 1 ? handleNextStep : undefined}
            className="bg-amber-500 text-black px-6 py-3 rounded-sm font-bold hover:bg-amber-400 transition-colors flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </>
            ) : (
              step === 1 ? "Continue" : "Create Account"
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-white/60 text-sm">
          Already have an account? <a href="/login" className="text-amber-500 hover:text-amber-400 transition-colors">Sign in</a>
        </p>
      </div>
    </div>
  );
}
