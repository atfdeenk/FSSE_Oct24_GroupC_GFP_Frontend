"use client";

import React, { useState } from "react";
import { z } from "zod";
import { registerSchema, RegisterFormData } from "../lib/validations";
import { registerUser } from "../lib/auth";

interface RegisterFormProps {
  onRegister: (userData: any) => void;
  error?: string;
  initialRole?: 'consumer' | 'seller';
}

export default function RegisterForm({ onRegister, error, initialRole = 'consumer' }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    role: initialRole, // Use the provided initialRole
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

  const validateStep1 = (): boolean => {
    try {
      // Validate email, password, and confirmPassword
      const emailSchema = z.string().email('Please enter a valid email address');
      const passwordSchema = z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number');
      
      // Validate email
      emailSchema.parse(formData.email);
      
      // Validate password
      passwordSchema.parse(formData.password);
      
      // Validate password confirmation
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords don't match");
      }
      
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setValidationErrors(errors);
      } else if (error instanceof Error) {
        setValidationErrors({ confirmPassword: error.message });
      }
      return false;
    }
  };

  const validateStep2 = (): boolean => {
    try {
      // Validate firstName and lastName
      const nameSchema = z.string().min(1, 'This field is required');
      const roleSchema = z.enum(['consumer', 'seller'], {
        errorMap: () => ({ message: 'Please select a valid role' }),
      });
      
      // Validate first name
      nameSchema.parse(formData.firstName);
      
      // Validate last name
      nameSchema.parse(formData.lastName);
      
      // Validate role
      roleSchema.parse(formData.role);
      
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  const handleNextStep = () => {
    if (!validateStep1()) {
      return;
    }
    setFormError(null);
    setStep(2);
  };

  const handlePrevStep = () => {
    setFormError(null);
    setValidationErrors({});
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }

    setLoading(true);
    setFormError(null);

    try {
      // Use the centralized auth service
      const userData = await registerUser(formData);
      onRegister(userData);
    } catch (err: any) {
      setFormError(err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900/80 backdrop-blur-sm p-8 rounded-sm border border-white/10 w-full max-w-md mx-auto">
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
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`border rounded-sm p-4 cursor-pointer flex items-center ${
                    formData.role === 'consumer' 
                      ? 'border-amber-500 bg-amber-500/10' 
                      : 'border-white/10 bg-black/30 hover:bg-black/50'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'consumer' }))}
                >
                  <input 
                    type="radio" 
                    name="role" 
                    value="consumer" 
                    checked={formData.role === 'consumer'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full mr-3 flex items-center justify-center ${
                    formData.role === 'consumer' ? 'bg-amber-500' : 'bg-white/10'
                  }`}>
                    {formData.role === 'consumer' && (
                      <div className="w-2 h-2 rounded-full bg-black"></div>
                    )}
                  </div>
                  <span className="text-white">Coffee Buyer</span>
                </div>
                <div 
                  className={`border rounded-sm p-4 cursor-pointer flex items-center ${
                    formData.role === 'seller' 
                      ? 'border-amber-500 bg-amber-500/10' 
                      : 'border-white/10 bg-black/30 hover:bg-black/50'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'seller' }))}
                >
                  <input 
                    type="radio" 
                    name="role" 
                    value="seller" 
                    checked={formData.role === 'seller'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full mr-3 flex items-center justify-center ${
                    formData.role === 'seller' ? 'bg-amber-500' : 'bg-white/10'
                  }`}>
                    {formData.role === 'seller' && (
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
