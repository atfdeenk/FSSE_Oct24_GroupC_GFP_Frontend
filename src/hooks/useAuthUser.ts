"use client";

import { useState, useCallback, useEffect } from "react";
import { isAuthenticated, getCurrentUser, AuthUser } from "@/lib/auth";

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  // Always initialize with false to avoid hydration mismatch
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Fetch and update user state
  const refreshUser = useCallback(async () => {
    const authStatus = isAuthenticated();
    setIsLoggedIn(authStatus);
    
    if (authStatus) {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  // Listen for login/logout events
  useEffect(() => {
    const handleLoginEvent = () => {
      refreshUser();
    };

    const handleLogoutEvent = () => {
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

  return { user, isLoggedIn, refreshUser, setUser, setIsLoggedIn };
}
