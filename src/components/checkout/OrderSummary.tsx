"use client";

import React from 'react';
import { formatCurrency } from '@/utils/format';
import { formatDate } from '@/utils/format';
import { CheckoutOrder } from '@/types';

interface OrderSummaryProps {
  order: CheckoutOrder;
  rawOrderData?: any;
  calculateOrderTotal: (items: any[]) => number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  order,
  rawOrderData,
  calculateOrderTotal
}) => {
  return (
    <div className="bg-neutral-900/80 backdrop-blur-sm rounded-lg border border-white/10 p-6 md:p-8 mb-6">
      <h2 className="text-xl font-bold text-white mb-4">Order Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-white/70 text-sm mb-1">Order Date</h3>
          <p className="text-white font-medium">{order.created_at ? formatDate(order.created_at) : 'N/A'}</p>
        </div>
        
        <div>
          <h3 className="text-white/70 text-sm mb-1">Order Status</h3>
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            <p className="text-white font-medium capitalize">{order.status}</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-white/70 text-sm mb-1">Payment Method</h3>
          <p className="text-white font-medium capitalize">
            {order.payment_method === 'balance' ? 'Wallet Balance' : 'Cash on Delivery'}
          </p>
        </div>
        
        <div>
          <h3 className="text-white/70 text-sm mb-1">Total Amount</h3>
          <p className="text-amber-500 font-medium">
            {formatCurrency(
              order.total || 
              rawOrderData?.total_amount || 
              rawOrderData?.data?.total_amount ||
              calculateOrderTotal(order.items) - (order.discount || 0)
            )}
          </p>
        </div>
      </div>
      
      <div className="border-t border-white/10 pt-6">
        <h3 className="text-white font-medium mb-3">Shipping Address</h3>
        <p className="text-white/70">
          {order.shipping_address?.full_name}<br />
          {order.shipping_address?.address}<br />
          {order.shipping_address?.city}, {order.shipping_address?.postal_code}<br />
          {order.shipping_address?.phone}
        </p>
      </div>
    </div>
  );
};

export default OrderSummary;
