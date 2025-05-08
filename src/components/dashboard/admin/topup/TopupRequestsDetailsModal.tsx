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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-neutral-800 p-6 text-left align-middle shadow-xl transition-all border border-neutral-700">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white">
                  Top-up Request Details
                </Dialog.Title>

                <div className="mt-4 space-y-4">
                  <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-neutral-400">Request ID:</span>
                      <span className="text-sm font-medium text-white">#{request.request_id}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-neutral-400">User ID:</span>
                      <span className="text-sm font-medium text-white">{request.user_id}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-neutral-400">Amount:</span>
                      <span className="text-sm font-medium text-amber-400">
                        {typeof request.amount === 'number' ? formatCurrency(request.amount, 'IDR', 'id-ID') : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-neutral-400">Status:</span>
                      <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${request.status === 'pending' ? 'bg-amber-900/20 text-amber-400 border border-amber-700/50' :
                        request.status === 'approved' ? 'bg-green-900/20 text-green-400 border border-green-700/50' :
                          'bg-red-900/20 text-red-400 border border-red-700/50'
                        }`}>
                        {request.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-neutral-400">Date:</span>
                      <span className="text-sm font-medium text-white flex items-center">
                        <FaCalendarAlt className="mr-1 h-3 w-3 text-neutral-500" />
                        {request.timestamp ? formatApiTimestamp(request.timestamp).dateString : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-400">Time:</span>
                      <span className="text-sm font-medium text-white flex items-center">
                        <FaClock className="mr-1 h-3 w-3 text-neutral-500" />
                        {request.timestamp ? formatApiTimestamp(request.timestamp).timeString : 'N/A'}
                      </span>
                    </div>
                    {request.notes && (
                      <div className="mt-3 pt-3 border-t border-neutral-700">
                        <span className="text-sm text-neutral-400 block mb-1">Notes:</span>
                        <div className="text-sm text-neutral-300 bg-neutral-800 p-2 rounded border border-neutral-700">
                          {request.notes}
                        </div>
                      </div>
                    )}
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex justify-between mt-6">
                      <button
                        type="button"
                        className="inline-flex justify-center items-center px-4 py-2 border border-red-700/50 text-sm font-medium rounded-md text-white bg-red-900/30 hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        onClick={() => onReject(request.request_id)}
                        disabled={processingAction}
                      >
                        <FaTimes className="mr-2 h-4 w-4" />
                        Reject
                      </button>
                      <button
                        type="button"
                        className="inline-flex justify-center items-center px-4 py-2 border border-green-700/50 text-sm font-medium rounded-md text-white bg-green-900/30 hover:bg-green-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-neutral-300 bg-neutral-700 border border-neutral-600 rounded-md hover:bg-neutral-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500 transition-all duration-200"
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
