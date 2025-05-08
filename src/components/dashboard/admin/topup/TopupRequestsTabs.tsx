interface TopupRequestsTabsProps {
  activeTab: 'all' | 'pending' | 'approved' | 'rejected';
  onTabChange: (tab: 'all' | 'pending' | 'approved' | 'rejected') => void;
  counts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export default function TopupRequestsTabs({ activeTab, onTabChange, counts }: TopupRequestsTabsProps) {
  return (
    <div className="flex flex-wrap border-b border-neutral-700 mb-4">
      <button
        className={`py-3 px-6 font-medium text-sm transition-all duration-200 ${activeTab === 'all' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-neutral-400 hover:text-neutral-200'}`}
        onClick={() => onTabChange('all')}
      >
        All Requests
        <span className="ml-2 bg-neutral-700 text-neutral-300 py-0.5 px-2 rounded-full text-xs border border-neutral-600">
          {counts.all}
        </span>
      </button>
      <button
        className={`py-3 px-6 font-medium text-sm transition-all duration-200 ${activeTab === 'pending' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-neutral-400 hover:text-neutral-200'}`}
        onClick={() => onTabChange('pending')}
      >
        Pending
        <span className="ml-2 bg-amber-900/20 text-amber-400 py-0.5 px-2 rounded-full text-xs border border-amber-700/50">
          {counts.pending}
        </span>
      </button>
      <button
        className={`py-3 px-6 font-medium text-sm transition-all duration-200 ${activeTab === 'approved' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-neutral-400 hover:text-neutral-200'}`}
        onClick={() => onTabChange('approved')}
      >
        Approved
        <span className="ml-2 bg-green-900/20 text-green-400 py-0.5 px-2 rounded-full text-xs border border-green-700/50">
          {counts.approved}
        </span>
      </button>
      <button
        className={`py-3 px-6 font-medium text-sm transition-all duration-200 ${activeTab === 'rejected' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-neutral-400 hover:text-neutral-200'}`}
        onClick={() => onTabChange('rejected')}
      >
        Rejected
        <span className="ml-2 bg-red-900/20 text-red-400 py-0.5 px-2 rounded-full text-xs border border-red-700/50">
          {counts.rejected}
        </span>
      </button>
    </div>
  );
}
