"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getCurrentUser, AuthUser } from "@/lib/auth";
import { showSuccess } from "@/utils/toast";

// Import components using centralized exports
import { 
  Header, 
  Footer, 
  ProfileCard, 
  RecentOrders,
  type Order 
} from "@/components";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

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

    // Simulate API call to get recent orders
    const fetchRecentOrders = async () => {
      setLoading(true);
      try {
        // In a real app, we would fetch from an API
        // For now, we'll use mock data
        setTimeout(() => {
          setRecentOrders([
            {
              id: "ORD-2023-1001",
              date: "2023-11-28",
              status: "delivered",
              total: 245000,
              items: 2
            },
            {
              id: "ORD-2023-0987",
              date: "2023-11-15",
              status: "shipped",
              total: 120000,
              items: 1
            },
            {
              id: "ORD-2023-0954",
              date: "2023-10-30",
              status: "delivered",
              total: 350000,
              items: 3
            }
          ]);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    };

    fetchRecentOrders();
  }, [router]);

  // Handle profile update
  const handleProfileUpdate = (updatedUser: AuthUser) => {
    setUser(updatedUser);
    showSuccess("Profile updated successfully!");
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

            {/* Recent Orders Component */}
            <RecentOrders orders={recentOrders} loading={loading} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
