"use client";
import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number; // ms
}

const toastStyles = {
  base: "fixed z-50 left-1/2 -translate-x-1/2 top-6 px-6 py-3 rounded shadow-lg text-base font-medium flex items-center space-x-2 transition-all animate-fade-in",
  success: "bg-green-600 text-white border border-green-400",
  error: "bg-red-700 text-white border border-red-400",
  info: "bg-neutral-800 text-white border border-white/20",
};

const Toast: React.FC<ToastProps> = ({ message, type = "info", onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`${toastStyles.base} ${toastStyles[type]}`}
      role="alert"
      aria-live="assertive"
    >
      {type === "success" && (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      )}
      {type === "error" && (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      )}
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white/80 hover:text-white text-lg">×</button>
    </div>
  );
};

export default Toast;
