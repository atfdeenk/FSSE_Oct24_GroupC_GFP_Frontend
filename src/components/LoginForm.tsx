"use client";

import React, { useState } from "react";
import { z } from "zod";
import { loginSchema, LoginFormData } from "../lib/schemas/auth";
import { authService } from "../services/api/auth";

interface LoginFormProps {
  onLogin: (userData: any) => void;
  error?: string;
}

export default function LoginForm({ onLogin, error }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const validateForm = (): boolean => {
    try {
      loginSchema.parse(formData);
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
        
        // Focus on the first field with an error
        const firstErrorField = error.errors[0]?.path[0] as string;
        if (firstErrorField && document.getElementsByName(firstErrorField)[0]) {
          document.getElementsByName(firstErrorField)[0].focus();
        }
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setFormError(null);
    
    try {
      // Use the Axios-based auth service
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });
      
      // Our auth service now always returns a success property
      if (response.success) {
        onLogin(response.data);
      } else {
        setFormError(response.message || "Login failed. Please check your credentials.");
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle API error responses
      if (err?.response?.data?.msg) {
        setFormError(err.response.data.msg);
      } else if (err?.response?.data?.message) {
        setFormError(err.response.data.message);
      } else if (err?.message) {
        setFormError(err.message);
      } else {
        setFormError("Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-neutral-900/80 backdrop-blur-sm p-8 rounded-sm border border-white/10 w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-white/60">Sign in to your account to continue</p>
      </div>
      
      {(formError || error) && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-sm mb-6 text-center">
          {formError || error}
        </div>
      )}
      
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
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-white/80 text-sm font-medium">Password</label>
          <a href="/forgot-password" className="text-amber-500 text-sm hover:text-amber-400 transition-colors">Forgot Password?</a>
        </div>
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
        <div className="flex items-center mt-2">
          <input 
            type="checkbox" 
            id="remember" 
            className="h-4 w-4 border border-white/10 rounded bg-black/50 text-amber-500 focus:ring-amber-500/50"
          />
          <label htmlFor="remember" className="ml-2 text-sm text-white/60">Remember me</label>
        </div>
      </div>
      
      <button
        type="submit"
        className="bg-amber-500 text-black w-full py-3 rounded-sm font-bold hover:bg-amber-400 transition-colors flex items-center justify-center"
        disabled={loading}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </button>
      
      <div className="mt-6 text-center">
        <p className="text-white/60 text-sm">
          Don't have an account? <a href="/register" className="text-amber-500 hover:text-amber-400 transition-colors">Create one</a>
        </p>
      </div>
    </form>
  );
}
