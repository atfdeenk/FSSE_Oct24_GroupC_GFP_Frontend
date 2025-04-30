"use client";
import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number; // ms
  toastKey: string | number;
  onRequestClose: (key: string | number) => void;
}

const toastStyles = {
  base: "relative z-50 px-2 py-3 rounded shadow-lg text-base font-medium flex items-center space-x-2 transition-all animate-fade-in w-auto rounded-l-lg",
  success: "bg-green-600 text-white border border-green-400",
  error: "bg-red-700 text-white border border-red-400",
  info: "bg-neutral-800 text-white border border-white/20",
};

const Toast: React.FC<ToastProps> = ({ message, type = "info", duration = 3000, toastKey, onRequestClose }) => {
  // DIAGNOSTIC LOGGING
  React.useEffect(() => {
    console.log(`[Toast] MOUNT key=${toastKey}, message="${message}"`);
    return () => {
      console.log(`[Toast] UNMOUNT key=${toastKey}, message="${message}"`);
    };
  }, [toastKey, message]);
  const [progress, setProgress] = React.useState(100);
  React.useEffect(() => {
    setProgress(100);
    // Use a timeout to set progress to 0 after mount, triggering the transition
    const timeout = setTimeout(() => setProgress(0), 50); // allow mount first
    return () => clearTimeout(timeout);
  }, [duration, message]);

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log(`[Toast] onRequestClose called for key=${toastKey}, message="${message}"`);
      onRequestClose(toastKey);
    }, duration);
    return () => clearTimeout(timer);
  }, [onRequestClose, toastKey, duration]);

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
  toasts: Array<Omit<ToastProps, 'onRequestClose' | 'toastKey'> & { key: string | number }>;
  onClose: (key: string | number) => void;
}

export const ToastStack: React.FC<ToastStackProps> = React.memo(({ toasts, onClose }) => {
  React.useEffect(() => {
    console.log('[ToastStack] MOUNT');
    return () => console.log('[ToastStack] UNMOUNT');
  }, []);
  // Only render the latest toast if present
  const latestToast = toasts.length > 0 ? toasts[toasts.length - 1] : null;
  return (
    <div className="fixed top-20 right-8 z-50 flex flex-col gap-3 items-end">
      {latestToast && (
        <Toast
          key={latestToast.key}
          message={latestToast.message}
          type={latestToast.type}
          duration={latestToast.duration}
          toastKey={latestToast.key}
          onRequestClose={onClose}
        />
      )}
    </div>
  );
});
