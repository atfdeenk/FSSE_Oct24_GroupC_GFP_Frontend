"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/utils/format";
import orderService from "@/services/api/orders";
import { Order } from "@/types/apiResponses";
import PaginationControls from "@/components/ui/PaginationControls";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

interface RecentOrdersProps {
  initialOrders?: Order[];
  loading?: boolean;
  limit?: number;
  showPagination?: boolean;
  onViewDetails?: (orderId: string | number) => void;
}

export default function RecentOrders({ initialOrders, loading: initialLoading, limit = 5, showPagination = false, onViewDetails }: RecentOrdersProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders || []);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(initialLoading || !initialOrders);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = limit;

  // Fetch orders from API
  useEffect(() => {
    if (initialOrders) {
      // If orders are provided as props, use them
      setOrders(initialOrders);
      setAllOrders(initialOrders);
      setTotalPages(Math.ceil(initialOrders.length / itemsPerPage));
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const ordersData = await orderService.getOrders();
        setAllOrders(ordersData);

        // Calculate total pages
        const total = Math.ceil(ordersData.length / itemsPerPage);
        setTotalPages(total > 0 ? total : 1);

        // Get current page items
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setOrders(ordersData.slice(startIndex, endIndex));

        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [initialOrders, itemsPerPage, currentPage]);

  // Handle pagination navigation
  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      updateDisplayedOrders(newPage);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      updateDisplayedOrders(newPage);
    }
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
    updateDisplayedOrders(1);
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
    updateDisplayedOrders(totalPages);
  };

  // Update displayed orders based on current page
  const updateDisplayedOrders = (page: number) => {
    if (allOrders.length > 0) {
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setOrders(allOrders.slice(startIndex, endIndex));
    }
  };

  // Using centralized formatDate function from utils/format.ts

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

  // Count items in an order
  const countItems = (order: Order): number => {
    return order.items ? order.items.reduce((total, item) => total + item.quantity, 0) : 0;
  };

  if (loading) {
    return (
      <div className="bg-neutral-900/80 backdrop-blur-sm rounded-sm border border-white/10 p-8">
        <LoadingOverlay message="Loading orders..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-neutral-900/80 backdrop-blur-sm rounded-sm border border-white/10 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Recent Orders</h2>
        </div>
        <div className="flex justify-center items-center py-20 text-red-400">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900/80 backdrop-blur-sm rounded-sm border border-white/10 p-8">

      {orders.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-white/60">You haven't placed any orders yet.</p>
          <Link
            href="/products"
            className="inline-block mt-4 px-4 py-2 bg-amber-500 text-black rounded-sm hover:bg-amber-400 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-800/50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider w-1/6">
                  Order ID
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider w-1/5">
                  Date
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider w-1/6">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider w-1/6">
                  Total
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider w-1/6">
                  Items
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider w-1/6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-center">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70 text-center">
                    {formatDate(order.created_at, 'long')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-500 font-medium text-center">
                    {formatCurrency(parseFloat(order.total_amount))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70 text-center">
                    {countItems(order)} {countItems(order) === 1 ? 'item' : 'items'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    <button
                      onClick={() => onViewDetails ? onViewDetails(order.id) : null}
                      className="text-amber-500 hover:text-amber-400 transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="mt-6">
          <PaginationControls
            page={currentPage}
            totalPages={totalPages}
            totalItems={allOrders.length}
            loading={loading}
            onFirst={handleFirstPage}
            onPrev={handlePrevPage}
            onNext={handleNextPage}
            onLast={handleLastPage}
          />
        </div>
      )}
    </div>
  );
}
