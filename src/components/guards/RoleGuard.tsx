"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthUser } from '@/hooks/useAuthUser';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import { useUserRole } from '@/hooks/useUserRole';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallbackPath?: string;
  loginPath?: string;
}

/**
 * Component to protect routes based on user roles
 * Use this component to wrap pages that should only be accessible to users with specific roles
 */
const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallbackPath = '/dashboard',
  loginPath = '/login',
}) => {
  const router = useRouter();
  const { isLoggedIn } = useAuthUser();
  const role = useUserRole();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If no allowedRoles specified, allow everyone (guests and logged in)
    if (!allowedRoles || allowedRoles.length === 0) {
      setIsAuthorized(true);
      setLoading(false);
      return;
    }

    // If allowedRoles specified, require login
    if (!isLoggedIn) {
      router.push(loginPath);
      return;
    }

    // Wait for role to load
    if (role === null) {
      return;
    }

    if (allowedRoles.includes(role)) {
      setIsAuthorized(true);
    } else {
      router.push(fallbackPath);
    }
    setLoading(false);
  }, [isLoggedIn, role, allowedRoles, fallbackPath, loginPath, router]);

  if (loading || (allowedRoles && allowedRoles.length > 0 && role === null)) return <LoadingIndicator />;
  return isAuthorized ? <>{children}</> : null;

};

export default RoleGuard;
