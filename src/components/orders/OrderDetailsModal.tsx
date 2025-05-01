"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Order } from "@/types/apiResponses";
import { formatCurrency, formatDate, formatDateTime } from "@/utils/format";
import orderService from "@/services/api/orders";

interface OrderDetailsModalProps {
  orderId: string | null;
  onClose: () => void;
}

export default function OrderDetailsModal({ orderId, onClose }: OrderDetailsModalProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const orderData = await orderService.getOrder(orderId);
        if (orderData && 'order' in orderData) {
          setOrder(orderData.order);
        } else if (orderData) {
          setOrder(orderData as Order);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Using centralized formatDateTime function from utils/format.ts

  // Status badge color
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'processing':
        return 'bg-blue-500/20 text-blue-400';
      case 'shipped':
        return 'bg-purple-500/20 text-purple-400';
      case 'delivered':
        return 'bg-green-500/20 text-green-400';
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Handle modal close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!orderId) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-neutral-900 border border-white/10 rounded-md w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            {loading ? 'Loading Order Details...' : order ? `Order #${order.id}` : 'Order Details'}
          </h2>
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : error ? (
            <div className="text-center p-8">
              <p className="text-red-400 mb-4">{error}</p>
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-amber-500 text-black rounded-sm hover:bg-amber-400 transition-colors"
              >
                Close
              </button>
            </div>
          ) : order ? (
            <div>
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-neutral-800/50 p-4 rounded-sm">
                  <h3 className="text-sm font-medium text-white/60 mb-2">Order Date</h3>
                  <p className="text-white">{formatDateTime(order.created_at)}</p>
                </div>
                <div className="bg-neutral-800/50 p-4 rounded-sm">
                  <h3 className="text-sm font-medium text-white/60 mb-2">Status</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="bg-neutral-800/50 p-4 rounded-sm">
                  <h3 className="text-sm font-medium text-white/60 mb-2">Total Amount</h3>
                  <p className="text-amber-500 font-medium">{formatCurrency(parseFloat(order.total_amount))}</p>
                </div>
              </div>

              {/* Order Items */}
              <h3 className="text-lg font-medium text-white mb-4">Order Items</h3>
              <div className="border border-white/10 rounded-sm overflow-hidden mb-8">
                <table className="w-full">
                  <thead className="bg-neutral-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider w-2/5">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider w-1/5">
                        Vendor
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-white/60 uppercase tracking-wider w-1/5">
                        Price
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider w-1/10">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-white/60 uppercase tracking-wider w-1/5">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {order.items.map((item, index) => (
                      <tr key={index} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 mr-3 bg-neutral-800 rounded-sm overflow-hidden">
                              {item.image_url ? (
                                <Image 
                                  src={item.image_url} 
                                  alt={item.product_name}
                                  width={40}
                                  height={40}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-neutral-700">
                                  <span className="text-xs text-white/40">No image</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{item.product_name}</p>
                              <p className="text-xs text-white/60">SKU: {item.product_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-white/70">
                          {item.vendor_name || 'Unknown Vendor'}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-white/70">
                          {formatCurrency(parseFloat(item.unit_price.toString()))}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-white/70">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-amber-500 font-medium">
                          {formatCurrency(parseFloat(item.unit_price.toString()) * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-neutral-800/30">
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-right text-sm font-medium text-white border-t border-white/10">
                        Total
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-amber-500 font-bold border-t border-white/10">
                        {formatCurrency(parseFloat(order.total_amount))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Shipping Address */}
              {order.shipping_address && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-white mb-4">Shipping Address</h3>
                  <div className="bg-neutral-800/50 p-4 rounded-sm">
                    <p className="text-white whitespace-pre-line">{order.shipping_address}</p>
                  </div>
                </div>
              )}

              {/* Payment Information */}
              {order.payment_method && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Payment Information</h3>
                  <div className="bg-neutral-800/50 p-4 rounded-sm">
                    <p className="text-white">Method: {order.payment_method}</p>
                    {order.payment_status && (
                      <p className="text-white/70 mt-2">Status: {order.payment_status}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-white/60">No order information available.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end p-6 border-t border-white/10">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-neutral-700 text-white rounded-sm hover:bg-neutral-600 transition-colors"
          >
            Close
          </button>
          {order && order.status === 'pending' && (
            <button 
              className="ml-3 px-4 py-2 bg-red-500 text-white rounded-sm hover:bg-red-600 transition-colors"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
