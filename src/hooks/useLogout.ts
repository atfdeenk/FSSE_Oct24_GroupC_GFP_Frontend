import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import { toast } from "react-hot-toast";

/**
 * Provides a logout function that handles state reset and redirect.
 * Returns a function: (isExpiredOrEvent?: boolean | React.MouseEvent) => void
 */
export function useLogout({
  setIsLoggedIn,
  setUser,
  setCartCount,
  setWishlistCount,
  setShowUserMenu,
}: {
  setIsLoggedIn: (v: boolean) => void;
  setUser: (v: any) => void;
  setCartCount: (v: number) => void;
  setWishlistCount: (v: number) => void;
  setShowUserMenu: (v: boolean) => void;
}) {
  const router = useRouter();

  return useCallback(
    (isExpiredOrEvent: boolean | React.MouseEvent = false) => {
      logout();
      setIsLoggedIn(false);
      setUser(null);
      setCartCount(0);
      setWishlistCount(0);
      setShowUserMenu(false);
      
      // Show success notification
      toast.success('You have been signed out');

      const isExpired = typeof isExpiredOrEvent === "boolean" && isExpiredOrEvent;
      if (isExpired) {
        router.push("/login?message=Your session has expired. Please log in again.");
      } else {
        router.push("/");
      }
    },
    [router, setIsLoggedIn, setUser, setCartCount, setWishlistCount, setShowUserMenu]
  );
}
