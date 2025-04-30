import React from "react";

interface AddToCartButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ onClick, disabled, loading, children }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-grow py-2 px-6 rounded-sm font-bold transition-all duration-300 flex items-center justify-center space-x-2 ${
        loading
          ? "bg-amber-700 text-white/70 cursor-wait"
          : "bg-amber-500 text-black hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20 transform hover:translate-y-[-1px]"
      }`}
    >
      {loading ? (
        <>
          <svg className="animate-spin w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Adding to Cart...</span>
        </>
      ) : (
        children || <span>Add to Cart</span>
      )}
    </button>
  );
};

export default AddToCartButton;
