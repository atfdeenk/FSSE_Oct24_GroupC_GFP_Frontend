"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RegisterForm, Footer } from "@/components";
import { isAuthenticated } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/');
    }
  }, [router]);

  const handleRegister = (userData: any) => {
    // User is now registered and logged in, redirect to home page or dashboard
    router.push("/");
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
              <li><a href="/login" className="text-amber-500 hover:text-amber-400 transition-colors">Login</a></li>
            </ul>
          </nav>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow flex items-center justify-center px-6 py-12 bg-[url('/coffee-farm-dark.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative z-10 w-full max-w-md">
          <RegisterForm onRegister={handleRegister} error={error || undefined} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
