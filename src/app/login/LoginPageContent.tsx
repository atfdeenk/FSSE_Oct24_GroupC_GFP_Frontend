"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm, Footer } from "@/components";
import { isAuthenticated } from "@/lib/auth";

export default function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Check if user is already logged in and handle URL parameters
  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/");
    }
    // Handle potential messages from query params
    const msg = searchParams.get("message");
    const err = searchParams.get("error");
    if (msg) setMessage(msg);
    if (err) setError(err);
  }, [router, searchParams]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        {message && <div className="mb-4 text-green-600">{message}</div>}
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <LoginForm />
      </main>
      <Footer />
    </div>
  );
}
