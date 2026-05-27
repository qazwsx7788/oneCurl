import React from 'react';
import { useTabStore } from '../../stores/tabStore';

export const StatusBar: React.FC = () => {
  const { getActiveTab } = useTabStore();
  const activeTab = getActiveTab();
  const response = activeTab?.response || null;
  const loading = activeTab?.loading || false;

  return (
    <footer className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-sm">
      <div className="flex items-center gap-4">
        {loading && (
          <span className="text-yellow-600 dark:text-yellow-400">
            请求中...
          </span>
        )}
        {response && (
          <>
            <span className={`font-medium ${
              response.statusCode >= 200 && response.statusCode < 300
                ? 'text-green-600 dark:text-green-400'
                : response.statusCode >= 400
                ? 'text-red-600 dark:text-red-400'
                : 'text-yellow-600 dark:text-yellow-400'
            }`}>
              {response.statusCode}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {response.responseTime != null ? `${response.responseTime}ms` : '-'}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {formatSize(response.responseSize)}
            </span>
          </>
        )}
      </div>
      <div className="text-gray-500 dark:text-gray-400">
        oneCurl v1.0.0
      </div>
    </footer>
  );
};

function formatSize(bytes?: number): string {
  if (bytes == null || isNaN(bytes)) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
