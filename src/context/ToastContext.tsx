"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { ToastStack } from "@/components/ui/Toast";
import { v4 as uuidv4 } from 'uuid';

type ToastType = "success" | "error" | "info";
interface Toast {
  key: string | number;
  message: string;
  type: ToastType;
  duration?: number;
}
interface ToastContextProps {
  showToast: (toast: Omit<Toast, "key">) => void;
  closeToast: (key: string | number) => void;
  toasts: Toast[];
}
interface ToastContextValue {
  toasts: Toast[];
  closeToast: (key: string | number) => void;
}
const ToastContext = createContext<ToastContextProps | undefined>(undefined);
const ToastContextValue = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  React.useEffect(() => {
    console.log('[ToastProvider] MOUNT');
    return () => console.log('[ToastProvider] UNMOUNT');
  }, []);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const MAX_TOASTS = 3;
  const showToast = (toast: Omit<Toast, "key">) => {
    // Always replace with only the newest toast
    const next = [{ ...toast, key: uuidv4() }];
    console.log('[ToastProvider] showToast, next toasts:', next);
    setToasts(next);
  };


  const closeToast = (key: string | number) => {
    setToasts((prev) => {
      const next = prev.filter((t) => t.key !== key);
      console.log('[ToastProvider] closeToast, next toasts:', next);
      return next;
    });
  };

  return (
    <ToastContext.Provider value={{ showToast, closeToast, toasts }}>
      <ToastContextValue.Provider value={{ toasts, closeToast }}>
        {children}
        <ToastStack
          toasts={toasts}
          onClose={closeToast}
        />
      </ToastContextValue.Provider>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

export const useToastContext = () => {
  const ctx = useContext(ToastContextValue);
  if (!ctx) throw new Error("useToastContext must be used within ToastProvider");
  return ctx;
};
