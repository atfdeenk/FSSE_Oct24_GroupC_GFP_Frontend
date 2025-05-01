"use client";
import React, { useEffect, useState } from "react";
import { getCurrentUser, isAuthenticated } from "@/lib/auth";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  avatar_url?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      setError("");
      try {
        if (!isAuthenticated()) {
          setError("You must be logged in to view your profile.");
          setLoading(false);
          return;
        }
        const userData = await getCurrentUser();
        if (userData) {
          setUser({
            first_name: userData.first_name ?? "",
            last_name: userData.last_name ?? "",
            email: userData.email ?? "",
            role: userData.role ?? ""
          });
        }
      } catch (err: any) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <LoadingOverlay message="Loading profile..." />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-red-400 font-semibold mb-2">{error}</p>
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto px-6 py-12 bg-neutral-900/80 rounded-md shadow-lg mt-12 animate-fade-in">
      <div className="flex flex-col items-center mb-8">
        <img
          src={"https://ui-avatars.com/api/?name=" + encodeURIComponent(user.first_name + " " + user.last_name) + "&background=amber&color=fff"}
          alt="User avatar"
          className="w-24 h-24 rounded-full mb-4 object-cover border-4 border-amber-500/30 bg-neutral-800"
        />
        <h1 className="text-2xl font-bold text-white mb-1">{user.first_name} {user.last_name}</h1>
        <p className="text-white/70 mb-1">{user.email}</p>
        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium mt-2">
          {user.role === "seller" ? "Seller" : "Consumer"}
        </span>
      </div>
      {/* Profile details section (add more fields or edit functionality as needed) */}
      <div className="space-y-4">
        <div>
          <span className="text-white/60">Full Name:</span>
          <span className="ml-2 text-white font-medium">{user.first_name} {user.last_name}</span>
        </div>
        <div>
          <span className="text-white/60">Email:</span>
          <span className="ml-2 text-white font-medium">{user.email}</span>
        </div>
        <div>
          <span className="text-white/60">Role:</span>
          <span className="ml-2 text-white font-medium capitalize">{user.role}</span>
        </div>
      </div>
      {/* Future: Add edit profile, password change, etc. */}
    </div>
  );
}
