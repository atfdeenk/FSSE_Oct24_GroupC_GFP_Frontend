import React from "react";
import { formatCurrency } from "@/utils/format";

interface OrderSummaryProps {
  selectedItemsCount: number;
  totalItemsCount: number;
  subtotal: number;
  discount: number;
  total: number;
  totalCartValue: number;
  promoDiscount: number;
  promoError: string;
  onApplyPromo: () => void;
  promoCode: string;
  setPromoCode: (code: string) => void;
  shippingLabel?: string;
  children?: React.ReactNode; // For extra controls (e.g. checkout button)
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  selectedItemsCount,
  totalItemsCount,
  subtotal,
  discount,
  total,
  totalCartValue,
  promoDiscount,
  promoError,
  onApplyPromo,
  promoCode,
  setPromoCode,
  shippingLabel = "Free",
  children,
}) => {
  return (
    <div className="bg-neutral-900/80 backdrop-blur-sm rounded-sm border border-white/10 sticky top-24 shadow-lg animate-fade-in">
      <div className="p-6 border-b border-white/10 bg-black/30">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Order Summary</h2>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4 mb-6">
          <div className="flex justify-between">
            <span className="text-white/70">Subtotal ({selectedItemsCount} {selectedItemsCount === 1 ? 'item' : 'items'})</span>
            <span className="text-white font-medium">{formatCurrency(subtotal)}</span>
          </div>
          {selectedItemsCount < totalItemsCount && (
            <div className="flex justify-between text-white/50">
              <span>Unselected items</span>
              <span>{formatCurrency(totalCartValue - subtotal)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-white/70">Shipping</span>
            <span className="text-green-400 font-medium">{shippingLabel}</span>
          </div>
          {promoDiscount > 0 && (
            <div className="flex justify-between text-amber-400">
              <span>Promo Discount</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-white text-lg font-semibold">Total</span>
            <span className="text-white text-lg font-bold">{formatCurrency(total)}</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default OrderSummary;
