import { TopUpRequest } from '@/services/api/topup';
import { User } from '@/services/api/users';
import { formatApiTimestamp } from '@/utils/date';
import { formatCurrency } from '@/utils/format';
import Image from 'next/image';
import { FaUserCircle, FaMapMarkerAlt, FaClock, FaCalendarAlt } from 'react-icons/fa';

interface TopupRequestsTableProps {
  requests: TopUpRequest[];
  usersMap: Map<string | number, User>;
  sortConfig: { key: string; direction: 'ascending' | 'descending' } | null;
  onRequestSort: (key: string) => void;
  onViewDetails: (request: TopUpRequest) => void;
  searchTerm: string;
  onClearSearch: () => void;
}

export default function TopupRequestsTable({
  requests,
  usersMap,
  sortConfig,
  onRequestSort,
  onViewDetails,
  searchTerm,
  onClearSearch
}: TopupRequestsTableProps) {
  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="bg-amber-50 rounded-full p-4 mb-4">
            <svg className="h-12 w-12 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
          <p className="text-gray-500 max-w-md">
            {searchTerm ? 'Try adjusting your search terms or clear the search filter' : 'There are no pending top-up requests at the moment'}
          </p>
          {searchTerm && (
            <button
              onClick={onClearSearch}
              className="mt-4 px-4 py-2 bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 transition-colors duration-200"
            >
              Clear search
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-amber-100">
      <table className="min-w-full divide-y divide-amber-100 table-fixed">
        <thead className="bg-amber-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3.5 text-center text-xs font-medium text-amber-700 uppercase tracking-wider w-[10%] cursor-pointer hover:bg-amber-50"
              onClick={() => onRequestSort('id')}
            >
              ID
              {sortConfig?.key === 'id' && (
                <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
              )}
            </th>
            <th
              scope="col"
              className="px-6 py-3.5 text-center text-xs font-medium text-amber-700 uppercase tracking-wider w-[30%] cursor-pointer hover:bg-amber-50"
              onClick={() => onRequestSort('user')}
            >
              User
              {sortConfig?.key === 'user' && (
                <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
              )}
            </th>
            <th
              scope="col"
              className="px-6 py-3.5 text-center text-xs font-medium text-amber-700 uppercase tracking-wider w-[15%] cursor-pointer hover:bg-amber-50"
              onClick={() => onRequestSort('amount')}
            >
              Amount
              {sortConfig?.key === 'amount' && (
                <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
              )}
            </th>
            <th
              scope="col"
              className="px-6 py-3.5 text-center text-xs font-medium text-amber-700 uppercase tracking-wider w-[10%] cursor-pointer hover:bg-amber-50"
              onClick={() => onRequestSort('status')}
            >
              Status
              {sortConfig?.key === 'status' && (
                <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
              )}
            </th>
            <th
              scope="col"
              className="px-6 py-3.5 text-center text-xs font-medium text-amber-700 uppercase tracking-wider w-[15%] cursor-pointer hover:bg-amber-50"
              onClick={() => onRequestSort('date')}
            >
              Date & Time
              {sortConfig?.key === 'date' && (
                <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
              )}
            </th>
            <th scope="col" className="px-6 py-3.5 text-center text-xs font-medium text-amber-700 uppercase tracking-wider w-[10%]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-amber-50">
          {requests.map((request, index) => (
            <tr key={request.request_id || request.id || `request-${index}`} className="hover:bg-gray-50 transition-colors duration-150">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                <span className="bg-amber-50 px-2 py-1 rounded-md font-mono inline-block">#{request.request_id !== undefined ? request.request_id : 'N/A'}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex items-center justify-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shadow-inner overflow-hidden">
                    {usersMap.get(request.user_id)?.image_url ? (
                      <Image
                        src={usersMap.get(request.user_id)?.image_url || ''}
                        alt={usersMap.get(request.user_id)?.username || `User #${request.user_id}`}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://via.placeholder.com/40?text=${(usersMap.get(request.user_id)?.username || '').charAt(0).toUpperCase()}`;
                        }}
                      />
                    ) : (
                      <FaUserCircle className="h-6 w-6 text-amber-600" />
                    )}
                  </div>
                  <div className="ml-3 text-left">
                    <div className="text-sm font-medium text-gray-900 flex items-center">
                      {usersMap.get(request.user_id)?.username || `User #${request.user_id}`}
                      <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        ID: {request.user_id}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {usersMap.get(request.user_id)?.role && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                          {(usersMap.get(request.user_id)?.role || '').charAt(0).toUpperCase() + (usersMap.get(request.user_id)?.role || '').slice(1)}
                        </span>
                      )}
                      {usersMap.get(request.user_id)?.city && (
                        <span className="text-xs text-gray-500 ml-1">
                          <FaMapMarkerAlt className="inline mr-1 h-3 w-3" />
                          {usersMap.get(request.user_id)?.city}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-md inline-block">
                  {typeof request.amount === 'number' ? formatCurrency(request.amount, 'IDR', 'id-ID') : 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : request.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} justify-center mx-auto`}>
                  {request.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : 'Unknown'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                <div className="flex flex-col items-center justify-center">
                  {request.timestamp ? (
                    <>
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-1 h-3 w-3 text-gray-400" />
                        {request.timestamp ? formatApiTimestamp(request.timestamp).dateString : 'N/A'}
                      </div>
                      <div className="flex items-center mt-1 text-xs text-gray-400">
                        <FaClock className="mr-1 h-2.5 w-2.5" />
                        {request.timestamp ? formatApiTimestamp(request.timestamp).timeString : ''}
                      </div>
                    </>
                  ) : (
                    <span>N/A</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                <button
                  onClick={() => onViewDetails(request)}
                  className="text-amber-600 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-md transition-colors duration-200"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
