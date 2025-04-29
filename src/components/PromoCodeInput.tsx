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
    <div className="mb-8 relative">
      <label className="block text-white/70 text-sm mb-2">Promo Code</label>
      <div className="flex">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="bg-black/50 border border-white/10 rounded-l-sm px-4 py-2 w-full text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
          placeholder="Enter code"
          disabled={disabled}
        />
        <button
          onClick={onApply}
          disabled={disabled}
          className="bg-amber-500 text-black px-4 py-2 rounded-r-sm font-medium hover:bg-amber-400 transition-colors shadow-lg hover:shadow-amber-500/20 disabled:bg-neutral-700 disabled:text-white/50"
        >
          Apply
        </button>
      </div>
      {error && <p className="text-red-400 text-sm mt-1 animate-fade-in">{error}</p>}
      {successMessage && (
        <div className="flex items-center mt-1 animate-fade-in gap-1 whitespace-nowrap">
          <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-amber-400 text-sm">{successMessage}</span>
          {onRemove && (
  <button
    type="button"
    className="ml-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs text-red-500 bg-red-50/0 hover:bg-red-100/80 hover:text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
    onClick={onRemove}
    aria-label="Remove promo code"
  >
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 20 20" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l8 8M6 14L14 6" />
    </svg>
    Remove
  </button>
)}
        </div>
      )}
    </div>
  );
};

export default PromoCodeInput;
