import Link from "next/link";
import { formatCurrency } from "@/utils/format";
import { getProductImageUrl, handleProductImageError } from "@/utils/imageUtils";
import { CartItemWithDetails } from "@/types/cart";
import React from "react";

interface CartItemProps {
  item: CartItemWithDetails;
  selected: boolean;
  loading: boolean;
  onSelect: (id: string | number) => void;
  onUpdateQuantity: (id: string | number, quantity: number) => void;
  onRemove: (id: string | number) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  selected,
  loading,
  onSelect,
  onUpdateQuantity,
  onRemove,
}) => {
  return (
    <div
      className={`group p-4 bg-neutral-900/80 backdrop-blur-sm rounded-sm border overflow-hidden shadow-lg transition-all duration-300 hover:border-amber-500/20 animate-fade-in ${selected ? "border-amber-500/50" : "border-white/10"}`}
    >
      <div className="flex items-center">
        <label className="mr-4 w-5 h-5 relative flex items-center justify-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only"
            checked={selected}
            onChange={() => onSelect(item.id)}
          />
          <svg
            className={`w-5 h-5 ${selected ? "text-amber-500" : "text-white/40"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </label>

        <div className="w-16 h-16 bg-neutral-800 rounded-sm overflow-hidden mr-4 flex-shrink-0">
          <Link href={`/products/${item.product_id}`} className="block w-full h-full">
            <img
              src={getProductImageUrl(item.image_url || "")}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={handleProductImageError}
            />
          </Link>
        </div>

        <div className="flex-grow mr-4">
          <Link
            href={`/products/${item.product_id}`}
            className="text-white font-medium hover:text-amber-400 transition-colors block mb-1"
          >
            {item.name}
          </Link>
          <div className="text-white/60 text-xs">{item.seller}</div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <button
              onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
              className="w-7 h-7 flex items-center justify-center rounded-l-sm bg-black/50 text-white/70 hover:text-white hover:bg-black/70 transition-colors"
              disabled={loading}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>

            <div className="w-10 h-7 flex items-center justify-center bg-black/30 text-white border-x border-white/5 text-sm">
              {item.quantity}
            </div>

            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-r-sm bg-black/50 text-white/70 hover:text-white hover:bg-black/70 transition-colors"
              disabled={loading}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <div className="text-amber-500 font-bold w-24 text-right">
            {formatCurrency(item.unit_price * item.quantity)}
          </div>

          <button
            onClick={() => onRemove(item.id)}
            className="text-white/40 hover:text-red-400 transition-colors w-8 h-8 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50"
            disabled={loading}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
