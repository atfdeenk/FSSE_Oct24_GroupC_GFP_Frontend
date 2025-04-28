import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { useCallback } from 'react';

/**
 * useProtectedAction
 * Wraps an action so it only runs if the user is authenticated.
 * If not, redirects to login (with redirect query).
 * Optionally, you can provide a custom onUnauthenticated handler.
 */
export function useProtectedAction(
  action: (...args: any[]) => void | Promise<void>,
  options?: {
    onUnauthenticated?: () => void;
    loginRedirectPath?: string;
  }
) {
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(
    async (...args: any[]) => {
      if (isAuthenticated()) {
        return action(...args);
      } else {
        if (options?.onUnauthenticated) {
          options.onUnauthenticated();
        } else {
          // Default: redirect to login with redirect path
          const redirectPath = options?.loginRedirectPath || pathname || '/';
          router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
        }
      }
    },
    [action, options, router, pathname]
  );
}
