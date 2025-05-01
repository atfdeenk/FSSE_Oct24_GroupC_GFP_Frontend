"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getCurrentUser, AuthUser } from "@/lib/auth";

// Import components using centralized exports
import {
  Header,
  Footer,
  ProfileCard,
  RecentOrders,
  type Order
} from "@/components";
import OrderDetailsModal from "@/components/orders/OrderDetailsModal";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login?redirect=dashboard');
      return;
    }

    // Get current user
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();

    // Orders are now fetched directly by the RecentOrders component
    setLoading(false);
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
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
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
