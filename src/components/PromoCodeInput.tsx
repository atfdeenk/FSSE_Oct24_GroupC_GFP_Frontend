import React from "react";

interface PromoCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onApply: () => void;
  error?: string;
  successMessage?: string;
  disabled?: boolean;
  onRemove?: () => void;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  value,
  onChange,
  onApply,
  error,
  successMessage,
  disabled = false,
  onRemove,
}) => {
  return (
    <div className="mb-6 relative">
      <div className="flex items-center justify-between mb-3">
        <label className="text-white/80 text-sm font-medium flex items-center gap-1.5">
          <svg className="w-4 h-4 text-amber-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Promo Code
        </label>
        {successMessage && (
          <span className="text-green-400 text-xs font-medium bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Applied
          </span>
        )}
      </div>
      
      {successMessage ? (
        <div className="bg-amber-500/10 rounded-md p-3 animate-fade-in border border-amber-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-amber-500/20 p-1.5 rounded-md">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <div className="text-white font-medium">{value.toUpperCase()}</div>
                <div className="text-amber-400/80 text-xs">{successMessage}</div>
              </div>
            </div>
            {onRemove && (
              <button
                type="button"
                className="text-white/60 hover:text-red-400 transition-colors p-1.5 rounded-full hover:bg-red-500/10"
                onClick={onRemove}
                aria-label="Remove promo code"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex rounded-md overflow-hidden shadow-sm">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <input
              type="text"
              value={value}
              onChange={e => onChange(e.target.value.toUpperCase())}
              className="bg-black/50 border border-white/10 pl-10 pr-4 py-3 w-full text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 rounded-l-md"
              placeholder="Enter promo code"
              disabled={disabled}
            />
          </div>
          <button
            onClick={onApply}
            disabled={disabled || !value.trim()}
            className="bg-amber-500 text-black px-5 py-3 font-medium hover:bg-amber-400 transition-colors shadow-lg hover:shadow-amber-500/20 disabled:bg-neutral-700 disabled:text-white/50 rounded-r-md"
          >
            Apply
          </button>
        </div>
      )}
      
      {error && (
        <div className="flex items-center gap-1.5 mt-2 animate-fade-in text-red-400 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

export default PromoCodeInput;
