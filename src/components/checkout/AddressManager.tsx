"use client";

import React from 'react';
import { User } from '@/services/api/users';

interface Address {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

interface AddressManagerProps {
  user: User | null;
  savedAddresses: Address[];
  selectedAddress: Address;
  showNewAddressForm: boolean;
  showSavedAddresses: boolean;
  newAddress: Address;
  onSelectAddress: (address: Address) => void;
  onToggleNewAddressForm: () => void;
  onToggleSavedAddresses: () => void;
  onAddressChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSaveNewAddress: () => void;
}

const AddressManager: React.FC<AddressManagerProps> = ({
  user,
  savedAddresses,
  selectedAddress,
  showNewAddressForm,
  showSavedAddresses,
  newAddress,
  onSelectAddress,
  onToggleNewAddressForm,
  onToggleSavedAddresses,
  onAddressChange,
  onSaveNewAddress
}) => {
  return (
    <div className="bg-neutral-900/80 backdrop-blur-sm rounded-lg border border-white/10 p-6 mb-6">
      <h2 className="text-xl font-bold text-white mb-4">Shipping Address</h2>
      
      {/* Selected Address Display */}
      {!showNewAddressForm && (
        <div className="mb-4">
          <div className="bg-black/30 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-white">{selectedAddress.fullName}</h3>
              {savedAddresses.length > 1 && (
                <button 
                  onClick={onToggleSavedAddresses}
                  className="text-amber-500 text-sm hover:text-amber-400 transition-colors"
                >
                  Change
                </button>
              )}
            </div>
            <p className="text-white/70 text-sm">
              {selectedAddress.address}<br />
              {selectedAddress.city}, {selectedAddress.postalCode}<br />
              {selectedAddress.phone}
            </p>
          </div>
          
          {/* Saved Addresses List */}
          {showSavedAddresses && savedAddresses.length > 0 && (
            <div className="mb-4 space-y-3">
              <h3 className="font-medium text-white mb-2">Saved Addresses</h3>
              {savedAddresses.map((address) => (
                <div 
                  key={address.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedAddress.id === address.id 
                      ? 'border-amber-500 bg-amber-500/10' 
                      : 'border-white/10 hover:border-white/30'
                  }`}
                  onClick={() => onSelectAddress(address)}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-white">{address.fullName}</h4>
                    {selectedAddress.id === address.id && (
                      <span className="text-amber-500 text-sm">Selected</span>
                    )}
                  </div>
                  <p className="text-white/70 text-sm">
                    {address.address}<br />
                    {address.city}, {address.postalCode}
                  </p>
                </div>
              ))}
            </div>
          )}
          
          <button 
            onClick={onToggleNewAddressForm}
            className="text-amber-500 hover:text-amber-400 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Address
          </button>
        </div>
      )}
      
      {/* New Address Form */}
      {showNewAddressForm && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-white/70 text-sm mb-1">Full Name</label>
              <input 
                type="text" 
                name="fullName"
                value={newAddress.fullName}
                onChange={onAddressChange}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1">Email</label>
              <input 
                type="email" 
                name="email"
                value={newAddress.email}
                onChange={onAddressChange}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                placeholder="Your email address"
                required
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1">Phone</label>
              <input 
                type="tel" 
                name="phone"
                value={newAddress.phone}
                onChange={onAddressChange}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                placeholder="Your phone number"
                required
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1">Postal Code</label>
              <input 
                type="text" 
                name="postalCode"
                value={newAddress.postalCode}
                onChange={onAddressChange}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                placeholder="Postal code"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-white/70 text-sm mb-1">Address</label>
              <input 
                type="text" 
                name="address"
                value={newAddress.address}
                onChange={onAddressChange}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                placeholder="Street address"
                required
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1">City</label>
              <input 
                type="text" 
                name="city"
                value={newAddress.city}
                onChange={onAddressChange}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                placeholder="City"
                required
              />
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={onSaveNewAddress}
              className="px-4 py-2 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors"
              disabled={!newAddress.fullName || !newAddress.email || !newAddress.phone || !newAddress.address || !newAddress.city || !newAddress.postalCode}
            >
              Save Address
            </button>
            <button 
              onClick={onToggleNewAddressForm}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressManager;
