"use client";
import React from "react";

const LoadingOverlay: React.FC<{ message?: string }> = ({ message = "Fetching data..." }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-20">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-4"></div>
    <p className="text-white/60">{message}</p>
  </div>
);

export default LoadingOverlay;
