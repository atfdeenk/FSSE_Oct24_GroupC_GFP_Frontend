"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import CartWidget from "@/components/ui/CartWidget";
import WishlistWidget from "@/components/ui/WishlistWidget";
import AuthButtons from "@/components/ui/AuthButtons";
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
            <div className="relative" ref={userMenuRef}>
              <button
                className="flex items-center focus:outline-none"
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-expanded={showUserMenu}
                aria-haspopup="true"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-500/30 bg-neutral-800 flex items-center justify-center">
                  {user?.first_name ? (
                    <span className="text-amber-500 font-bold">
                      {user.first_name.charAt(0)}{user.last_name?.charAt(0)}
                    </span>
                  ) : (
                    <svg className="w-6 h-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <svg className={`w-4 h-4 ml-1 text-white/70 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-white/10 rounded-sm shadow-xl z-50 animate-fade-in-down">
                  <div className="p-3 border-b border-white/10">
                    <p className="text-white font-medium">{user?.first_name} {user?.last_name}</p>
                    <p className="text-white/60 text-sm truncate">{user?.email}</p>
                  </div>
                  <ul>
                    <li>
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-white/80 hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-white/80 hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        My Orders
                      </Link>
                    </li>
                    {user?.role === 'seller' && (
                      <li>
                        <Link
                          href="/seller/products"
                          className="block px-4 py-2 text-white/80 hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          My Products
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-white/80 hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Settings
                      </Link>
                    </li>
                    <li className="border-t border-white/10">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
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
                  <svg className="w-6 h-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
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
                        <svg className="w-5 h-5 mr-3 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign In</span>
                      </Link>
                    </li>
                    <li className="border-t border-white/10">
                      <Link
                        href="/register"
                        className="flex items-center px-4 py-3 text-white hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-5 h-5 mr-3 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <span>Sign Up</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              )}

              {/* Desktop buttons - only visible on md screens and up */}
              <AuthButtons />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
