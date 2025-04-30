"use client";
import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number; // ms
}

const toastStyles = {
  base: "relative z-50 px-2 py-3 rounded shadow-lg text-base font-medium flex items-center space-x-2 transition-all animate-fade-in w-auto rounded-l-lg",
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
    <div className={`${toastStyles.base} ${toastStyles[type]} w-auto rounded-l-lg`}
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

// ToastStack: Accepts an array of toasts and stacks them vertically
interface ToastStackProps {
  toasts: Array<ToastProps & { key: string | number }>;
  onClose: (key: string | number) => void;
}

export const ToastStack: React.FC<ToastStackProps> = ({ toasts, onClose }) => (
  <div className="fixed top-20 right-8 z-50 flex flex-col gap-3 items-end">
    {toasts.map((toast) => (
      <Toast
        key={toast.key}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        onClose={() => onClose(toast.key)}
      />
    ))}
  </div>
);
