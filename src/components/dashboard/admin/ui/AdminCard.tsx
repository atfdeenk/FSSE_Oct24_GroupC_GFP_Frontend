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
    <div className={`bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-neutral-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {icon && <div className="text-amber-500">{icon}</div>}
          <h3 className="text-lg font-medium text-white">{title}</h3>
        </div>
        {headerAction && <div>{headerAction}</div>}
      </div>
      <div className="p-6">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-3 bg-neutral-750 border-t border-neutral-700">
          {footer}
        </div>
      )}
    </div>
  );
}
