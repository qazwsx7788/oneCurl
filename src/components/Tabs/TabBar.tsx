import React from 'react';
import { useTabStore } from '../../stores/tabStore';

export const TabBar: React.FC = () => {
  const { tabs, activeTabId, addTab, closeTab, setActiveTab } = useTabStore();

  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex items-center gap-2 px-4 py-2 cursor-pointer border-r border-gray-200 dark:border-gray-700 min-w-[120px] ${
              activeTabId === tab.id
                ? 'bg-white dark:bg-gray-900 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="text-sm font-medium truncate">{tab.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
              className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={addTab}
        className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        title="新建标签页"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};
