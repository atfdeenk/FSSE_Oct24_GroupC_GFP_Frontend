'use client';

import { useState, useEffect } from 'react';
import {
  FaUsers,
  FaUserShield,
  FaBoxOpen,
  FaMoneyBillWave,
  FaChartPie,
  FaShoppingCart,
  FaArrowRight,
  FaChartLine,
  FaDollarSign,
  FaStore,
  FaExclamationTriangle
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { adminService, AdminDashboardStats, Transaction, ProductApprovalItem } from '@/services/api/admin';
import { authService } from '@/services/api/auth';
import topupService, { TopUpRequest } from '@/services/api/topup';
import { UserProfile } from '@/types/apiResponses';
import AdminCard from './ui/AdminCard';
import AdminTable from './ui/AdminTable';
import { formatCurrency } from '@/utils/format';

export default function DashboardOverview() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userMap, setUserMap] = useState<Record<number, string>>({});
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [recentTopUps, setRecentTopUps] = useState<TopUpRequest[]>([]);
  const [pendingProducts, setPendingProducts] = useState<ProductApprovalItem[]>([]);
  const [approvedTopUpsCount, setApprovedTopUpsCount] = useState(0);
  const [totalTopUpAmount, setTotalTopUpAmount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch dashboard stats
        const dashboardStats = await adminService.getDashboardStats();
        setStats(dashboardStats);

        // Fetch regular transactions for reference
        if (dashboardStats.recentTransactions && dashboardStats.recentTransactions.length > 0) {
          setRecentTransactions(dashboardStats.recentTransactions);
        }

        // Fetch top-up transactions
        try {
          const topupResponse = await topupService.getAllRequests();
          if (topupResponse.success && topupResponse.requests && topupResponse.requests.length > 0) {
            // Sort by timestamp (newest first) and take the 5 most recent
            const sortedTopUps = [...topupResponse.requests]
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 5);
            setRecentTopUps(sortedTopUps);

            // Calculate approved top-ups count and total amount
            const approvedTopUps = topupResponse.requests.filter(topup => topup.status === 'approved');
            setApprovedTopUpsCount(approvedTopUps.length);

            // Calculate total amount of approved top-ups
            const totalAmount = approvedTopUps.reduce((sum, topup) => sum + topup.amount, 0);
            setTotalTopUpAmount(totalAmount);
          }
        } catch (topupError) {
          console.error('Error fetching top-up requests:', topupError);
          // Don't set the main error state, just log it
        }

        // Fetch pending products
        const products = await adminService.getPendingProducts();
        setPendingProducts(products);

        // Create a map of user IDs to names for transaction display
        const users = await authService.getUsers();
        const map: Record<number, string> = {};
        users.forEach((user: UserProfile) => {
          const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
          map[user.id] = fullName || user.username || `User #${user.id}`;
        });
        setUserMap(map);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Set up polling for real-time updates (every 30 seconds)
    const pollingInterval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(pollingInterval);
  }, []);

  const navigateToSection = (section: string) => {
    // Navigate to a specific section using hash-based routing
    if (typeof window !== 'undefined') {
      window.location.hash = section;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 p-6 animate-pulse">
              <div className="flex justify-between items-center mb-4">
                <div className="h-4 bg-neutral-700 rounded w-1/2"></div>
                <div className="h-6 w-6 rounded-full bg-neutral-700"></div>
              </div>
              <div className="h-8 bg-neutral-700 rounded mb-2"></div>
              <div className="h-4 bg-neutral-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>

        <div className="bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 p-6 animate-pulse">
          <div className="flex justify-between items-center mb-4">
            <div className="h-5 bg-neutral-700 rounded w-1/4"></div>
            <div className="h-6 w-6 rounded-full bg-neutral-700"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-neutral-900 rounded-lg border border-neutral-700 p-4 animate-pulse">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-neutral-700 mb-3"></div>
                  <div className="h-4 bg-neutral-700 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-neutral-700 rounded w-4/5"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 p-6 animate-pulse">
          <div className="flex justify-between items-center mb-4">
            <div className="h-5 bg-neutral-700 rounded w-1/4"></div>
            <div className="h-6 w-6 rounded-full bg-neutral-700"></div>
          </div>
          <div className="overflow-hidden rounded-lg border border-neutral-700">
            <div className="h-10 bg-neutral-700 w-full mb-1"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-neutral-900 w-full mb-1 px-4 py-2">
                <div className="grid grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="h-4 bg-neutral-700 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 text-red-400 p-4 rounded-lg shadow-md">
        <div className="flex items-center">
          <FaExclamationTriangle className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 px-4 py-2 rounded border border-red-700/50 transition-all duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <AdminCard
          title="Total Users"
          icon={<FaUsers size={20} />}
          className="hover:shadow-xl transition-shadow duration-200"
        >
          <div className="text-3xl font-bold text-white mb-1">{stats?.totalUsers || 0}</div>
          <p className="text-sm text-neutral-400">Registered users on the platform</p>
        </AdminCard>

        <AdminCard
          title="Admin Users"
          icon={<FaUserShield size={20} />}
          className="hover:shadow-xl transition-shadow duration-200"
        >
          <div className="text-3xl font-bold text-white mb-1">{stats?.totalAdmins || 0}</div>
          <p className="text-sm text-neutral-400">Users with admin privileges</p>
        </AdminCard>

        <AdminCard
          title="Pending Products"
          icon={<FaBoxOpen size={20} />}
          className="hover:shadow-xl transition-shadow duration-200"
          headerAction={
            pendingProducts.length > 0 ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-600/20 text-amber-400 border border-amber-600/30">
                {pendingProducts.length}
              </span>
            ) : null
          }
        >
          <div className="text-3xl font-bold text-white mb-1">{pendingProducts.length}</div>
          <p className="text-sm text-neutral-400">Products waiting for approval</p>
          {pendingProducts.length > 0 && (
            <button
              onClick={() => navigateToSection('products')}
              className="mt-3 text-sm text-amber-400 hover:text-amber-300 flex items-center"
            >
              Review now <FaArrowRight className="ml-1 h-3 w-3" />
            </button>
          )}
        </AdminCard>

        <AdminCard
          title="Approved Top-ups"
          icon={<FaShoppingCart size={20} />}
          className="hover:shadow-md transition-shadow duration-200"
        >
          <div className="text-3xl font-bold text-white mb-1">{approvedTopUpsCount}</div>
          <p className="text-sm text-neutral-400">Number of approved top-ups</p>
        </AdminCard>

        <AdminCard
          title="Total Top-up Amount"
          icon={<FaDollarSign size={20} />}
          className="hover:shadow-md transition-shadow duration-200"
        >
          <div className="text-3xl font-bold text-amber-400 mb-1">
            {formatCurrency(totalTopUpAmount)}
          </div>
          <p className="text-sm text-neutral-400">Total approved top-up amount</p>
        </AdminCard>
      </div>

      {/* Quick Actions */}
      <AdminCard
        title="Admin Actions"
        icon={<FaChartLine size={20} />}
        className="hover:shadow-md transition-shadow duration-200"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className="p-4 bg-neutral-800 rounded-lg border border-neutral-700 hover:bg-neutral-700 hover:border-amber-700/50 cursor-pointer transition-all duration-200 flex flex-col items-center text-center shadow-md"
            onClick={() => navigateToSection('products')}
          >
            {pendingProducts.length > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-900/80 text-red-300 border border-red-700 rounded-full flex items-center justify-center text-xs font-bold">
                {pendingProducts.length}
              </span>
            )}
            <div className="w-12 h-12 bg-amber-900/30 rounded-full flex items-center justify-center mb-3 border border-amber-700/50">
              <FaBoxOpen className="text-amber-400" size={20} />
            </div>
            <h4 className="font-medium text-white mb-1">Review Products</h4>
            <p className="text-xs text-neutral-400">Approve or reject pending products</p>
          </div>

          <div
            className="p-4 bg-neutral-800 rounded-lg border border-neutral-700 hover:bg-neutral-700 hover:border-amber-700/50 cursor-pointer transition-all duration-200 flex flex-col items-center text-center shadow-md"
            onClick={() => navigateToSection('topup-requests')}
          >
            <div className="w-12 h-12 bg-amber-900/30 rounded-full flex items-center justify-center mb-3 border border-amber-700/50">
              <FaMoneyBillWave className="text-amber-400" size={20} />
            </div>
            <h4 className="font-medium text-white mb-1">Top-up Requests</h4>
            <p className="text-xs text-neutral-400">Manage customer top-up requests</p>
          </div>

          <div
            className="p-4 bg-neutral-800 rounded-lg border border-neutral-700 hover:bg-neutral-700 hover:border-amber-700/50 cursor-pointer transition-all duration-200 flex flex-col items-center text-center shadow-md"
            onClick={() => navigateToSection('users')}
          >
            <div className="w-12 h-12 bg-amber-900/30 rounded-full flex items-center justify-center mb-3 border border-amber-700/50">
              <FaUserShield className="text-amber-400" size={20} />
            </div>
            <h4 className="font-medium text-white mb-1">User Management</h4>
            <p className="text-xs text-neutral-400">Manage user accounts and roles</p>
          </div>

          <div
            className="p-4 bg-neutral-800 rounded-lg border border-neutral-700 hover:bg-neutral-700 hover:border-amber-700/50 cursor-pointer transition-all duration-200 flex flex-col items-center text-center shadow-md"
            onClick={() => navigateToSection('admin-management')}
          >
            <div className="w-12 h-12 bg-amber-900/30 rounded-full flex items-center justify-center mb-3 border border-amber-700/50">
              <FaUserShield className="text-amber-400" size={20} />
            </div>
            <h4 className="font-medium text-white mb-1">Admin Settings</h4>
            <p className="text-xs text-neutral-400">Manage admin accounts and permissions</p>
          </div>
        </div>
      </AdminCard>

      {/* Recent Top-up Transactions */}
      <AdminCard
        title="Recent Top-up Requests"
        icon={<FaMoneyBillWave size={20} />}
        className="hover:shadow-md transition-shadow duration-200"
        footer={
          <div className="flex justify-between items-center">
            <p className="text-xs text-neutral-400">Showing {recentTopUps.length} recent top-up requests</p>
            <button
              onClick={() => navigateToSection('topup-requests')}
              className="text-sm text-amber-400 hover:text-amber-300 flex items-center"
            >
              View all top-up requests <FaArrowRight className="ml-1 h-3 w-3" />
            </button>
          </div>
        }
      >
        {recentTopUps.length > 0 ? (
          <AdminTable
            data={recentTopUps}
            keyExtractor={(item) => item.request_id.toString()}
            columns={[
              {
                header: 'User',
                accessor: (topup) => (
                  <div className="text-sm font-medium text-white">
                    {topup.user_name || userMap[topup.user_id] || `User #${topup.user_id}`}
                  </div>
                )
              },
              {
                header: 'Amount',
                accessor: (topup) => (
                  <div className="text-sm font-medium text-amber-400">
                    {formatCurrency(topup.amount)}
                  </div>
                )
              },
              {
                header: 'Status',
                accessor: (topup) => (
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${topup.status === 'pending' ? 'bg-amber-900/20 text-amber-400 border border-amber-700/50' :
                      topup.status === 'approved' ? 'bg-green-900/20 text-green-400 border border-green-700/50' :
                        'bg-red-900/20 text-red-400 border border-red-700/50'
                    }`}>
                    {topup.status.charAt(0).toUpperCase() + topup.status.slice(1)}
                  </span>
                )
              },
              {
                header: 'Notes',
                accessor: (topup) => (
                  <span className="text-sm text-neutral-400">
                    {topup.notes || '-'}
                  </span>
                ),
                className: 'text-sm text-neutral-400'
              },
              {
                header: 'Date',
                accessor: (topup) => (
                  <span className="text-sm text-neutral-400">
                    {topup.timestamp ? new Date(topup.timestamp).toLocaleDateString() : 'N/A'}
                  </span>
                )
              }
            ]}
          />
        ) : (
          <div className="p-4 text-center">
            <p className="text-neutral-400">No recent top-up requests found</p>
          </div>
        )}
      </AdminCard>

      {/* Alert for pending products */}
      {pendingProducts.length > 0 && (
        <div className="rounded-lg bg-amber-900/20 border border-amber-700 p-4 shadow-md">
          <div className="flex flex-col sm:flex-row">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
            </div>
            <div className="ml-0 sm:ml-3 mt-2 sm:mt-0">
              <p className="text-sm text-amber-400">
                <span className="font-bold">Attention needed:</span> There are {pendingProducts.length} products awaiting your approval.
                {pendingProducts.length > 0 && pendingProducts[0].seller && (
                  <span className="block mt-1">
                    Latest from: <span className="font-medium">{pendingProducts[0].seller.name}</span>
                  </span>
                )}
              </p>
            </div>
            <div className="ml-0 sm:ml-auto pl-0 sm:pl-3 mt-3 sm:mt-0">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => navigateToSection('products')}
                  className="px-4 py-2 bg-amber-600/30 text-amber-400 border border-amber-600 rounded-lg text-sm font-medium hover:bg-amber-600/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors shadow-md"
                >
                  Review Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
