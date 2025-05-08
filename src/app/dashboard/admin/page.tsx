'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  FaUsers,
  FaUserShield,
  FaBoxOpen,
  FaMoneyBillWave,
  FaChartPie,
  FaSignOutAlt,
  FaTachometerAlt,
  FaShoppingCart,
  FaCheckCircle,
  FaUserCog
} from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { UserProfile } from '@/types/apiResponses';
import DashboardOverview from '@/components/dashboard/admin/DashboardOverview';
import UserManagement from '@/components/dashboard/admin/UserManagement';
import ProductApproval from '@/components/dashboard/admin/ProductApproval';
import TopupRequestsManagement from '@/components/dashboard/admin/TopupRequestsManagement';

export default function AdminDashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
          router.push('/login?redirect=/dashboard/admin');
          return;
        }

        // Check if user is an admin
        if (currentUser.role !== 'admin') {
          toast.error('You need admin privileges to access this page');
          router.push('/dashboard');
          return;
        }

        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/login?redirect=/dashboard/admin');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Handle section change from URL hash
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash && ['overview', 'users', 'products', 'topup-requests'].includes(hash)) {
        setActiveSection(hash);
      }

      // Listen for hash changes
      const handleHashChange = () => {
        const newHash = window.location.hash.replace('#', '');
        if (newHash && ['overview', 'users', 'products', 'topup-requests'].includes(newHash)) {
          setActiveSection(newHash);
        }
      };

      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }
  }, []);

  const handleLogout = () => {
    // Implement logout functionality
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <DashboardOverview />;
      case 'users':
        return <UserManagement />;
      case 'products':
        return <ProductApproval />;
      case 'topup-requests':
        return <TopupRequestsManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-neutral-900">
      {/* Sidebar */}
      <div className="w-64 bg-neutral-800 shadow-md z-10 flex flex-col">
        <div className="p-4 border-b border-neutral-700 flex items-center justify-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-amber-700">Bumibrew</span>
          </Link>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-neutral-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber-700 flex items-center justify-center text-amber-100 font-bold text-lg overflow-hidden">
              {user?.image_url ? (
                <Image
                  src={user.image_url}
                  alt={user.first_name}
                  width={40}
                  height={40}
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://via.placeholder.com/40?text=${user.first_name.charAt(0).toUpperCase()}`;
                  }}
                />
              ) : (
                user?.first_name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-white/60 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-700 text-amber-100">
              <FaUserShield className="mr-1" /> Admin
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 bg-neutral-800 space-y-1 overflow-y-auto">
          <Link
            href="#overview"
            onClick={() => setActiveSection('overview')}
            className={`${activeSection === 'overview'
                ? 'bg-amber-700 text-white'
                : 'text-white/70 hover:bg-neutral-700 hover:text-white'
              } group flex items-center px-4 py-3 text-sm font-medium rounded-md`}
          >
            <FaTachometerAlt className={`mr-3 h-5 w-5 ${activeSection === 'overview' ? 'text-amber-100' : 'text-white/60'}`} />
            Dashboard Overview
          </Link>

          <Link
            href="#users"
            onClick={() => setActiveSection('users')}
            className={`${activeSection === 'users'
                ? 'bg-amber-700 text-white'
                : 'text-white/70 hover:bg-neutral-700 hover:text-white'
              } group flex items-center px-4 py-3 text-sm font-medium rounded-md`}
          >
            <FaUsers className={`mr-3 h-5 w-5 ${activeSection === 'users' ? 'text-amber-100' : 'text-white/60'}`} />
            User Management
          </Link>

          <Link
            href="#products"
            onClick={() => setActiveSection('products')}
            className={`${activeSection === 'products'
                ? 'bg-amber-700 text-white'
                : 'text-white/70 hover:bg-neutral-700 hover:text-white'
              } group flex items-center px-4 py-3 text-sm font-medium rounded-md`}
          >
            <FaBoxOpen className={`mr-3 h-5 w-5 ${activeSection === 'products' ? 'text-amber-100' : 'text-white/60'}`} />
            Product Approval
          </Link>



          <Link
            href="#topup-requests"
            className={`${activeSection === 'topup-requests'
                ? 'bg-amber-700 text-white'
                : 'text-white/70 hover:bg-neutral-700 hover:text-white'
              } group flex items-center px-4 py-3 text-sm font-medium rounded-md`}
            onClick={() => setActiveSection('topup-requests')}
          >
            <FaMoneyBillWave className={`mr-3 h-5 w-5 ${activeSection === 'topup-requests' ? 'text-amber-100' : 'text-white/60'}`} />
            Top-up Requests
          </Link>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-400 rounded-md hover:bg-neutral-700 hover:text-red-300"
          >
            <FaSignOutAlt className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-neutral-900">
        <header className="bg-neutral-800 shadow-sm z-10 sticky top-0">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">
              {activeSection === 'overview' && 'Dashboard Overview'}
              {activeSection === 'users' && 'User Management'}
              {activeSection === 'products' && 'Product Approval'}

              {activeSection === 'topup-requests' && 'Top-up Requests Management'}
            </h1>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-sm text-white/70 hover:text-amber-500 flex items-center"
              >
                <FaShoppingCart className="mr-1" /> View Store
              </Link>
            </div>
          </div>
        </header>

        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
