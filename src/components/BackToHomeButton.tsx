"use client";

import { useRouter } from "next/navigation";

interface BackToHomeButtonProps {
  className?: string;
}

export default function BackToHomeButton({ className = "" }: BackToHomeButtonProps) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={`group p-2 text-amber-500 hover:text-amber-400 transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400/60 flex items-center justify-center ${className}`}
      onClick={() => router.push('/')}
      aria-label="Back to home"
      title="Back to Home"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span className="hidden sm:inline ml-1 text-sm font-semibold">Back</span>
    </button>
  );
}

