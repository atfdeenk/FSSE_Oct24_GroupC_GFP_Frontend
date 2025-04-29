import React from "react";

interface EmptyStateProps {
  message: string;
  children?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, children }) => (
  <div className="text-center py-16 bg-neutral-900/80 backdrop-blur-sm rounded-sm border border-white/10 shadow-lg transform transition-all duration-300 hover:border-amber-500/30">
    <div className="animate-fade-in-down">
      {children}
      <h2 className="text-2xl font-bold text-white mb-3">{message}</h2>
    </div>
  </div>
);

export default EmptyState;
