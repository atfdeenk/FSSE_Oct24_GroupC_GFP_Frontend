"use client";
import { useState, useEffect } from "react";
import { getUserRole } from "@/lib/auth";

/**
 * Custom hook to provide reactive user role updates.
 * Returns the user's current role (string | null).
 */
export function useUserRole() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Get initial role
    setRole(getUserRole());

    // Listen for role changes (if you have a global event system, add here)
    // For now, just provide a manual update function if needed.
  }, []);

  return role;
}
