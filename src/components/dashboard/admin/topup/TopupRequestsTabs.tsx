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
    <div className="flex flex-wrap border-b border-gray-200 mb-4">
      <button
        className={`py-3 px-6 font-medium text-sm transition-colors duration-200 ${activeTab === 'all' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-700'}`}
        onClick={() => onTabChange('all')}
      >
        All Requests
        <span className="ml-2 bg-gray-100 text-gray-700 py-0.5 px-2 rounded-full text-xs">
          {counts.all}
        </span>
      </button>
      <button
        className={`py-3 px-6 font-medium text-sm transition-colors duration-200 ${activeTab === 'pending' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-700'}`}
        onClick={() => onTabChange('pending')}
      >
        Pending
        <span className="ml-2 bg-yellow-100 text-yellow-800 py-0.5 px-2 rounded-full text-xs">
          {counts.pending}
        </span>
      </button>
      <button
        className={`py-3 px-6 font-medium text-sm transition-colors duration-200 ${activeTab === 'approved' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-700'}`}
        onClick={() => onTabChange('approved')}
      >
        Approved
        <span className="ml-2 bg-green-100 text-green-800 py-0.5 px-2 rounded-full text-xs">
          {counts.approved}
        </span>
      </button>
      <button
        className={`py-3 px-6 font-medium text-sm transition-colors duration-200 ${activeTab === 'rejected' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-700'}`}
        onClick={() => onTabChange('rejected')}
      >
        Rejected
        <span className="ml-2 bg-red-100 text-red-800 py-0.5 px-2 rounded-full text-xs">
          {counts.rejected}
        </span>
      </button>
    </div>
  );
}
