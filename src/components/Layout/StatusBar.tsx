import React from 'react';
import { useTabStore } from '../../stores/tabStore';

export const StatusBar: React.FC = () => {
  const { getActiveTab } = useTabStore();
  const activeTab = getActiveTab();
  const response = activeTab?.response || null;
  const loading = activeTab?.loading || false;

  const getStatusColor = (code?: number) => {
    if (!code) return 'var(--text-muted)';
    if (code >= 200 && code < 300) return 'var(--success-fg)';
    if (code >= 400) return 'var(--danger-fg)';
    return 'var(--warning-fg)';
  };

  const formatSize = (bytes?: number): string => {
    if (bytes == null || isNaN(bytes)) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <footer
      className="flex items-center justify-between px-3 shrink-0"
      style={{
        height: 'var(--statusbar-height)',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-default)',
        fontSize: '13px',
        color: 'var(--text-muted)',
      }}
    >
      <div className="flex items-center gap-3">
        {loading && (
          <span style={{ color: 'var(--warning-fg)' }}>
            <span className="inline-block animate-pulse">●</span> 请求中...
          </span>
        )}
        {response && !loading && (
          <>
            <span style={{ color: getStatusColor(response.statusCode), fontWeight: 600 }}>
              {response.statusCode}
            </span>
            <span>{response.responseTime != null ? `${response.responseTime}ms` : '-'}</span>
            <span>{formatSize(response.responseSize)}</span>
          </>
        )}
        {!response && !loading && <span>就绪</span>}
      </div>
      <div className="flex items-center gap-3">
        <span>Ctrl+Enter 发送</span>
        <span style={{ color: 'var(--text-muted)' }}>oneCurl v1.0</span>
      </div>
    </footer>
  );
};
