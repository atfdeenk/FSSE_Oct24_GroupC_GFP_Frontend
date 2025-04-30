"use client";
import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number; // ms
}

const toastStyles = {
  base: "fixed z-50 top-20 right-8 px-6 py-3 rounded shadow-lg text-base font-medium flex items-center space-x-2 transition-all animate-fade-in sm:right-8 right-2",
  success: "bg-green-600 text-white border border-green-400",
  error: "bg-red-700 text-white border border-red-400",
  info: "bg-neutral-800 text-white border border-white/20",
};

const Toast: React.FC<ToastProps> = ({ message, type = "info", onClose, duration = 3000 }) => {
  const [progress, setProgress] = React.useState(100);
  React.useEffect(() => {
    setProgress(100);
    // Use a timeout to set progress to 0 after mount, triggering the transition
    const timeout = setTimeout(() => setProgress(0), 50); // allow mount first
    return () => clearTimeout(timeout);
  }, [duration, message]);

  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  // Color map for progress bar
  const barColor = "bg-white";

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
      {/* Progress Bar */}
      <div className="absolute left-0 bottom-0 w-full h-1 bg-white/10 rounded-b overflow-hidden">
        <div
          className={`h-full ${barColor} origin-right rounded-full`}
          style={{
            transform: `scaleX(${progress / 100})`,
            transition: `transform ${duration}ms linear`,
          }}
        />
      </div>
    </div>
  );
};

export default Toast;
