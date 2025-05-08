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
import { adminService, AdminDashboardStats, Transaction } from '@/services/api/admin';
import { authService } from '@/services/api/auth';
import { UserProfile } from '@/types/apiResponses';
import AdminCard from './ui/AdminCard';
import AdminTable from './ui/AdminTable';
import { formatCurrency } from '@/utils/format';

export default function DashboardOverview() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userMap, setUserMap] = useState<Record<number, string>>({});
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch dashboard stats
        const dashboardStats = await adminService.getDashboardStats();
        setStats(dashboardStats);
        setRecentTransactions(dashboardStats.recentTransactions || []);

        // Create a map of user IDs to names for transaction display
        const users = await authService.getUsers();
        const map: Record<number, string> = {};
        users.forEach((user: UserProfile) => {
          map[user.id] = `${user.first_name} ${user.last_name}`;
        });
        setUserMap(map);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const navigateToSection = (section: string) => {
    // Navigate to a specific section using hash-based routing
    if (typeof window !== 'undefined') {
      window.location.hash = section;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 p-6 animate-pulse">
            <div className="h-4 bg-neutral-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-neutral-700 rounded mb-2"></div>
            <div className="h-4 bg-neutral-700 rounded w-3/4"></div>
          </div>
        ))}
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
            stats && stats.pendingProducts && stats.pendingProducts > 0 ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-600/20 text-amber-400 border border-amber-600/30">
                {stats.pendingProducts}
              </span>
            ) : null
          }
        >
          <div className="text-3xl font-bold text-white mb-1">{stats?.pendingProducts || 0}</div>
          <p className="text-sm text-neutral-400">Products waiting for approval</p>
          {stats && stats.pendingProducts && stats.pendingProducts > 0 && (
            <button 
              onClick={() => navigateToSection('products')} 
              className="mt-3 text-sm text-amber-600 hover:text-amber-700 flex items-center"
            >
              Review now <FaArrowRight className="ml-1 h-3 w-3" />
            </button>
          )}
        </AdminCard>

        <AdminCard
          title="Total Transactions"
          icon={<FaShoppingCart size={20} />}
          className="hover:shadow-md transition-shadow duration-200"
        >
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats?.totalTransactions || 0}</div>
          <p className="text-sm text-gray-500">Number of transactions</p>
        </AdminCard>

        <AdminCard
          title="Total Revenue"
          icon={<FaDollarSign size={20} />}
          className="hover:shadow-md transition-shadow duration-200"
        >
          <div className="text-3xl font-bold text-amber-600 mb-1">
            {formatCurrency(stats?.totalRevenue || 0)}
          </div>
          <p className="text-sm text-gray-500">Total revenue</p>
        </AdminCard>
      </div>
      
      {/* Quick Actions */}
      <AdminCard
        title="Quick Actions"
        icon={<FaChartLine size={20} />}
        className="hover:shadow-md transition-shadow duration-200"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-amber-50 hover:border-amber-200 cursor-pointer transition-colors duration-200 flex flex-col items-center text-center"
            onClick={() => navigateToSection('users')}
          >
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3">
              <FaUsers className="text-amber-600" size={20} />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Manage Users</h4>
            <p className="text-xs text-gray-500">View and manage user accounts</p>
          </div>

          <div 
            className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-amber-50 hover:border-amber-200 cursor-pointer transition-colors duration-200 flex flex-col items-center text-center relative"
            onClick={() => navigateToSection('products')}
          >
            {stats && stats.pendingProducts && stats.pendingProducts > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {stats.pendingProducts}
              </span>
            )}
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3">
              <FaBoxOpen className="text-amber-600" size={20} />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Product Approval</h4>
            <p className="text-xs text-gray-500">Review and approve pending products</p>
          </div>

          <div 
            className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-amber-50 hover:border-amber-200 cursor-pointer transition-colors duration-200 flex flex-col items-center text-center"
            onClick={() => navigateToSection('balance')}
          >
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3">
              <FaMoneyBillWave className="text-amber-600" size={20} />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Manage Balances</h4>
            <p className="text-xs text-gray-500">Manage user wallet balances</p>
          </div>

          <div 
            className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-amber-50 hover:border-amber-200 cursor-pointer transition-colors duration-200 flex flex-col items-center text-center"
            onClick={() => window.open('/', '_blank')}
          >
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3">
              <FaStore className="text-amber-600" size={20} />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">View Store</h4>
            <p className="text-xs text-gray-500">See the store as customers see it</p>
          </div>
        </div>
      </AdminCard>
      
      {/* Recent Transactions */}
      {recentTransactions && recentTransactions.length > 0 && (
        <AdminCard
          title="Recent Transactions"
          icon={<FaMoneyBillWave size={20} />}
          className="hover:shadow-md transition-shadow duration-200"
          footer={
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">Showing {recentTransactions.length} recent transactions</p>
              <button 
                onClick={() => navigateToSection('balance')} 
                className="text-sm text-amber-600 hover:text-amber-700 flex items-center"
              >
                View all transactions <FaArrowRight className="ml-1 h-3 w-3" />
              </button>
            </div>
          }
        >
          <AdminTable
            data={recentTransactions}
            keyExtractor={(item) => item.id.toString()}
            columns={[
              {
                header: 'User',
                accessor: (transaction) => (
                  <div className="text-sm font-medium text-gray-900">
                    {userMap[transaction.user_id] || `User #${transaction.user_id}`}
                  </div>
                )
              },
              {
                header: 'Amount',
                accessor: (transaction) => (
                  <div className={`text-sm font-medium ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                )
              },
              {
                header: 'Type',
                accessor: (transaction) => (
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {transaction.type === 'credit' ? 'Credit' : 'Debit'}
                  </span>
                )
              },
              {
                header: 'Description',
                accessor: 'description',
                className: 'text-sm text-gray-500'
              },
              {
                header: 'Date',
                accessor: (transaction) => (
                  <span className="text-sm text-gray-500">
                    {transaction.date ? new Date(transaction.date).toLocaleDateString() : 'N/A'}
                  </span>
                )
              }
            ]}
          />
        </AdminCard>
      )}
      
      {/* Alert for pending products */}
      {stats && stats.pendingProducts && stats.pendingProducts > 0 && (
        <div className="rounded-lg bg-amber-900/20 border border-amber-700 p-4 shadow-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-400">
                <span className="font-bold">Attention needed:</span> There are {stats.pendingProducts} products awaiting your approval.
              </p>
            </div>
            <div className="ml-auto pl-3">
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
