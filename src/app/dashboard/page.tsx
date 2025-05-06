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
        
        if (!currentUser) {
          router.push('/login?redirect=/dashboard');
          return;
        }

        // Redirect based on user role
        switch (currentUser.role) {
          case 'admin':
            router.push('/dashboard/admin');
            break;
          case 'seller':
            router.push('/dashboard/seller');
            break;
          case 'customer':
          default:
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
