'use client';

import React from 'react';
import { FaUsers } from 'react-icons/fa';

interface UserHeaderProps {
  title: string;
  description: string;
}

export default function UserHeader({ title, description }: UserHeaderProps) {
  return (
    <div className="flex items-start mb-6">
      <div className="bg-amber-100 p-3 rounded-lg mr-4">
        <FaUsers className="text-amber-600 text-xl" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
}
