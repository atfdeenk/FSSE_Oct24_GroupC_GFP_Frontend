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
  hasVoucherDiscount?: boolean;
  voucherDiscount?: number;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  selected,
  loading,
  onSelect,
  onUpdateQuantity,
  onRemove,
  hasVoucherDiscount = false,
  voucherDiscount = 0,
}) => {
  return (
    <div
      className={`group p-4 bg-neutral-900/80 backdrop-blur-sm rounded-md border overflow-hidden shadow-lg transition-all duration-300 ${selected ? "border-amber-500/50 bg-amber-900/10" : "border-white/10 hover:border-amber-500/20"} mb-3 last:mb-0 animate-fade-in`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 w-full">
        {/* Checkbox and Image - Always side by side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <label className="w-6 h-6 relative flex items-center justify-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              className="sr-only"
              checked={selected}
              onChange={() => onSelect(item.id)}
              disabled={loading}
            />
            <div className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-colors ${selected ? "bg-amber-500 border-amber-500" : "border-white/30 bg-black/20"}`}>
              {selected && (
                <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </label>

          <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-16 sm:h-16 bg-neutral-800 rounded-md overflow-hidden flex-shrink-0 border border-white/5">
            <Link href={`/products/${item.product_id}`} className="block w-full h-full">
              <img
                src={getProductImageUrl(item.image_url || "")}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={handleProductImageError}
              />
            </Link>
          </div>
        </div>

        {/* Product Info and Price */}
        <div className="flex-grow flex flex-col gap-3 w-full min-w-0">
          {/* Product details */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 w-full">
            {/* Product name and seller */}
            <div className="flex-grow min-w-0">
              <Link
                href={`/products/${item.product_id}`}
                className="text-white font-medium hover:text-amber-400 transition-colors block mb-1 text-base truncate max-w-full"
              >
                {item.name}
              </Link>
              <div className="text-white/60 text-xs flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500/50 flex-shrink-0"></span>
                <span className="truncate">{item.seller}</span>
              </div>
              
              {/* Mobile price - Only visible on small screens */}
              <div className="mt-1 sm:hidden">
                {(item.discount_percentage || hasVoucherDiscount) ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-white/50 line-through text-xs">
                      {formatCurrency(item.unit_price)}
                    </div>
                    <div className="text-amber-500 font-bold">
                      {formatCurrency(item.unit_price * (100 - Math.max(item.discount_percentage || 0, voucherDiscount)) / 100)} × {item.quantity}
                    </div>
                  </div>
                ) : (
                  <div className="text-amber-500 font-bold">
                    {formatCurrency(item.unit_price)} × {item.quantity}
                  </div>
                )}
              </div>
              
              {/* Mobile discount badges - Only visible on small screens */}
              <div className="flex flex-wrap gap-1 mt-1 sm:hidden">
                {(item.discount_percentage ?? 0) > 0 && (
                  <div className="text-green-400 text-xs bg-green-500/10 px-1.5 py-0.5 rounded-sm">
                    {item.discount_percentage}% off
                  </div>
                )}
                {hasVoucherDiscount && voucherDiscount > 0 && (
                  <div className="text-amber-400 text-xs bg-amber-500/10 px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    <span>{voucherDiscount}% voucher</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Controls and Price */}
            <div className="flex items-center justify-between gap-3 mt-2 sm:mt-0 sm:flex-col sm:items-end sm:gap-2">
              {/* Quantity controls */}
              <div className="flex items-center rounded-md overflow-hidden border border-white/10">
                <button
                  onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center bg-black/50 text-white/70 hover:text-white hover:bg-black/70 transition-colors"
                  disabled={loading}
                  aria-label="Decrease quantity"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>

                <div className="w-10 h-8 flex items-center justify-center bg-black/30 text-white border-x border-white/5 text-sm font-medium">
                  {item.quantity}
                </div>

                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center bg-black/50 text-white/70 hover:text-white hover:bg-black/70 transition-colors"
                  disabled={loading}
                  aria-label="Increase quantity"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {/* Desktop price - Hidden on mobile */}
              <div className="hidden sm:block text-right">
                {(item.discount_percentage || hasVoucherDiscount) ? (
                  <div className="flex flex-col items-end">
                    <div className="text-white/50 line-through text-xs">
                      {formatCurrency(item.unit_price * item.quantity)}
                    </div>
                    <div className="text-amber-500 font-bold whitespace-nowrap">
                      {formatCurrency((item.unit_price * (100 - Math.max(item.discount_percentage || 0, voucherDiscount)) / 100) * item.quantity)}
                    </div>
                    <div className="flex flex-col gap-1 mt-0.5 items-end">
                      {(item.discount_percentage ?? 0) > 0 && (
                        <div className="text-green-400 text-xs bg-green-500/10 px-1.5 py-0.5 rounded-sm whitespace-nowrap">
                          {item.discount_percentage}% off
                        </div>
                      )}
                      {hasVoucherDiscount && voucherDiscount > 0 && (
                        <div className="text-amber-400 text-xs bg-amber-500/10 px-1.5 py-0.5 rounded-sm flex items-center gap-1 whitespace-nowrap">
                          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                          </svg>
                          <span>{voucherDiscount}% voucher</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-amber-500 font-bold whitespace-nowrap">
                    {formatCurrency(item.unit_price * item.quantity)}
                  </div>
                )}
              </div>

              {/* Remove button */}
              <button
                onClick={() => onRemove(item.id)}
                className="text-white/40 hover:text-red-400 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-500/10"
                disabled={loading}
                aria-label="Remove item"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Total Price - Only visible on small screens */}
      <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center sm:hidden">
        <span className="text-white/60 text-xs">Subtotal:</span>
        <span className="text-amber-500 font-bold">
          {hasVoucherDiscount || item.discount_percentage ? 
            formatCurrency((item.unit_price * (100 - Math.max(item.discount_percentage || 0, voucherDiscount)) / 100) * item.quantity) :
            formatCurrency(item.unit_price * item.quantity)
          }
        </span>
      </div>
      
      {/* Voucher badge - show only if there's a voucher discount */}
      {hasVoucherDiscount && voucherDiscount > 0 && (
        <div className="mt-2 bg-amber-500/10 rounded-md px-2 py-1 text-xs flex flex-wrap sm:flex-nowrap items-center justify-between">
          <div className="flex items-center gap-1 text-amber-400">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <span>Seller voucher applied: {voucherDiscount}% off</span>
          </div>
          <span className="text-white/60 whitespace-nowrap">-{formatCurrency((item.unit_price * voucherDiscount / 100) * item.quantity)}</span>
        </div>
      )}
    </div>
  );
};

export default CartItem;
