import Link from "next/link";
import React from "react";

interface AuthButtonsProps {
  onClick?: () => void;
  className?: string;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ onClick, className = "" }) => (
  <>
    {/* Desktop buttons */}
    <div className={`hidden md:flex items-center space-x-4 ${className}`.trim()}>
      <Link
        href="/login"
        className="text-white/70 hover:text-amber-400 transition-colors"
        onClick={onClick}
      >
        Sign In
      </Link>
      <Link
        href="/register"
        className="bg-amber-500 text-black px-4 py-2 rounded-sm font-medium hover:bg-amber-400 transition-colors"
        onClick={onClick}
      >
        Sign Up
      </Link>
    </div>
    {/* Mobile dropdown menu (for when showUserMenu is true) is handled in Header, so only desktop here */}
  </>
);

export default AuthButtons;
