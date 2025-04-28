"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoginForm from "../../components/LoginForm";
import Footer from "../../components/Footer";
import { isAuthenticated } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Check if user is already logged in and handle URL parameters
  useEffect(() => {
    // Check for message in URL (e.g., session expired)
    const urlMessage = searchParams.get('message');
    if (urlMessage) {
      setMessage(urlMessage);
    }
    
    // Check for redirect parameter
    const redirect = searchParams.get('redirect');
    
    // If user is authenticated, redirect them
    if (isAuthenticated()) {
      if (redirect) {
        router.push(redirect);
      } else {
        router.push('/');
      }
    }
  }, [router, searchParams]);

  const handleLogin = (userData: any) => {
    // Get the redirect URL from search params if it exists
    const redirect = searchParams.get('redirect');
    
    // User is now logged in, redirect to the original page or home
    if (redirect) {
      router.push(redirect);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Header/Navigation */}
      <header className="w-full bg-black border-b border-white/10 py-4">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-white">bumibrew</a>
          <nav>
            <ul className="flex space-x-6">
              <li><a href="/" className="text-white/70 hover:text-amber-400 transition-colors">Home</a></li>
              <li><a href="/products" className="text-white/70 hover:text-amber-400 transition-colors">Shop</a></li>
              <li><a href="/register" className="text-amber-500 hover:text-amber-400 transition-colors">Register</a></li>
            </ul>
          </nav>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow flex items-center justify-center px-6 py-12 bg-[url('/coffee-beans-dark.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative z-10 w-full max-w-md">
          {message && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-sm text-amber-400">
              {message}
            </div>
          )}
          <LoginForm onLogin={handleLogin} error={error || undefined} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
