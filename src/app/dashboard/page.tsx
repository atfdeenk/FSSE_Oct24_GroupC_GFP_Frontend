"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header, Footer } from "@/components";
import { isAuthenticated, getCurrentUser, AuthUser } from "@/lib/auth";

// Mock order data
interface Order {
  id: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: number;
}

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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

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

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />
      
      <main className="flex-grow w-full max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <>
            {/* User Profile Section */}
            <div className="bg-neutral-900/80 backdrop-blur-sm rounded-sm border border-white/10 p-8 mb-8">
              <div className="flex flex-col md:flex-row items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-amber-500/30 bg-neutral-800 flex items-center justify-center mb-4 md:mb-0 md:mr-8">
                  {user?.first_name ? (
                    <span className="text-amber-500 font-bold text-3xl">
                      {user.first_name.charAt(0)}{user.last_name?.charAt(0)}
                    </span>
                  ) : (
                    <svg className="w-12 h-12 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                
                <div className="text-center md:text-left">
                  <h1 className="text-2xl font-bold text-white mb-1">
                    {user?.first_name} {user?.last_name}
                  </h1>
                  <p className="text-white/60 mb-2">{user?.email}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium">
                      {user?.role === 'seller' ? 'Seller Account' : 'Consumer Account'}
                    </span>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                      Verified
                    </span>
                  </div>
                </div>
                
                <div className="ml-auto mt-4 md:mt-0">
                  <Link 
                    href="/settings" 
                    className="inline-flex items-center px-4 py-2 border border-white/20 rounded-sm text-white hover:bg-white/5 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Quick Stats */}
              <div className="bg-neutral-900/80 backdrop-blur-sm rounded-sm border border-white/10 p-6">
                <h2 className="text-lg font-bold text-white mb-4">Account Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-white/10">
                    <span className="text-white/70">Member Since</span>
                    <span className="text-white">November 2023</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-white/10">
                    <span className="text-white/70">Total Orders</span>
                    <span className="text-white">{recentOrders.length}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-white/10">
                    <span className="text-white/70">Wishlist Items</span>
                    <span className="text-white">4</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Rewards Points</span>
                    <span className="text-amber-500 font-bold">250 pts</span>
                  </div>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="bg-neutral-900/80 backdrop-blur-sm rounded-sm border border-white/10 p-6">
                <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white text-sm">Your order <span className="text-amber-400">ORD-2023-1001</span> has been delivered</p>
                      <p className="text-white/50 text-xs">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white text-sm">Payment of <span className="text-amber-400">{formatCurrency(245000)}</span> processed</p>
                      <p className="text-white/50 text-xs">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white text-sm">You left a review for <span className="text-amber-400">Arabica Premium Beans</span></p>
                      <p className="text-white/50 text-xs">5 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recommended Products */}
              <div className="bg-neutral-900/80 backdrop-blur-sm rounded-sm border border-white/10 p-6">
                <h2 className="text-lg font-bold text-white mb-4">Recommended For You</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-sm overflow-hidden mr-4 flex-shrink-0">
                      <img 
                        src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=300" 
                        alt="Coffee Beans" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <Link href="/products/101" className="text-white hover:text-amber-400 transition-colors">
                        Arabica Premium Beans
                      </Link>
                      <p className="text-amber-500 font-medium">{formatCurrency(120000)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-sm overflow-hidden mr-4 flex-shrink-0">
                      <img 
                        src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300" 
                        alt="Coffee Beans" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <Link href="/products/203" className="text-white hover:text-amber-400 transition-colors">
                        Robusta Dark Roast
                      </Link>
                      <p className="text-amber-500 font-medium">{formatCurrency(85000)}</p>
                    </div>
                  </div>
                  <Link href="/products" className="text-amber-500 hover:text-amber-400 text-sm block text-center mt-2">
                    View All Products
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Recent Orders */}
            <div className="bg-neutral-900/80 backdrop-blur-sm rounded-sm border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Recent Orders</h2>
                <Link 
                  href="/orders" 
                  className="text-amber-500 hover:text-amber-400 transition-colors text-sm"
                >
                  View All Orders
                </Link>
              </div>
              
              {recentOrders.length === 0 ? (
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
                      {recentOrders.map((order) => (
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
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
