import { useState, useCallback } from "react";
import { isAuthenticated, getCurrentUser, AuthUser } from "@/lib/auth";

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
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

  return { user, isLoggedIn, refreshUser, setUser, setIsLoggedIn };
}
