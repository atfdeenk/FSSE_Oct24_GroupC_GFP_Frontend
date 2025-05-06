"use client";

import { Suspense } from 'react';
import { Header, Footer } from '@/components';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

export default function CheckoutSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />
      <Suspense 
        fallback={
          <main className="flex-grow flex items-center justify-center">
            <LoadingOverlay visible={true} />
          </main>
        }
      >
        {children}
      </Suspense>
      <Footer />
    </div>
  );
}
