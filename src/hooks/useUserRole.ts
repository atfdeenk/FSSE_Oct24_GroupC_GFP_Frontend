"use client";
import { useState, useEffect } from "react";
import { getUserRole } from "@/lib/auth";

/**
 * Custom hook to provide reactive user role updates.
 * Returns the user's current role (string | null).
 */
export function useUserRole() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Function to refresh the role
  const refreshRole = async () => {
    setLoading(true);
    try {
      const userRole = await getUserRole();
      setRole(userRole);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch the role when the component mounts
    refreshRole();

    // Listen for role changes (if you have a global event system, add here)
    // For now, just provide a manual update function if needed.
  }, []);

  return { role, loading, refreshRole };
}
