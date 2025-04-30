import React from "react";

interface QuantityInputProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const QuantityInput: React.FC<QuantityInputProps> = ({ value, min = 1, max, onChange, disabled }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(min, max ? Math.min(Number(e.target.value), max) : Number(e.target.value));
    onChange(val);
  };

  return (
    <div className="relative w-24 pr-6 border-r border-white/10">
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={handleInputChange}
        className="w-full bg-black/50 border border-white/10 rounded-sm px-3 py-2 text-white focus:outline-none focus:border-amber-500/50 disabled:opacity-50"
        disabled={disabled}
      />
      <div className="absolute right-0 top-0 h-full flex flex-col border-l border-white/10">
        <button
          className="flex-1 px-3 hover:bg-white/5 text-white/60 hover:text-white"
          onClick={() => !disabled && onChange(value + 1)}
          disabled={disabled}
        >
          +
        </button>
        <button
          className="flex-1 px-3 hover:bg-white/5 text-white/60 hover:text-white border-t border-white/10"
          onClick={() => !disabled && onChange(Math.max(min, value - 1))}
          disabled={disabled}
        >
          -
        </button>
      </div>
    </div>
  );
};

export default QuantityInput;
