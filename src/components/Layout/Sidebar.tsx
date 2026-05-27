import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { HistoryList } from '../Sidebar/HistoryList';
import { FavoritesList } from '../Sidebar/FavoritesList';
import { EnvironmentList } from '../Sidebar/EnvironmentList';

const tabs = [
  { id: 'history' as const, label: '历史', icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )},
  { id: 'favorites' as const, label: '收藏', icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )},
  { id: 'environments' as const, label: '环境', icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  )},
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <>
      <aside
        className="flex flex-col shrink-0 overflow-hidden transition-all duration-200"
        style={{
          width: sidebarOpen ? 'var(--sidebar-width)' : '0px',
          background: 'var(--bg-surface)',
          borderRight: sidebarOpen ? '1px solid var(--border-default)' : 'none',
        }}
      >
        <div
          className="flex shrink-0"
          style={{ borderBottom: '1px solid var(--border-default)' }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors"
              style={{
                color: activeTab === tab.id ? 'var(--accent-fg)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-fg)' : '2px solid transparent',
                background: activeTab === tab.id ? 'var(--bg-elevated)' : 'transparent',
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {activeTab === 'history' && <HistoryList />}
          {activeTab === 'favorites' && <FavoritesList />}
          {activeTab === 'environments' && <EnvironmentList />}
        </div>
      </aside>
      <button
        className="icon-btn shrink-0"
        style={{
          color: 'var(--text-muted)',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-default)',
          borderBottom: '1px solid var(--border-default)',
          width: '20px',
          borderRadius: 0,
          fontSize: '10px',
        }}
        onClick={toggleSidebar}
        title={sidebarOpen ? '收起侧栏' : '展开侧栏'}
      >
        {sidebarOpen ? '◀' : '▶'}
      </button>
    </>
  );
};
