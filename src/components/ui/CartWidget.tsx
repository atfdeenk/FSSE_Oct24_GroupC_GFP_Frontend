import Link from "next/link";
import React from "react";
import Badge from "@/components/ui/Badge";
import CartIcon from "@/components/ui/CartIcon";

interface CartWidgetProps {
  count: number;
  isLoggedIn: boolean;
}

const CartWidget: React.FC<CartWidgetProps> = ({ count, isLoggedIn }) => (
  <Link
    href="/cart"
    className="relative flex items-center mr-6"
    aria-label="Shopping cart"
  >
    <CartIcon className="w-6 h-6 text-white" />
    {isLoggedIn && count > 0 && (
      <Badge count={count} />
    )}
  </Link>
);

export default CartWidget;
