'use client';

import React from 'react';

interface AdminCardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
}

export default function AdminCard({ 
  title, 
  children, 
  icon, 
  className = '', 
  headerAction,
  footer
}: AdminCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {icon && <div className="text-amber-500">{icon}</div>}
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
        {headerAction && <div>{headerAction}</div>}
      </div>
      <div className="p-6">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
}
