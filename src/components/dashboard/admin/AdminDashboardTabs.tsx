'use client';

import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import UserManagement from './UserManagement';
import AdminManagement from './AdminManagement';
import ProductApproval from './ProductApproval';
import DashboardOverview from './DashboardOverview';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AdminDashboardTabs() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [categories] = useState({
    'Overview': () => <DashboardOverview />,
    'User Management': () => <UserManagement />,
    'Admin Management': () => <AdminManagement />,
    'Product Approval': () => <ProductApproval />,
  });

  // Check for selected tab in sessionStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const selectedTab = sessionStorage.getItem('selectedAdminTab');
      if (selectedTab) {
        // Find the index of the selected tab
        const tabIndex = Object.keys(categories).findIndex(tab => tab === selectedTab);
        if (tabIndex !== -1) {
          setSelectedIndex(tabIndex);
          // Clear the selection from sessionStorage
          sessionStorage.removeItem('selectedAdminTab');
        }
      }
    }
  }, [categories]);

  return (
    <div className="w-full px-2 py-4 sm:px-0">
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.List className="flex space-x-1 rounded-xl bg-neutral-800 p-1.5 mb-4 border border-neutral-700 shadow-lg">
          {Object.keys(categories).map((category) => (
            <Tab
              key={category}
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
              {category}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          {Object.values(categories).map((Component, idx) => (
            <Tab.Panel
              key={idx}
              className={classNames(
                'rounded-xl bg-transparent p-0',
                'focus:outline-none focus:ring-0'
              )}
            >
              <Component />
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
