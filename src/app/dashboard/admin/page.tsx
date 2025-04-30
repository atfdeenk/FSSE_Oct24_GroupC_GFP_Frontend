'use client';

import { useEffect, useState } from 'react';
import { RoleGuard } from '@/components/guards';
import { getUserRole } from '@/lib/auth';

export default function AdminDashboardPage() {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setUserRole(getUserRole());
  }, []);

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-lg mb-4">Welcome to the admin dashboard!</p>
          <p className="mb-4">You are logged in as: <span className="font-semibold">{userRole}</span></p>
          <p className="text-sm text-gray-600">
            This page is only accessible to users with the admin role.
          </p>
        </div>
      </div>
    </RoleGuard>
  );
}
