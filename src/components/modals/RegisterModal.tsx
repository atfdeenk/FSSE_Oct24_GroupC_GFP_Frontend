"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { RegisterForm } from "@/components";
import { AuthUser } from "@/lib/auth";
import { RegisterFormData } from "@/lib/validations";

interface RegisterModalProps {
  show: boolean;
  onClose: () => void;
  initialRole: 'customer' | 'vendor';
  onRegisterComplete: () => void;
}

export default function RegisterModal({ show, onClose, initialRole, onRegisterComplete }: RegisterModalProps) {
  const [mounted, setMounted] = useState(false);

  // Handle mounting on client side
  useEffect(() => {
    setMounted(true);
    
    // Prevent body scrolling when modal is open
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [show]);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleRegister = (userData: AuthUser) => {
    onRegisterComplete();
  };

  const modalContent = show ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
      <div 
        className="absolute inset-0 bg-transparent" 
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <div className="absolute top-4 right-4">
          <button
            type="button"
            className="text-white/60 hover:text-white transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <RegisterForm 
          onRegister={handleRegister} 
          initialRole={initialRole}
        />
      </div>
    </div>
  ) : null;

  if (!mounted) return null;

  return createPortal(
    modalContent,
    document.getElementById('modal-root') || document.body
  );
}
