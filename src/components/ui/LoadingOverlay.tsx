"use client";
import React from "react";

interface LoadingOverlayProps {
  message?: string;
  visible?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = "Fetching data...", visible = true }) => (
  visible ? (
    <div className="col-span-full flex flex-col items-center justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-4"></div>
      <p className="text-white/60">{message}</p>
    </div>
  ) : null
);

export default LoadingOverlay;
