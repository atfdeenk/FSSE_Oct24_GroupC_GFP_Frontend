"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { ToastStack } from "@/components/ui/Toast";

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
}
const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = (toast: Omit<Toast, "key">) => {
    setToasts((prev) => [
      ...prev,
      { ...toast, key: Date.now() + Math.random() },
    ]);
  };
  const closeToast = (key: string | number) => {
    setToasts((prev) => prev.filter((t) => t.key !== key));
  };
  return (
    <ToastContext.Provider value={{ showToast, closeToast }}>
      {children}
      <ToastStack
        toasts={toasts.map((t) => ({
          ...t,
          onClose: () => closeToast(t.key),
        }))}
        onClose={closeToast}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};
