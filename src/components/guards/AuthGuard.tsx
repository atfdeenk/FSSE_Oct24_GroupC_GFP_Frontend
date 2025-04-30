"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthUser } from '@/hooks/useAuthUser';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

interface AuthGuardProps {
  children: React.ReactNode;
  loginPath?: string;
}

/**
 * Component to protect routes that require authentication
 * Use this component to wrap pages that should only be accessible to authenticated users
 */
const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  loginPath = '/login',
}) => {
  const router = useRouter();
  const { isLoggedIn } = useAuthUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      const currentPath = window.location.pathname;
      router.push(`${loginPath}?callbackUrl=${encodeURIComponent(currentPath)}`);
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, loginPath, router]);

  if (loading) {
    return <LoadingOverlay message="Checking authentication..." />;
  }

  return isLoggedIn ? <>{children}</> : null;
};

export default AuthGuard;
