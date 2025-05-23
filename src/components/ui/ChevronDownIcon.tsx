import React from "react";

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4 ml-1 text-white/70" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export default ChevronDownIcon;
