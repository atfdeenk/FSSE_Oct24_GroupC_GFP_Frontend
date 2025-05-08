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
        <Tab.List className="flex space-x-1 rounded-xl bg-neutral-700/50 p-1 border border-neutral-600 shadow-md">
          {tabs.map((tab) => (
            <Tab
              key={tab.key}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-3 text-sm font-medium leading-5 transition-colors duration-200',
                  'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-amber-500 ring-opacity-60',
                  selected
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-neutral-300 hover:bg-neutral-600/70 hover:text-white'
                )
              }
            >
              <span>{tab.label}</span>
              <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs ${
                activeTab === tab.key ? 'bg-amber-500/80 text-white' : 'bg-neutral-600 text-neutral-300'
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
