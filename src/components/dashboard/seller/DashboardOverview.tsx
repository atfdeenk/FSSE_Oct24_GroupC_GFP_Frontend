"use client";

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/utils/format';
import { AuthUser } from '@/lib/auth';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

interface DashboardOverviewProps {
  user: AuthUser | null;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface RecentOrder {
  id: number;
  customer_name: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: number;
}

export default function DashboardOverview({ user }: DashboardOverviewProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalSales: 0,
    totalOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // In a real application, you would fetch this data from your API
        // For now, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock statistics
        setStats({
          totalProducts: 15,
          totalCategories: 5,
          totalSales: 12500000,
          totalOrders: 42
        });
        
        // Mock recent orders
        setRecentOrders([
          {
            id: 1001,
            customer_name: 'Budi Santoso',
            date: '2025-05-05',
            status: 'delivered',
            total: 350000,
            items: 2
          },
          {
            id: 1002,
            customer_name: 'Dewi Lestari',
            date: '2025-05-04',
            status: 'shipped',
            total: 120000,
            items: 1
          },
          {
            id: 1003,
            customer_name: 'Ahmad Rizki',
            date: '2025-05-03',
            status: 'processing',
            total: 450000,
            items: 3
          },
          {
            id: 1004,
            customer_name: 'Siti Rahayu',
            date: '2025-05-02',
            status: 'pending',
            total: 250000,
            items: 2
          },
          {
            id: 1005,
            customer_name: 'Rudi Hermawan',
            date: '2025-05-01',
            status: 'delivered',
            total: 180000,
            items: 1
          }
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Stat card component
  const StatCard = ({ title, value, icon, trend }: StatCardProps) => (
    <div className="bg-neutral-800/50 rounded-lg border border-white/10 p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-white/60 text-sm">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
          
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              <span className="mr-1">
                {trend.isPositive ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
              </span>
              <span>{trend.value}% from last month</span>
            </div>
          )}
        </div>
        
        <div className="p-3 bg-amber-500/20 rounded-md">
          <div className="text-amber-500">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingOverlay message="Loading dashboard data..." />;
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
        <p className="text-white/60 mt-1">Welcome back, {user?.first_name || 'Seller'}!</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Products" 
          value={stats.totalProducts}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
          trend={{ value: 12, isPositive: true }}
        />
        
        <StatCard 
          title="Total Categories" 
          value={stats.totalCategories}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
        />
        
        <StatCard 
          title="Total Sales" 
          value={formatCurrency(stats.totalSales)}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend={{ value: 8.5, isPositive: true }}
        />
        
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          }
          trend={{ value: 5.2, isPositive: true }}
        />
      </div>
      
      {/* Recent Orders */}
      <div className="bg-neutral-800/50 rounded-lg border border-white/10 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">Recent Orders</h3>
          <button className="text-amber-500 text-sm hover:text-amber-400 transition-colors">
            View All
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-neutral-800/30">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Items
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-neutral-900/30 divide-y divide-white/10">
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-amber-500">#{order.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{order.customer_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{order.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'delivered' 
                        ? 'bg-green-100 text-green-800' 
                        : order.status === 'shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : order.status === 'pending'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{order.items}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-white">{formatCurrency(order.total)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
