import React from 'react';
import { HistoryRecord } from '../../types/history';

interface HistoryDetailProps {
  record: HistoryRecord | null;
}

export const HistoryDetail: React.FC<HistoryDetailProps> = ({ record }) => {
  if (!record) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        点击历史记录查看详情
      </div>
    );
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

  const getStatusColor = (statusCode?: number) => {
    if (!statusCode) return 'text-gray-400';
    if (statusCode >= 200 && statusCode < 300) return 'text-green-600 dark:text-green-400';
    if (statusCode >= 400) return 'text-red-600 dark:text-red-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };

  const getBodyContent = (body: any) => {
    if (!body) return '';
    if ('Raw' in body) return body.Raw;
    if ('Json' in body) return body.Json;
    if ('Form' in body) return JSON.stringify(body.Form);
    return '';
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* 请求信息 */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">请求信息</h3>
        <div className="space-y-2">
          <div className="flex gap-2">
            <span className="font-mono text-xs font-medium text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
              {record.request.method}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400 break-all">
              {record.request.url}
            </span>
          </div>
          {record.request.headers.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Headers:</h4>
              <div className="space-y-1">
                {record.request.headers.map((header, index) => (
                  header.enabled && (
                    <div key={index} className="text-xs font-mono">
                      <span className="text-blue-600 dark:text-blue-400">{header.key}:</span>
                      <span className="text-gray-700 dark:text-gray-300 ml-1">{header.value}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
          {record.request.body && (
            <div>
              <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Body:</h4>
              <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                {getBodyContent(record.request.body)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* curl 命令 */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Curl 命令</h3>
        <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">
          {record.curlCommand || '无'}
        </pre>
      </div>

      {/* 调用时间 */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          调用时间: {formatTime(record.createdAt)}
        </span>
      </div>

      {/* 响应状态 */}
      {record.response && (
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-4 text-sm">
            <span className={`font-medium ${getStatusColor(record.response.statusCode)}`}>
              {record.response.statusCode}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {record.response.responseTime}ms
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {record.response.responseSize} bytes
            </span>
          </div>
        </div>
      )}

      {/* 响应头 */}
      {record.response && record.response.headers.length > 0 && (
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">响应头</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {record.response.headers.map((header, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-1 px-2 font-mono text-gray-900 dark:text-white">{header.key}</td>
                    <td className="py-1 px-2 font-mono text-gray-700 dark:text-gray-300 break-all">{header.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 响应体 */}
      {record.response && (
        <div className="flex-1 p-4 overflow-auto">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">响应体</h3>
          <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">
            {record.response.body}
          </pre>
        </div>
      )}
    </div>
  );
};
