import React from 'react';
import { HttpResponse } from '../../types/response';

interface ResponseMetaProps {
  response: HttpResponse;
}

export const ResponseMeta: React.FC<ResponseMetaProps> = ({ response }) => {
  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'text-green-600 dark:text-green-400';
    if (statusCode >= 300 && statusCode < 400) return 'text-yellow-600 dark:text-yellow-400';
    if (statusCode >= 400) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const formatSize = (bytes?: number) => {
    if (bytes == null || isNaN(bytes)) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTime = (ms?: number) => {
    if (ms == null || isNaN(ms)) return '-';
    return `${ms}ms`;
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    const isoString = dateStr.replace(' ', 'T');
    const date = new Date(isoString);
    return isNaN(date.getTime()) ? dateStr : date.toLocaleString('zh-CN');
  };

  return (
    <div className="flex flex-col gap-1 text-sm">
      <div className="flex items-center gap-4">
        <span className="text-gray-500 dark:text-gray-400">状态码:</span>
        <span className={`font-medium ${getStatusColor(response.statusCode)}`}>{response.statusCode}</span>

        <span className="text-gray-500 dark:text-gray-400">耗时:</span>
        <span className="text-gray-700 dark:text-gray-300">{formatTime(response.responseTime)}</span>

        <span className="text-gray-500 dark:text-gray-400">大小:</span>
        <span className="text-gray-700 dark:text-gray-300">{formatSize(response.responseSize)}</span>

        {response.contentType && (
          <>
            <span className="text-gray-500 dark:text-gray-400">类型:</span>
            <span className="text-gray-700 dark:text-gray-300">{response.contentType}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-gray-500 dark:text-gray-400">时间:</span>
        <span className="text-gray-700 dark:text-gray-300">{formatDateTime(response.createdAt)}</span>
      </div>
    </div>
  );
};
