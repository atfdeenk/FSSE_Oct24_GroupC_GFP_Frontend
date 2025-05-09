'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, logout } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/api/admin';
import topupService from '@/services/api/topup';
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState(0);
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

  // Fetch notifications count - pending products and top-up requests
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Only fetch if user is authenticated
        if (user) {
          // Get pending products count
          const pendingProducts = await adminService.getPendingProducts();
          const pendingProductsCount = pendingProducts.length;
          
          // Get pending top-up requests count
          const topupResponse = await topupService.getAllRequests();
          const pendingTopupCount = topupResponse.success && topupResponse.requests ? 
            topupResponse.requests.filter(req => req.status === 'pending').length : 0;
          
          // Set total notification count
          const totalCount = pendingProductsCount + pendingTopupCount;
          setNotifications(totalCount);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    
    fetchNotifications();
    
    // Set up polling for notifications (every 30 seconds)
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

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

  // Save sidebar state in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('admin-sidebar-collapsed');
      if (savedState) {
        setSidebarCollapsed(savedState === 'true');
      }
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-sidebar-collapsed', String(newState));
    }
  };

  const handleLogout = () => {
    // Properly clear localStorage and cookies
    logout();
    // Show success notification
    toast.success('You have been signed out');
    // Redirect to login page
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-4"></div>
          <p className="text-amber-500 text-lg">Loading dashboard...</p>
        </div>
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

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { id: 'users', label: 'Users', icon: <FaUsers /> },
    { id: 'products', label: 'Products', icon: <FaBoxOpen /> },
    { id: 'topup-requests', label: 'Top-ups', icon: <FaMoneyBillWave /> },
  ];

  return (
    <div className="flex h-screen bg-neutral-900 text-white overflow-hidden">
      {/* Sidebar */}
      <div 
        className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-neutral-800 shadow-lg z-20 flex flex-col transition-all duration-300 ease-in-out`}
      >
        <div className="p-4 border-b border-neutral-700 flex items-center justify-between">
          {!sidebarCollapsed && (
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-amber-500">Bumibrew</span>
            </Link>
          )}
          {sidebarCollapsed && (
            <div className="w-full flex justify-center">
              <Link href="/" className="text-amber-500 font-bold text-2xl">B</Link>
            </div>
          )}
          <button 
            onClick={toggleSidebar}
            className="text-white/70 hover:text-amber-500 transition-colors"
          >
            {sidebarCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            )}
          </button>
        </div>

        {/* User info */}
        <div className={`p-4 border-b border-neutral-700 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
          {!sidebarCollapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-amber-100 font-bold text-lg overflow-hidden shadow-md">
                {user?.image_url ? (
                  <Image
                    src={user.image_url}
                    alt={user.first_name}
                    width={40}
                    height={40}
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name + ' ' + user.last_name)}&background=D97706&color=FFF&size=40`;
                    }}
                  />
                ) : (
                  user?.first_name.charAt(0).toUpperCase() + (user?.last_name ? user.last_name.charAt(0).toUpperCase() : '')
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-white/60 truncate">
                  {user?.email}
                </p>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-600 text-amber-100 shadow-sm">
                    <FaUserShield className="mr-1" /> Admin
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-amber-100 font-bold text-lg overflow-hidden shadow-md">
              {user?.image_url ? (
                <Image
                  src={user.image_url}
                  alt={user.first_name}
                  width={40}
                  height={40}
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name.charAt(0))}&background=D97706&color=FFF&size=40`;
                  }}
                />
              ) : (
                user?.first_name.charAt(0).toUpperCase()
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 bg-neutral-800 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-800">
          <div className={`space-y-1 px-3 ${sidebarCollapsed ? 'text-center' : ''}`}>
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setActiveSection(item.id)}
                className={`${activeSection === item.id
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-white/70 hover:bg-neutral-700 hover:text-white'
                  } group flex items-center ${sidebarCollapsed ? 'justify-center' : ''} px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out`}
                title={sidebarCollapsed ? item.label : ''}
              >
                <span className={`${sidebarCollapsed ? 'text-xl' : 'mr-3 text-lg'} ${activeSection === item.id ? 'text-amber-100' : 'text-white/60'}`}>
                  {item.icon}
                </span>
                {!sidebarCollapsed && item.label}
                {!sidebarCollapsed && item.id === 'users' && (
                  <span className="ml-auto bg-amber-800 text-amber-100 text-xs font-semibold px-2 py-0.5 rounded-full">
                    New
                  </span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-700">
          <button
            onClick={handleLogout}
            className={`flex ${sidebarCollapsed ? 'justify-center' : ''} items-center px-4 py-2 text-sm font-medium text-red-400 rounded-lg hover:bg-neutral-700 hover:text-red-300 transition-colors w-full`}
            title={sidebarCollapsed ? 'Sign Out' : ''}
          >
            <FaSignOutAlt className={`${sidebarCollapsed ? 'text-lg' : 'mr-3'}`} />
            {!sidebarCollapsed && 'Sign Out'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-neutral-900">
        <header className="bg-neutral-800 shadow-md z-10 sticky top-0">
          <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate max-w-[220px] sm:max-w-none">
                {activeSection === 'overview' && 'Dashboard Overview'}
                {activeSection === 'users' && 'User Management'}
                {activeSection === 'products' && 'Product Approval'}
                {activeSection === 'topup-requests' && 'Top-up Requests'}
              </h1>
              <div className="mt-1 sm:mt-0 sm:ml-4 px-2 py-1 bg-amber-600/10 text-amber-500 rounded-md text-xs inline-flex">
                Admin Panel
              </div>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto justify-end">
              {/* Notification bell */}
              <div className="relative">
                <button 
                  className="text-white/70 hover:text-amber-500 transition-colors"
                  onClick={() => {
                    // Navigate to the section with the most pending items
                    if (notifications > 0) {
                      // For simplicity, we'll just go to the products section
                      // In a real app, you might want to check which has more pending items
                      window.location.hash = 'products';
                      setActiveSection('products');
                      toast.success(`You have ${notifications} pending items to review`);
                    }
                  }}
                  title={notifications > 0 ? `${notifications} pending items` : 'No notifications'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {notifications}
                    </span>
                  )}
                </button>
              </div>
              
              {/* Store link */}
              <Link
                href="/"
                className="text-sm bg-amber-600 hover:bg-amber-700 text-white py-2 px-3 sm:px-4 rounded-lg flex items-center transition-colors shadow-md whitespace-nowrap"
              >
                <FaShoppingCart className="mr-2" /> View Store
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="container mx-auto">
            {/* Breadcrumbs */}
            <div className="flex items-center text-sm text-white/60 mb-6 overflow-hidden">
              <span className="whitespace-nowrap">Admin</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-amber-500 truncate">
                {activeSection === 'overview' && 'Dashboard'}
                {activeSection === 'users' && 'User Management'}
                {activeSection === 'products' && 'Product Approval'}
                {activeSection === 'topup-requests' && 'Top-up Requests'}
              </span>
            </div>
            
            {/* Page content */}
            <div className="bg-neutral-800 rounded-xl shadow-xl overflow-hidden">
              {renderContent()}
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-neutral-800 text-white/60 text-sm py-4 px-6 border-t border-neutral-700">
          <div className="flex justify-between items-center">
            <div>© 2025 Bumibrew. All rights reserved.</div>
            <div>Admin Dashboard v1.0</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
