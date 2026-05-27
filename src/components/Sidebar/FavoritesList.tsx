import React, { useEffect } from 'react';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { useTabStore } from '../../stores/tabStore';
import { FavoriteRecord } from '../../types/favorite';
import { generateCurlCommand } from '../../utils/curl';

export const FavoritesList: React.FC = () => {
  const { favorites, loading, fetchFavorites, removeFavorite } = useFavoritesStore();
  const { setMethod, setUrl, setHeaders, setBody, setAuth, setProxy, setSslVerify, setTimeout: setRequestTimeout, setCurlCommand } = useTabStore();

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const loadRequest = (record: FavoriteRecord) => {
    setMethod(record.request.method);
    setUrl(record.request.url);
    setHeaders(record.request.headers);
    setBody(record.request.body || null);
    setAuth(record.request.auth || null);
    setProxy(record.request.proxy || null);
    setSslVerify(record.request.ssl_verify);
    setRequestTimeout(record.request.timeout);
    // 同时生成 curl 命令
    const curlCommand = generateCurlCommand(record.request);
    setCurlCommand(curlCommand);
  };

  const handleRemove = async (record: FavoriteRecord) => {
    if (!confirm(`确定取消收藏 "${record.name}" 吗？`)) return;
    try {
      await removeFavorite(record.id);
    } catch (error) {
      console.error('取消收藏失败:', error);
      alert('取消收藏失败: ' + error);
    }
  };

  if (loading) return <div className="text-center text-gray-500">加载中...</div>;
  if (favorites.length === 0) return <div className="text-center text-gray-500">暂无收藏</div>;

  return (
    <div className="flex flex-col gap-2">
      {favorites.map((record) => (
        <div
          key={record.id}
          className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors"
        >
          <div
            className="cursor-pointer"
            onClick={() => loadRequest(record)}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900 dark:text-white">{record.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-gray-500">{record.request.method}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{record.request.url}</span>
            </div>
            {record.description && (
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{record.description}</div>
            )}
          </div>
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => handleRemove(record)}
              className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
            >
              取消收藏
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
