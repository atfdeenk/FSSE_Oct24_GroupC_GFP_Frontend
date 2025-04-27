import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole, isAuthenticated } from '@/lib/auth';

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
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      // Redirect to login with callback URL
      const currentPath = window.location.pathname;
      router.push(`${loginPath}?callbackUrl=${encodeURIComponent(currentPath)}`);
      return;
    }
    
    // Check if user has required role
    const userRole = getUserRole();
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      // User doesn't have required role, redirect to fallback path
      router.push(fallbackPath);
    } else {
      // User is authorized
      setIsAuthorized(true);
    }
    
    setLoading(false);
  }, [allowedRoles, fallbackPath, loginPath, router]);
  
  // Show loading state or render children if authorized
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  return isAuthorized ? <>{children}</> : null;
};

export default RoleGuard;
