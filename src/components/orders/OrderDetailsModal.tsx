"use client";

import { useState, useEffect, Fragment } from "react";
import Image from "next/image";
import { Order } from "@/types/apiResponses";
import { formatCurrency, formatDate, formatDateTime } from "@/utils/format";
import orderService from "@/services/api/orders";
import { exportOrder } from "@/utils/export";
import { Menu, Transition } from "@headlessui/react";

interface OrderDetailsModalProps {
  orderId: string | null;
  onClose: () => void;
}

type ExportFormat = 'pdf' | 'excel' | 'csv';

export default function OrderDetailsModal({ orderId, onClose }: OrderDetailsModalProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle exporting the order in different formats
  const handleExport = (format: ExportFormat) => {
    if (!order) return;
    
    try {
      exportOrder(order, format);
    } catch (err) {
      console.error('Error exporting order:', err);
      // You could add a toast notification here for error feedback
    }
  };

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
        <div className="flex justify-between p-6 border-t border-white/10">
          <div>
            {order && (order.status === 'delivered' || order.status === 'completed') && (
              <Menu as="div" className="relative inline-block text-left z-50">
                <div>
                  <Menu.Button className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-sm hover:bg-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                    Export Receipt
                    <svg className="w-4 h-4 ml-2 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute left-0 z-50 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none bottom-full mb-2">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${active ? 'bg-amber-500 text-white' : 'text-gray-900'} group flex w-full items-center px-4 py-2 text-sm`}
                            onClick={() => handleExport('pdf')}
                          >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                            </svg>
                            Export as PDF
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${active ? 'bg-amber-500 text-white' : 'text-gray-900'} group flex w-full items-center px-4 py-2 text-sm`}
                            onClick={() => handleExport('excel')}
                          >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            Export as Excel
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${active ? 'bg-amber-500 text-white' : 'text-gray-900'} group flex w-full items-center px-4 py-2 text-sm`}
                            onClick={() => handleExport('csv')}
                          >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                            </svg>
                            Export as CSV
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}
          </div>
          <div>
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
    </div>
  );
}
