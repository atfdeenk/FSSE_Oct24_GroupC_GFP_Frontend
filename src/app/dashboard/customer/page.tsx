"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProfileCard from '@/components/profile/ProfileCard';
import { RecentOrders } from '@/components/orders';
import { isAuthenticated, getCurrentUser, AuthUser } from '@/lib/auth';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

// Import the OrderDetailsModal component
import OrderDetailsModal from '@/components/orders/OrderDetailsModal';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login?redirect=/dashboard/customer');
      return;
    }

    // Get current user and verify role
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        
        // Check if user exists
        if (!currentUser) {
          toast.error('Unable to retrieve user information');
          router.push('/login?redirect=/dashboard/customer');
          return;
        }
        
        // Verify that the user is a customer
        // Note: We allow admins to view the customer dashboard for monitoring purposes
        if (currentUser.role !== 'customer' && currentUser.role !== 'admin') {
          toast.error('Access denied. Redirecting to appropriate dashboard.');
          router.push('/dashboard'); // Redirect to main dashboard router
          return;
        }
        
        setUser(currentUser);
        // Orders are now fetched directly by the RecentOrders component
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error loading dashboard');
        router.push('/login?redirect=/dashboard/customer');
      }
    };
    fetchUser();
  }, [router]);

  // Handle profile update
  const handleProfileUpdate = (updatedUser: AuthUser) => {
    setUser(updatedUser);
    // Toast notification is now handled in the ProfileCard component
  };

  // Handle opening the order details modal
  const handleOpenOrderDetails = (orderId: string | number) => {
    setSelectedOrderId(String(orderId));
  };

  // Handle closing the order details modal
  const handleCloseOrderDetails = () => {
    setSelectedOrderId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />

      <main className="flex-grow w-full max-w-6xl mx-auto px-6 py-12">
        {loading && !user ? (
          <div className="h-64">
            <LoadingOverlay message="Loading dashboard..." />
          </div>
        ) : (
          <>
            {/* Profile Card Component */}
            <ProfileCard user={user} onProfileUpdate={handleProfileUpdate} />

            {/* Recent Orders Component with Pagination */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Recent Orders</h2>
              </div>
              <RecentOrders limit={10} showPagination={true} onViewDetails={handleOpenOrderDetails} />
            </div>
          </>
        )}
      </main>
      <Footer />

      {/* Order Details Modal - Outside of any container for proper z-index handling */}
      {selectedOrderId && (
        <OrderDetailsModal
          orderId={selectedOrderId}
          onClose={handleCloseOrderDetails}
        />
      )}
    </div>
  );
}
