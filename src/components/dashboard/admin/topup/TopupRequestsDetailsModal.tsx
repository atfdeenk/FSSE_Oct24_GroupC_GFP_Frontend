import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { TopUpRequest } from '@/services/api/topup';
import { formatApiTimestamp } from '@/utils/date';
import { formatCurrency } from '@/utils/format';
import { FaCheck, FaTimes, FaCalendarAlt, FaClock } from 'react-icons/fa';

interface TopupRequestsDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: TopUpRequest | null;
  onApprove: (requestId: number) => void;
  onReject: (requestId: number) => void;
  processingAction: boolean;
}

export default function TopupRequestsDetailsModal({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
  processingAction
}: TopupRequestsDetailsModalProps) {
  if (!request) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  Top-up Request Details
                </Dialog.Title>

                <div className="mt-4 space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">Request ID:</span>
                      <span className="text-sm font-medium text-gray-900">#{request.request_id}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">User ID:</span>
                      <span className="text-sm font-medium text-gray-900">{request.user_id}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">Amount:</span>
                      <span className="text-sm font-medium text-amber-600">
                        {typeof request.amount === 'number' ? formatCurrency(request.amount, 'IDR', 'id-ID') : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {request.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">Date:</span>
                      <span className="text-sm font-medium text-gray-900 flex items-center">
                        <FaCalendarAlt className="mr-1 h-3 w-3 text-gray-400" />
                        {request.timestamp ? formatApiTimestamp(request.timestamp).dateString : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Time:</span>
                      <span className="text-sm font-medium text-gray-900 flex items-center">
                        <FaClock className="mr-1 h-3 w-3 text-gray-400" />
                        {request.timestamp ? formatApiTimestamp(request.timestamp).timeString : 'N/A'}
                      </span>
                    </div>
                    {request.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <span className="text-sm text-gray-500 block mb-1">Notes:</span>
                        <div className="text-sm text-gray-700 bg-white p-2 rounded">
                          {request.notes}
                        </div>
                      </div>
                    )}
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex justify-between mt-6">
                      <button
                        type="button"
                        className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => onReject(request.request_id)}
                        disabled={processingAction}
                      >
                        <FaTimes className="mr-2 h-4 w-4" />
                        Reject
                      </button>
                      <button
                        type="button"
                        className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => onApprove(request.request_id)}
                        disabled={processingAction}
                      >
                        <FaCheck className="mr-2 h-4 w-4" />
                        Approve
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
