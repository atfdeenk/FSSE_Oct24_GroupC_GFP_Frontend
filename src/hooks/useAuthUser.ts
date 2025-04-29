"use client";

import { useState, useCallback, useEffect } from "react";
import { isAuthenticated, getCurrentUser, AuthUser } from "@/lib/auth";

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  // Always initialize with false to avoid hydration mismatch
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Fetch and update user state
  const refreshUser = useCallback(async () => {
    console.log('[useAuthUser] Refreshing user');
    const authStatus = isAuthenticated();
    console.log('[useAuthUser] Auth status:', authStatus);
    setIsLoggedIn(authStatus);
    
    if (authStatus) {
      try {
        const currentUser = await getCurrentUser();
        console.log('[useAuthUser] Current user:', currentUser);
        setUser(currentUser);
      } catch (error) {
        console.error('[useAuthUser] Error getting current user:', error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  // Listen for login/logout events
  useEffect(() => {
    const handleLoginEvent = () => {
      console.log('[useAuthUser] Login event detected');
      refreshUser();
    };

    const handleLogoutEvent = () => {
      console.log('[useAuthUser] Logout event detected');
      setIsLoggedIn(false);
      setUser(null);
    };

    // Check authentication status on mount
    refreshUser();

    // Add event listeners
    window.addEventListener('user:login', handleLoginEvent);
    window.addEventListener('user:logout', handleLogoutEvent);

    // Cleanup
    return () => {
      window.removeEventListener('user:login', handleLoginEvent);
      window.removeEventListener('user:logout', handleLogoutEvent);
    };
  }, [refreshUser]);

  // Debug: log state changes
  useEffect(() => {
    console.log('[useAuthUser] isLoggedIn changed:', isLoggedIn);
  }, [isLoggedIn]);

  return { user, isLoggedIn, refreshUser, setUser, setIsLoggedIn };
}
