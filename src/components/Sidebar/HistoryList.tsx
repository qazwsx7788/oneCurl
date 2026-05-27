import React, { useEffect } from 'react';
import { useHistoryStore } from '../../stores/historyStore';
import { useTabStore } from '../../stores/tabStore';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { HistoryRecord } from '../../types/history';
import { deleteHistory, clearHistory } from '../../services/tauri';
import { generateCurlCommand } from '../../utils/curl';

export const HistoryList: React.FC = () => {
  const { history, loading, fetchHistory } = useHistoryStore();
  const { setCurlCommand, setResponse } = useTabStore();
  const { addFavorite } = useFavoritesStore();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const isoString = dateString.replace(' ', 'T');
    const date = new Date(isoString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleString('zh-CN');
  };

  const getStatusColor = (statusCode?: number) => {
    if (!statusCode) return 'text-gray-400';
    if (statusCode >= 200 && statusCode < 300) return 'text-green-500';
    if (statusCode >= 400) return 'text-red-500';
    return 'text-yellow-500';
  };

  const handleLoadToCurl = (record: HistoryRecord) => {
    const curlCommand = record.curlCommand || generateCurlCommand(record.request);
    setCurlCommand(curlCommand);
    if (record.response) {
      setResponse({
        ...record.response,
        createdAt: record.createdAt,
      });
    }
  };

  const handleFavorite = async (record: HistoryRecord) => {
    if (!record.request.id) {
      alert('无法收藏：缺少请求 ID');
      return;
    }
    const name = prompt('请输入收藏名称:', record.request.url);
    if (!name) return;
    try {
      await addFavorite(record.request.id, name);
      alert('收藏成功');
    } catch (error) {
      console.error('收藏失败:', error);
      alert('收藏失败: ' + error);
    }
  };

  const handleDelete = async (record: HistoryRecord) => {
    if (!confirm('确定删除这条历史记录吗？')) return;
    try {
      await deleteHistory(record.id);
      await fetchHistory();
    } catch (error) {
      console.error('删除历史记录失败:', error);
      alert('删除失败: ' + error);
    }
  };

  const handleClearHistory = async () => {
    if (confirm('确定要清空所有历史记录吗？此操作不可撤销。')) {
      try {
        await clearHistory();
        await fetchHistory();
      } catch (error) {
        console.error('清空历史记录失败:', error);
        alert('清空失败: ' + error);
      }
    }
  };

  if (loading) return <div className="text-center text-gray-500">加载中...</div>;
  if (history.length === 0) return <div className="text-center text-gray-500">暂无历史记录</div>;

  return (
    <div className="flex flex-col gap-2">
      {history.length > 0 && (
        <button
          onClick={handleClearHistory}
          className="w-full px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded border border-red-200 dark:border-red-800 transition-colors"
        >
          清空历史记录
        </button>
      )}
      {history.map((record) => (
        <div
          key={record.id}
          className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
              {record.request.method}
            </span>
            <span className={`text-sm font-medium ${getStatusColor(record.response?.statusCode)}`}>
              {record.response?.statusCode || '---'}
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
            {record.request.url}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mb-2">
            {formatTime(record.createdAt)}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleLoadToCurl(record)}
              className="flex-1 px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            >
              加载
            </button>
            <button
              onClick={() => handleFavorite(record)}
              className="px-2 py-1 text-xs text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900 rounded transition-colors"
              title="收藏"
            >
              ⭐
            </button>
            <button
              onClick={() => handleDelete(record)}
              className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
            >
              删除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
