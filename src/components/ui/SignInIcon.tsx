import React from "react";

const SignInIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 mr-3 text-white/60" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    {/* Door with arrow (login) icon */}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9V5.25A2.25 2.25 0 0015.75 3h-9A2.25 2.25 0 004.5 5.25v13.5A2.25 2.25 0 006.75 21h9a2.25 2.25 0 002.25-2.25V15" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M22 12H8m0 0l6-4m-6 4l6 4" />
  </svg>
);

export default SignInIcon;
