import Link from "next/link";
import React from "react";
import Badge from "@/components/ui/Badge";
import HeartIcon from "@/components/ui/HeartIcon";

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
    <HeartIcon className="w-6 h-6 text-white" />
    {isLoggedIn && count > 0 && (
      <Badge count={count} />
    )}
  </Link>
);

export default WishlistWidget;
