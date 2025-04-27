import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

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
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated
    const auth = isAuthenticated();
    
    if (!auth) {
      // Redirect to login with callback URL
      const currentPath = window.location.pathname;
      router.push(`${loginPath}?callbackUrl=${encodeURIComponent(currentPath)}`);
    } else {
      setAuthenticated(true);
    }
    
    setLoading(false);
  }, [loginPath, router]);
  
  // Show loading state or render children if authenticated
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  return authenticated ? <>{children}</> : null;
};

export default AuthGuard;
