"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import CartWidget from "@/components/ui/CartWidget";
import WishlistWidget from "@/components/ui/WishlistWidget";
import AuthButtons from "@/components/ui/AuthButtons";
import UserMenu from "@/components/ui/UserMenu";
import AvatarIcon from "@/components/ui/AvatarIcon";
import ChevronDownIcon from "@/components/ui/ChevronDownIcon";
import SignUpIcon from "@/components/ui/SignUpIcon";
import SignInIcon from "@/components/ui/SignInIcon";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated, getCurrentUser, logout, AuthUser } from "@/lib/auth";
import cartService from "@/services/api/cart";
import wishlistService from "@/services/api/wishlist";
import { TOKEN_EXPIRED_EVENT } from "@/constants";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check authentication status and load user data
    const initializeUser = async () => {
      const authStatus = isAuthenticated();
      setIsLoggedIn(authStatus);

      if (authStatus) {
        try {
          // Properly await the Promise from getCurrentUser
          const currentUser = await getCurrentUser();
          setUser(currentUser);

          // Fetch real cart and wishlist counts from API
          fetchCartCount();
          fetchWishlistCount();
        } catch (error) {
          console.error('Error getting current user:', error);
        }
      }
    };

    initializeUser();

    // Listen for token expiration events
    const handleTokenExpired = (event: CustomEvent) => {
      console.log('Token expired event received:', event.detail);
      handleLogout(true);
    };

    window.addEventListener(TOKEN_EXPIRED_EVENT, handleTokenExpired as EventListener);

    // Clean up event listener
    return () => {
      window.removeEventListener(TOKEN_EXPIRED_EVENT, handleTokenExpired as EventListener);
    };
  }, []);

  // Fetch cart count from API
  const fetchCartCount = async () => {
    try {
      const cartResponse = await cartService.getCart();
      if (cartResponse && cartResponse.data && cartResponse.data.items) {
        setCartCount(cartResponse.data.items.length);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  // Fetch wishlist count from API
  const fetchWishlistCount = async () => {
    try {
      const wishlistResponse = await wishlistService.getWishlist();
      if (wishlistResponse && wishlistResponse.data && wishlistResponse.data.items) {
        setWishlistCount(wishlistResponse.data.items.length);
      }
    } catch (error) {
      console.error('Error fetching wishlist count:', error);
    }
  };

  useEffect(() => {
    // Handle clicks outside of user menu to close it
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle logout with optional parameter for token expiration
  const handleLogout = (isExpiredOrEvent: boolean | React.MouseEvent = false) => {
    logout();
    setIsLoggedIn(false);
    setUser(null);
    setCartCount(0);
    setWishlistCount(0);
    setShowUserMenu(false);

    // Determine if this was triggered by token expiration
    const isExpired = typeof isExpiredOrEvent === 'boolean' && isExpiredOrEvent;

    // If token expired, redirect to login with message
    if (isExpired) {
      router.push("/login?message=Your session has expired. Please log in again.");
    } else {
      router.push("/");
    }
  };

  return (
    <header className="w-full bg-black border-b border-white/10 py-4 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center">
          <Logo />
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              <li>
                <Link href="/" className="text-white/70 hover:text-amber-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-white/70 hover:text-amber-400 transition-colors">
                  Shop
                </Link>
              </li>
              {pathname === '/' && (
                <li>
                  <Link href="#how-it-works" className="text-white/70 hover:text-amber-400 transition-colors">
                    How It Works
                  </Link>
                </li>
              )}
              {/* Only show on homepage */}
            </ul>
          </nav>
        </div>

        <div className="flex items-center space-x-6">
          <CartWidget count={cartCount} isLoggedIn={isLoggedIn} />

          <WishlistWidget count={wishlistCount} isLoggedIn={isLoggedIn} />

          {/* User Menu */}
          {isLoggedIn ? (
  <UserMenu
    user={user}
    show={showUserMenu}
    onToggle={() => setShowUserMenu(!showUserMenu)}
    onLogout={handleLogout}
    userMenuRef={userMenuRef}
  />
          ) : (
            <div className="relative" ref={userMenuRef}>
              {/* Single avatar icon for mobile */}
              <button
                className="md:hidden flex items-center focus:outline-none"
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-expanded={showUserMenu}
                aria-haspopup="true"
                aria-label="Account menu"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 bg-neutral-800 flex items-center justify-center">
                  <AvatarIcon />
                </div>
              </button>

              {/* Dropdown Menu for non-logged in users - only for mobile */}
              {showUserMenu && (
                <div className="md:hidden absolute right-0 mt-2 w-48 bg-neutral-900 border border-white/10 rounded-sm shadow-xl z-50 animate-fade-in-down">
                  <ul>
                    <li>
                      <Link
                        href="/login"
                        className="flex items-center px-4 py-3 text-white hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <SignInIcon className="w-5 h-5 mr-3 text-white/60" />
                        <span>Sign In</span>
                      </Link>
                    </li>
                    <li className="border-t border-white/10">
                      <Link
                        href="/register"
                        className="flex items-center px-4 py-3 text-white hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <SignUpIcon className="w-5 h-5 mr-3 text-white/60" />
                        <span>Sign Up</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
