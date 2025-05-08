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
      <div className="bg-amber-600/20 p-3 rounded-lg mr-4 shadow-md border border-amber-600/30">
        <FaUsers className="text-amber-500 text-xl" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="text-neutral-400 mt-1">{description}</p>
      </div>
    </div>
  );
}
