"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
// Import seller dashboard components from barrel file
import {
  SellerDashboardTabs,
  ProductManagement,
  VoucherManagement,
  DashboardOverview
} from '@/components/dashboard/seller';

export default function SellerDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const isAuth = isAuthenticated();

      if (!isAuth) {
        router.push('/login?redirect=/dashboard/seller');
        return;
      }

      try {
        const currentUser = await getCurrentUser();

        // Debug: Log user info in seller dashboard
        console.log('Seller Dashboard - User Info:', {
          hasUser: !!currentUser,
          role: currentUser?.role,
          name: currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'N/A'
        });

        // Check if currentUser exists and is a seller or admin
        if (!currentUser) {
          console.log('Seller Dashboard - No user found, redirecting to login');
          toast.error('Unable to retrieve user information');
          router.push('/login?redirect=/dashboard/seller');
          return;
        }
        
        if (currentUser.role !== 'seller' && currentUser.role !== 'vendor' && currentUser.role !== 'admin') {
          console.log('Seller Dashboard - User is not seller, vendor, or admin, redirecting to main dashboard');
          toast.error('You need seller privileges to access this page');
          router.push('/dashboard'); // Redirect to main dashboard router
          return;
        }

        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/login?redirect=/dashboard/seller');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return <LoadingOverlay message="Loading seller dashboard..." />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductManagement />;
      case 'vouchers':
        return <VoucherManagement />;
      case 'overview':
      default:
        return <DashboardOverview user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Seller Dashboard</h1>
          <p className="text-white/60 mt-2">Manage your products, categories, and vouchers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <SellerDashboardTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              user={user}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 bg-neutral-800/50 rounded-lg border border-white/10 p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
