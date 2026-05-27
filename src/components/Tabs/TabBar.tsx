import React from 'react';
import { useTabStore } from '../../stores/tabStore';

export const TabBar: React.FC = () => {
  const { tabs, activeTabId, addTab, closeTab, setActiveTab } = useTabStore();

  const getMethodClass = (method: string) => {
    const m = method?.toUpperCase() || 'GET';
    return `method-${m.toLowerCase()}`;
  };

  return (
    <div
      className="flex items-center shrink-0 overflow-x-auto"
      style={{
        height: 'var(--tab-height)',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {tabs.map((tab) => {
          const isActive = activeTabId === tab.id;
          const method = tab.request?.method || 'GET';
          return (
            <div
              key={tab.id}
              className="flex items-center gap-1.5 px-3 cursor-pointer group shrink-0 transition-colors"
              style={{
                height: 'var(--tab-height)',
                borderRight: '1px solid var(--border-muted)',
                background: isActive ? 'var(--bg-base)' : 'transparent',
                borderBottom: isActive ? '2px solid var(--accent-fg)' : '2px solid transparent',
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {method !== 'GET' && (
                <span className={`method-badge ${getMethodClass(method)}`} style={{ fontSize: '9px', padding: '1px 4px' }}>
                  {method}
                </span>
              )}
              <span
                className="text-xs truncate max-w-[100px]"
                style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              >
                {tab.name}
              </span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity rounded-sm"
                  style={{
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '10px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>
      <button
        onClick={addTab}
        className="icon-btn shrink-0"
        title="新建标签页 (Ctrl+N)"
        style={{ marginLeft: '2px' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
};
