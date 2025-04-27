"use client";
import { useState } from "react";

export default function SellerModal({ show, onClose }: { show: boolean; onClose: () => void }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full relative animate-fade-in">
        <button
          className="absolute right-4 top-4 text-green-700 hover:text-green-900 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-green-900 mb-4 text-center">Become a Seller</h2>
        <p className="text-green-800 mb-4 text-center">Join <span className="font-bold text-green-700">bumibrew</span> as a local producer or artisan and reach more customers in your area.</p>
        <form className="flex flex-col gap-4">
          <input type="text" placeholder="Your Name" className="border rounded px-3 py-2" required />
          <input type="email" placeholder="Email Address" className="border rounded px-3 py-2" required />
          <input type="text" placeholder="Business Name" className="border rounded px-3 py-2" />
          <textarea placeholder="Tell us about your products..." className="border rounded px-3 py-2" rows={3} />
          <button type="submit" className="bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700 transition">Request Invite</button>
        </form>
        <p className="text-xs text-green-600 mt-4 text-center">We review all applications to ensure quality and community alignment.</p>
      </div>
    </div>
  );
}
