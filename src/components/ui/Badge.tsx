import React from "react";

interface BadgeProps {
  count: number;
  className?: string;
  pulse?: boolean;
}

const Badge: React.FC<BadgeProps> = ({ count, className = "", pulse = true }) => {
  if (count <= 0) return null;
  return (
    <span
      className={`absolute -top-2 -right-2 bg-amber-500 text-black text-xs font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center ${pulse ? "animate-pulse" : ""} ${className}`.trim()}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
};

export default Badge;
