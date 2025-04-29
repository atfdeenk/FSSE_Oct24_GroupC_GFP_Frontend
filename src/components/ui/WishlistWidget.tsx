import Link from "next/link";
import React from "react";

interface WishlistWidgetProps {
  count: number;
  isLoggedIn: boolean;
}

const WishlistWidget: React.FC<WishlistWidgetProps> = ({ count, isLoggedIn }) => (
  <Link
    href="/wishlist"
    className="relative flex items-center"
    aria-label="Wishlist"
  >
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
</svg>
    {isLoggedIn && count > 0 && (
      <span className="absolute -top-2 -right-2 bg-amber-500 text-black text-xs font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center animate-pulse">
  {count > 99 ? '99+' : count}
</span>
    )}
  </Link>
);

export default WishlistWidget;
