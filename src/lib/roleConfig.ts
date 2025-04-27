/**
 * Role-based access configuration
 * 
 * This file defines which frontend routes are accessible to which user roles.
 * It's used by the RoleGuard component to protect routes based on user roles.
 */

// Define user roles
export type UserRole = 'admin' | 'vendor' | 'customer';

// Define route permissions
export interface RoutePermission {
  path: string;
  allowedRoles: UserRole[];
  description: string;
}

// Define all protected routes with their allowed roles
export const protectedRoutes: RoutePermission[] = [
  // Admin routes
  {
    path: '/dashboard/admin',
    allowedRoles: ['admin'],
    description: 'Admin dashboard - only accessible to administrators'
  },
  {
    path: '/dashboard/users',
    allowedRoles: ['admin'],
    description: 'User management - only accessible to administrators'
  },
  
  // Vendor routes
  {
    path: '/dashboard/vendor',
    allowedRoles: ['admin', 'vendor'],
    description: 'Vendor dashboard - accessible to vendors and administrators'
  },
  {
    path: '/dashboard/products/manage',
    allowedRoles: ['admin', 'vendor'],
    description: 'Product management - accessible to vendors and administrators'
  },
  
  // Customer routes
  {
    path: '/dashboard/orders',
    allowedRoles: ['admin', 'vendor', 'customer'],
    description: 'Orders - accessible to all authenticated users'
  },
  {
    path: '/dashboard/profile',
    allowedRoles: ['admin', 'vendor', 'customer'],
    description: 'User profile - accessible to all authenticated users'
  },
  {
    path: '/checkout',
    allowedRoles: ['customer'],
    description: 'Checkout - only accessible to customers'
  }
];

/**
 * Check if a user with the given role is allowed to access a specific route
 */
export const isRouteAllowed = (path: string, role: UserRole | null): boolean => {
  if (!role) return false;
  
  // Find the matching route configuration
  const matchingRoute = protectedRoutes.find(route => 
    path.startsWith(route.path)
  );
  
  // If no matching route found or user role is in allowed roles, return true
  return !matchingRoute || matchingRoute.allowedRoles.includes(role);
};

/**
 * Get the fallback path for a user based on their role
 */
export const getFallbackPath = (role: UserRole | null): string => {
  if (!role) return '/login';
  
  switch (role) {
    case 'admin':
      return '/dashboard/admin';
    case 'vendor':
      return '/dashboard/vendor';
    case 'customer':
      return '/dashboard';
    default:
      return '/';
  }
};
