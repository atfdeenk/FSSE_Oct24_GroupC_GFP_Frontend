"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/utils/format';
import { useBalance } from '@/hooks/useBalance';
import BalanceDisplay from '@/components/ui/BalanceDisplay';
import { toast } from 'react-hot-toast';

interface CheckoutFormProps {
  orderTotal: number;
  onSubmit: (formData: CheckoutFormData) => Promise<void>;
  isSubmitting: boolean;
}

export interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
  paymentMethod: 'balance' | 'cod';
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  orderTotal,
  onSubmit,
  isSubmitting
}) => {
  const router = useRouter();
  const { balance } = useBalance();
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: '',
    paymentMethod: 'balance'
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name as keyof CheckoutFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CheckoutFormData, string>> = {};
    
    // Required fields
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    
    // Check if balance is sufficient when using balance payment
    if (formData.paymentMethod === 'balance' && balance < orderTotal) {
      newErrors.paymentMethod = 'Insufficient balance for this order';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        toast.loading('Processing your order...', { id: 'checkout' });
        await onSubmit(formData);
      } catch (error) {
        console.error('Checkout error:', error);
        toast.error('Failed to process your order. Please try again.', { id: 'checkout' });
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipping Address Section */}
      <div className="bg-neutral-900/80 backdrop-blur-sm rounded-lg shadow-sm border border-white/10 overflow-hidden">
        <div className="bg-green-900/30 px-6 py-4 border-b border-white/10 flex items-center">
          <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white">Shipping Address</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullName" className="block text-white/70 text-sm font-medium mb-2">Full Name*</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full bg-black/50 border ${errors.fullName ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500`}
                placeholder="Enter your full name"
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-white/70 text-sm font-medium mb-2">Email Address*</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full bg-black/50 border ${errors.email ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500`}
                placeholder="Enter your email address"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-white/70 text-sm font-medium mb-2">Phone Number*</label>
              <div className="relative">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full bg-black/50 border ${errors.phone ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500`}
                  placeholder="Enter your phone number"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-white/40">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
            
            <div>
              <label htmlFor="city" className="block text-white/70 text-sm font-medium mb-2">City*</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full bg-black/50 border ${errors.city ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500`}
                placeholder="Enter your city"
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>
            
            <div>
              <label htmlFor="postalCode" className="block text-white/70 text-sm font-medium mb-2">Postal Code*</label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className={`w-full bg-black/50 border ${errors.postalCode ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500`}
                placeholder="Enter your postal code"
              />
              {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-white/70 text-sm font-medium mb-2">Complete Address*</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className={`w-full bg-black/50 border ${errors.address ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500`}
                placeholder="Enter your complete address (street name, building number, etc.)"
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-white/70 text-sm font-medium mb-2">Order Notes (Optional)</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
                placeholder="Add any special instructions for your order or delivery"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Method Section */}
      <div className="bg-neutral-900/80 backdrop-blur-sm rounded-lg shadow-sm border border-white/10 overflow-hidden">
        <div className="bg-green-900/30 px-6 py-4 border-b border-white/10 flex items-center">
          <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white">Payment Method</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <div 
              className={`flex-1 p-4 border rounded-lg cursor-pointer transition-colors ${formData.paymentMethod === 'balance' ? 'bg-green-900/30 border-green-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'} ${balance < orderTotal ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => {
                if (balance >= orderTotal) {
                  setFormData(prev => ({ ...prev, paymentMethod: 'balance' }));
                } else {
                  toast.error('Insufficient balance for this order. Please add funds or use Cash on Delivery.');
                }
              }}
            >
              <input
                type="radio"
                id="balance"
                name="paymentMethod"
                value="balance"
                checked={formData.paymentMethod === 'balance'}
                onChange={handleChange}
                className="w-5 h-5 text-green-500 focus:ring-green-400 border-white/30 bg-black"
                disabled={balance < orderTotal}
              />
              <label htmlFor="balance" className={`ml-3 flex flex-col ${balance < orderTotal ? 'text-white/40' : 'text-white'}`}>
                <span className="font-medium">Pay with Balance</span>
                <span className="text-sm text-white/60">Current balance: {formatCurrency(balance)}</span>
              </label>
              
              {balance < orderTotal && (
                <div className="ml-auto bg-red-900/30 text-red-400 text-xs font-medium px-2 py-1 rounded">
                  Insufficient funds
                </div>
              )}
              
              {balance >= orderTotal && (
                <div className="ml-auto bg-green-900/30 text-green-400 text-xs font-medium px-2 py-1 rounded">
                  Sufficient funds
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3 mb-4">
            <div 
              className={`flex-1 p-4 border rounded-lg cursor-pointer transition-colors ${formData.paymentMethod === 'cod' ? 'bg-green-900/30 border-green-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'cod' }))}
            >
              <input
                type="radio"
                id="cod"
                name="paymentMethod"
                value="cod"
                checked={formData.paymentMethod === 'cod'}
                onChange={handleChange}
                className="w-5 h-5 text-green-500 focus:ring-green-400 border-white/30 bg-black"
              />
              <label htmlFor="cod" className="ml-3 flex flex-col text-white">
                <span className="font-medium">Cash on Delivery</span>
                <span className="text-sm text-white/60">Pay when you receive your order</span>
              </label>
              
              <div className="ml-auto">
                <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {errors.paymentMethod && (
            <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>
          )}
          
          <div className="mt-4 p-4 bg-amber-900/20 border border-amber-500/20 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-400">Payment Information</h3>
                <div className="mt-1 text-sm text-amber-300/80">
                  <p>Your order total is {formatCurrency(orderTotal)}.</p>
                  {balance < orderTotal ? (
                    <p className="mt-1">Your current balance ({formatCurrency(balance)}) is insufficient for this purchase. Please use Cash on Delivery or add funds to your balance.</p>
                  ) : (
                    <p className="mt-1">Your current balance ({formatCurrency(balance)}) is sufficient for this purchase.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="sticky bottom-0 bg-neutral-900/90 backdrop-blur-md border-t border-white/10 p-4 flex flex-col sm:flex-row gap-3 justify-between shadow-lg rounded-t-lg">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Cart
        </button>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors flex items-center justify-center gap-2 font-medium disabled:bg-green-800/50 disabled:text-white/50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Order...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Place Order Now
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default CheckoutForm;
