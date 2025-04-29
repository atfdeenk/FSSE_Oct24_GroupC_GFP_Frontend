import React, { RefObject } from "react";
import Link from "next/link";

interface UserMenuProps {
  user: {
    first_name?: string;
    last_name?: string;
    email?: string;
    role?: string;
  } | null;
  show: boolean;
  onToggle: () => void;
  onLogout: () => void;
  userMenuRef: RefObject<HTMLDivElement | null>;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, show, onToggle, onLogout, userMenuRef }) => (
  <div className="relative" ref={userMenuRef}>
    <button
      className="flex items-center focus:outline-none"
      onClick={onToggle}
      aria-expanded={show}
      aria-haspopup="true"
    >
      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-500/30 bg-neutral-800 flex items-center justify-center">
        {user?.first_name ? (
          <span className="text-amber-500 font-bold">
            {user.first_name.charAt(0)}{user.last_name?.charAt(0)}
          </span>
        ) : (
          <svg className="w-6 h-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )}
      </div>
      <svg className={`w-4 h-4 ml-1 text-white/70 transition-transform ${show ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    {/* Dropdown Menu */}
    {show && (
      <div className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-white/10 rounded-sm shadow-xl z-50 animate-fade-in-down">
        <div className="p-3 border-b border-white/10">
          <p className="text-white font-medium">{user?.first_name} {user?.last_name}</p>
          <p className="text-white/60 text-sm truncate">{user?.email}</p>
        </div>
        <ul>
          <li>
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-white/80 hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
              onClick={onToggle}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/orders"
              className="block px-4 py-2 text-white/80 hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
              onClick={onToggle}
            >
              My Orders
            </Link>
          </li>
          {user?.role === 'seller' && (
            <li>
              <Link
                href="/seller/products"
                className="block px-4 py-2 text-white/80 hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
                onClick={onToggle}
              >
                My Products
              </Link>
            </li>
          )}
          <li>
            <Link
              href="/settings"
              className="block px-4 py-2 text-white/80 hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
              onClick={onToggle}
            >
              Settings
            </Link>
          </li>
          <li className="border-t border-white/10">
            <button
              onClick={onLogout}
              className="block w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Sign Out
            </button>
          </li>
        </ul>
      </div>
    )}
  </div>
);

export default UserMenu;
