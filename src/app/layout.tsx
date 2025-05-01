import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Import our centralized toast system
import { Toaster, toastOptions } from "@/utils/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "bumibrew",
  description: "Building sustainable communities, one purchase at a time.",
};

// Using centralized toast system from @/utils/toast

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        {/* Portal container for modals */}
        <div id="modal-root"></div>
        <Toaster position="top-right" toastOptions={toastOptions} />
      </body>
    </html>
  );
}
