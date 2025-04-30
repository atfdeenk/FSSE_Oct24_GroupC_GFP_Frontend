import Link from "next/link";
import React from "react";
import Badge from "@/components/ui/Badge";

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
    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="white">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
</svg>
    {isLoggedIn && count > 0 && (
      <Badge count={count} />
    )}
  </Link>
);

export default WishlistWidget;
