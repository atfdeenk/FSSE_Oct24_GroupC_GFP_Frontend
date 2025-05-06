"use client";

import React from 'react';

interface OrderConfirmationHeaderProps {
  orderId: string | number;
}

const OrderConfirmationHeader: React.FC<OrderConfirmationHeaderProps> = ({
  orderId
}) => {
  return (
    <div className="bg-neutral-900/80 backdrop-blur-sm rounded-lg border border-white/10 p-6 md:p-8 text-center mb-8">
      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">Order Confirmed!</h1>
      <p className="text-white/70 mb-6">Thank you for your purchase. Your order has been received and is being processed.</p>
      
      <div className="inline-block bg-black/30 rounded-md px-4 py-2 mb-6">
        <p className="text-white/70 text-sm">Order ID</p>
        <p className="text-amber-500 font-mono font-medium">{orderId}</p>
      </div>
    </div>
  );
};

export default OrderConfirmationHeader;
