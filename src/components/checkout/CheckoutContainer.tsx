import React, { ReactNode } from 'react';
import { Header, Footer } from '@/components';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

interface CheckoutContainerProps {
  children: ReactNode;
  isSubmitting: boolean;
  title: string;
}

const CheckoutContainer: React.FC<CheckoutContainerProps> = ({ 
  children, 
  isSubmitting,
  title
}) => {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            <p className="text-white/60">Complete your purchase securely</p>
          </div>
          
          {children}
        </div>
      </main>
      <Footer />
      
      {/* Loading Overlay */}
      <LoadingOverlay visible={isSubmitting} />
    </div>
  );
};

export default CheckoutContainer;
