'use client';

import React from 'react';
import { Tab } from '@headlessui/react';

interface UserTabsProps {
  activeTab: 'all' | 'admin' | 'customer' | 'seller';
  onTabChange: (tab: 'all' | 'admin' | 'customer' | 'seller') => void;
  counts: {
    all: number;
    admin: number;
    customer: number;
    seller: number;
  };
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function UserTabs({ activeTab, onTabChange, counts }: UserTabsProps) {
  const tabs = [
    { key: 'all' as const, label: 'All Users', count: counts.all },
    { key: 'admin' as const, label: 'Admins', count: counts.admin },
    { key: 'customer' as const, label: 'Customers', count: counts.customer },
    { key: 'seller' as const, label: 'Sellers', count: counts.seller },
  ];

  const selectedIndex = tabs.findIndex(tab => tab.key === activeTab);

  return (
    <div className="mb-6">
      <Tab.Group selectedIndex={selectedIndex} onChange={(index) => onTabChange(tabs[index].key)}>
        <Tab.List className="flex space-x-1 rounded-xl bg-neutral-800 p-1.5 border border-neutral-700 shadow-lg">
          {tabs.map((tab) => (
            <Tab
              key={tab.key}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-3 text-sm font-medium leading-5 transition-all duration-200',
                  'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-amber-500 ring-opacity-60',
                  selected
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md border border-amber-500/50'
                    : 'text-neutral-300 hover:bg-neutral-700 hover:text-white border border-transparent'
                )
              }
            >
              <span>{tab.label}</span>
              <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs ${
                activeTab === tab.key 
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50' 
                  : 'bg-neutral-700 text-neutral-400 border border-neutral-600'
              }`}>
                {tab.count}
              </span>
            </Tab>
          ))}
        </Tab.List>
      </Tab.Group>
    </div>
  );
}
