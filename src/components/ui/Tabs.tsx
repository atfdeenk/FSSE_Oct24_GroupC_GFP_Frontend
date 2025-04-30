import React from "react";

interface Tab {
  label: string;
  key: string;
  count?: number; // For things like Reviews (24)
}

interface TabsProps {
  tabs: Tab[];
  activeKey: string;
  onTabChange: (key: string) => void;
  children: React.ReactNode;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeKey, onTabChange, children }) => {
  return (
    <div>
      <div className="flex space-x-8 border-b border-white/10 mb-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`pb-2 font-medium text-sm transition-colors ${
              activeKey === tab.key
                ? "text-amber-500 border-b-2 border-amber-500"
                : "text-white/60 hover:text-white/80"
            }`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
            {typeof tab.count === 'number' && (
              <span className="ml-1">({tab.count})</span>
            )}
          </button>
        ))}
      </div>
      <div className="min-h-[200px]">{children}</div>
    </div>
  );
};

export default Tabs;
