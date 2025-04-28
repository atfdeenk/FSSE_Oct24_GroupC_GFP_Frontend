"use client";

import React from 'react';

interface SelectionControlsProps {
  onSelectAll: () => void;
  onDeselectAll: () => void;
  selectedCount: number;
  totalCount: number;
  className?: string;
  showCount?: boolean;
  buttonOnly?: boolean;
}

/**
 * A reusable component for select all/deselect all functionality
 */
const SelectionControls: React.FC<SelectionControlsProps> = ({
  onSelectAll,
  onDeselectAll,
  selectedCount,
  totalCount,
  className = '',
  showCount = true,
  buttonOnly = false,
}) => {
  // Check if all items are selected
  const areAllItemsSelected = selectedCount === totalCount && totalCount > 0;
  
  // Handle toggle click
  const handleToggleClick = () => {
    if (areAllItemsSelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  };
  
  // If buttonOnly is true, just render the toggle button
  if (buttonOnly) {
    return (
      <button 
        onClick={handleToggleClick}
        className="bg-neutral-800 hover:bg-neutral-700 border border-white/10 rounded-md px-4 py-2 text-sm transition-colors"
      >
        {areAllItemsSelected ? 'Deselect All' : 'Select All'}
      </button>
    );
  }
  
  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {showCount && (
        <div className="text-sm text-white/70">
          <span className="font-medium text-white">{selectedCount}</span> of {totalCount} selected
        </div>
      )}
      <button
        onClick={handleToggleClick}
        className="px-3 py-1 text-xs bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-sm transition-colors"
      >
        {areAllItemsSelected ? 'Deselect All' : 'Select All'}
      </button>
    </div>
  );
};

export default SelectionControls;
