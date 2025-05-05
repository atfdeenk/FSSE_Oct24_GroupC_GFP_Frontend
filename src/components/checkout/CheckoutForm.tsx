"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/utils/format';
import { useBalance } from '@/hooks/useBalance';
import BalanceDisplay from '@/components/ui/BalanceDisplay';

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
      await onSubmit(formData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-neutral-900/80 backdrop-blur-sm rounded-md border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Shipping Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fullName" className="block text-white/70 text-sm mb-1">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full bg-black/50 border ${errors.fullName ? 'border-red-500' : 'border-white/20'} rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50`}
              placeholder="Your full name"
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-white/70 text-sm mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full bg-black/50 border ${errors.email ? 'border-red-500' : 'border-white/20'} rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50`}
              placeholder="Your email address"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-white/70 text-sm mb-1">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full bg-black/50 border ${errors.phone ? 'border-red-500' : 'border-white/20'} rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50`}
              placeholder="Your phone number"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>
          
          <div>
            <label htmlFor="city" className="block text-white/70 text-sm mb-1">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`w-full bg-black/50 border ${errors.city ? 'border-red-500' : 'border-white/20'} rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50`}
              placeholder="Your city"
            />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>
          
          <div>
            <label htmlFor="postalCode" className="block text-white/70 text-sm mb-1">Postal Code</label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              className={`w-full bg-black/50 border ${errors.postalCode ? 'border-red-500' : 'border-white/20'} rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50`}
              placeholder="Your postal code"
            />
            {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-white/70 text-sm mb-1">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className={`w-full bg-black/50 border ${errors.address ? 'border-red-500' : 'border-white/20'} rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50`}
              placeholder="Your full address"
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-white/70 text-sm mb-1">Order Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full bg-black/50 border border-white/20 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              placeholder="Any special instructions for your order"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-neutral-900/80 backdrop-blur-sm rounded-md border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Payment Method</h2>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="radio"
              id="balance"
              name="paymentMethod"
              value="balance"
              checked={formData.paymentMethod === 'balance'}
              onChange={handleChange}
              className="w-4 h-4 text-amber-500 focus:ring-amber-500 border-white/30 bg-black"
              disabled={balance < orderTotal}
            />
            <label htmlFor="balance" className={`ml-2 ${balance < orderTotal ? 'text-white/40' : 'text-white'}`}>
              Pay with Balance ({formatCurrency(balance)})
              {balance < orderTotal && (
                <span className="ml-2 text-red-400 text-xs">(Insufficient funds)</span>
              )}
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="radio"
              id="cod"
              name="paymentMethod"
              value="cod"
              checked={formData.paymentMethod === 'cod'}
              onChange={handleChange}
              className="w-4 h-4 text-amber-500 focus:ring-amber-500 border-white/30 bg-black"
            />
            <label htmlFor="cod" className="ml-2 text-white">Cash on Delivery</label>
          </div>
          
          {errors.paymentMethod && (
            <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>
          )}
          
          <div className="mt-4">
            <BalanceDisplay orderTotal={orderTotal} showSufficiency={true} />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-white/10 text-white rounded-md hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Cart
        </button>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-amber-500 text-black rounded-md hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 font-medium disabled:bg-amber-500/50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Complete Order
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default CheckoutForm;
