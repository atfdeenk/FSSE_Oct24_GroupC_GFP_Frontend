"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '@/lib/auth';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

export default function DashboardRedirectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const redirectToDashboard = async () => {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        router.push('/login?redirect=/dashboard');
        return;
      }

      try {
        // Get current user
        const currentUser = await getCurrentUser();
        
        // Debug: Log user info
        console.log('Dashboard Router - User Info:', {
          hasUser: !!currentUser,
          role: currentUser?.role,
          name: currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'N/A'
        });
        
        if (!currentUser) {
          console.log('Dashboard Router - No user found, redirecting to login');
          router.push('/login?redirect=/dashboard');
          return;
        }

        // Redirect based on user role
        switch (currentUser.role) {
          case 'admin':
            // Temporarily redirect admins to seller dashboard until admin dashboard is implemented
            // TODO: Create a dedicated admin dashboard and update this redirect
            router.push('/dashboard/seller');
            break;
          case 'seller':
            router.push('/dashboard/seller');
            break;
          case 'customer':
            router.push('/dashboard/customer');
            break;
          default:
            // If role is undefined or not recognized, default to customer
            router.push('/dashboard/customer');
            break;
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/login?redirect=/dashboard');
      } finally {
        setLoading(false);
      }
    };

    redirectToDashboard();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      {loading && (
        <LoadingOverlay message="Redirecting to your dashboard..." />
      )}
    </div>
  );
}
