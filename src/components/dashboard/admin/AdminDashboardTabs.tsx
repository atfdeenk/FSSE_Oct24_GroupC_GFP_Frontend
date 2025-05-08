'use client';

import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import UserManagement from './UserManagement';
import AdminManagement from './AdminManagement';
import ProductApproval from './ProductApproval';
import BalanceManagement from './BalanceManagement';
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
    'Balance Management': () => <BalanceManagement />,
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
        <Tab.List className="flex space-x-1 rounded-xl bg-amber-900/20 p-1 mb-4">
          {Object.keys(categories).map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white/60 ring-offset-2 ring-offset-amber-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-amber-500 text-white shadow'
                    : 'text-amber-700 hover:bg-white/[0.12] hover:text-amber-500'
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
                'rounded-xl bg-white p-3',
                'ring-white/60 ring-offset-2 ring-offset-amber-400 focus:outline-none focus:ring-2'
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
