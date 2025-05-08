'use client';

import React from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  sortable?: boolean;
  className?: string;
}

interface AdminTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  loading?: boolean;
  emptyMessage?: string;
  rowClassName?: (item: T) => string;
}

export default function AdminTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  sortColumn,
  sortDirection,
  onSort,
  loading = false,
  emptyMessage = 'No data available',
  rowClassName
}: AdminTableProps<T>) {
  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSort) return;
    
    const accessor = typeof column.accessor === 'string' 
      ? column.accessor 
      : column.header.toLowerCase().replace(/\s+/g, '_');
      
    onSort(accessor as string);
  };
  
  const renderSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;
    
    const accessor = typeof column.accessor === 'string' 
      ? column.accessor 
      : column.header.toLowerCase().replace(/\s+/g, '_');
      
    if (accessor === sortColumn) {
      return sortDirection === 'asc' ? <FaSortUp className="ml-1 text-amber-500" /> : <FaSortDown className="ml-1 text-amber-500" />;
    }
    
    return <FaSort className="ml-1 text-neutral-500" />;
  };

  if (loading) {
    return (
      <div className="w-full bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 overflow-hidden">
        <div className="p-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 overflow-hidden">
        <div className="p-8 text-center text-neutral-400">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-700">
          <thead className="bg-neutral-750">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`px-6 py-4 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider ${column.sortable ? 'cursor-pointer hover:bg-neutral-700 transition-colors' : ''} ${column.className || ''}`}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center">
                    {column.header}
                    {renderSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-neutral-800 divide-y divide-neutral-700">
            {data.map((item) => (
              <tr 
                key={keyExtractor(item)} 
                className={`${onRowClick ? 'cursor-pointer hover:bg-neutral-750 transition-colors' : ''} ${rowClassName ? rowClassName(item) : ''}`}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((column, index) => {
                  const value = typeof column.accessor === 'function' 
                    ? column.accessor(item) 
                    : item[column.accessor as keyof T];
                    
                  return (
                    <td key={index} className={`px-6 py-4 whitespace-nowrap text-sm text-neutral-300 ${column.className || ''}`}>
                      {value as React.ReactNode}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
