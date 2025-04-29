import React from "react";

const LoadingIndicator: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex items-center justify-center min-h-screen ${className}`}>
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
  </div>
);

export default LoadingIndicator;
