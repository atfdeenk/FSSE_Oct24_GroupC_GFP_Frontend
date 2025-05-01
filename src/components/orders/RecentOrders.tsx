"use client";

import Link from "next/link";
import { formatCurrency } from "@/utils/format";

// Define the Order type for reusability
export interface Order {
  id: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: number;
}

interface RecentOrdersProps {
  orders: Order[];
  loading: boolean;
}

export default function RecentOrders({ orders, loading }: RecentOrdersProps) {
  // Currency formatting is now imported from @/utils/format

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-neutral-900/80 backdrop-blur-sm rounded-sm border border-white/10 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Recent Orders</h2>
        </div>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900/80 backdrop-blur-sm rounded-sm border border-white/10 p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Recent Orders</h2>
        <Link
          href="/orders"
          className="text-amber-500 hover:text-amber-400 transition-colors text-sm"
        >
          View All Orders
        </Link>
      </div>

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
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white/60 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                    {formatDate(order.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-500 font-medium">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                    {order.items} {order.items === 1 ? 'item' : 'items'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-amber-500 hover:text-amber-400 transition-colors"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
