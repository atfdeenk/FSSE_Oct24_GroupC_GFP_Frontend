import React from "react";

interface ErrorStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  buttonLabel?: string;
  onButtonClick?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ title, message, icon, buttonLabel, onButtonClick }) => {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-12">
      <div className="text-center max-w-md">
        {icon && <div className="mx-auto mb-6">{icon}</div>}
        <h1 className="text-2xl font-bold text-white mb-4">{title}</h1>
        <p className="text-white/60 mb-8">{message}</p>
        {buttonLabel && onButtonClick && (
          <button
            onClick={onButtonClick}
            className="inline-block px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded shadow transition"
          >
            {buttonLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
