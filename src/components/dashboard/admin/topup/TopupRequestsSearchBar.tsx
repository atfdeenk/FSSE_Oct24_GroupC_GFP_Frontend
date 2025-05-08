import { FaSearch, FaSync } from 'react-icons/fa';

interface TopupRequestsSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  requestCount: number;
  onRefresh: () => void;
}

export default function TopupRequestsSearchBar({
  searchTerm,
  onSearchChange,
  requestCount,
  onRefresh
}: TopupRequestsSearchBarProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
      <div className="relative w-full md:w-64">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="h-4 w-4 text-neutral-500" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-neutral-700 rounded-md leading-5 bg-neutral-800 placeholder-neutral-500 text-neutral-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
          placeholder="Search requests..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="bg-neutral-800 border border-neutral-700 px-4 py-2 rounded-md text-sm text-amber-400 font-medium shadow-sm">
          {requestCount} {requestCount === 1 ? 'request' : 'requests'} found
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-amber-400 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-sm"
          title="Refresh requests"
        >
          <FaSync className="h-3 w-3" />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
}
