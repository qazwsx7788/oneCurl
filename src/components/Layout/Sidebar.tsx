import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { HistoryList } from '../Sidebar/HistoryList';
import { FavoritesList } from '../Sidebar/FavoritesList';
import { EnvironmentList } from '../Sidebar/EnvironmentList';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useUIStore();
  const tabs = [
    { id: 'history' as const, label: '历史记录', icon: '📋' },
    { id: 'favorites' as const, label: '收藏夹', icon: '⭐' },
    { id: 'environments' as const, label: '环境变量', icon: '🔧' },
  ];
  return (
    <aside className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button key={tab.id} className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600 bg-white dark:bg-gray-800' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`} onClick={() => setActiveTab(tab.id)}>
            <span className="mr-2">{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'history' && <HistoryList />}
        {activeTab === 'favorites' && <FavoritesList />}
        {activeTab === 'environments' && <EnvironmentList />}
      </div>
    </aside>
  );
};
