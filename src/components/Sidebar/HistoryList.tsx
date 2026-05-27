import React, { useEffect, useState } from 'react';
import { useHistoryStore } from '../../stores/historyStore';
import { useTabStore } from '../../stores/tabStore';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { useUIStore } from '../../stores/uiStore';
import { HistoryRecord } from '../../types/history';
import { deleteHistory, clearHistory } from '../../services/tauri';
import { generateCurlCommand } from '../../utils/curl';

export const HistoryList: React.FC = () => {
  const { history, loading, fetchHistory } = useHistoryStore();
  const { setCurlCommand, setResponse } = useTabStore();
  const { addFavorite } = useFavoritesStore();
  const { setInputMode } = useUIStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const keyword = search.trim().toLowerCase();
  const filtered = keyword
    ? history.filter((r) => r.request.url.toLowerCase().includes(keyword))
    : history;

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const isoString = dateString.replace(' ', 'T');
    const date = new Date(isoString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleString('zh-CN');
  };

  const getStatusClass = (statusCode?: number) => {
    if (!statusCode) return '';
    if (statusCode >= 200 && statusCode < 300) return 'status-success';
    if (statusCode >= 400) return 'status-error';
    return 'status-warning';
  };

  const getMethodClass = (method: string) => `method-${method.toLowerCase()}`;

  const handleLoadToForm = (record: HistoryRecord) => {
    setInputMode('curl');
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
    } catch (error) {
      console.error('收藏失败:', error);
    }
  };

  const handleDelete = async (record: HistoryRecord) => {
    if (!confirm('确定删除这条历史记录吗？')) return;
    try {
      await deleteHistory(record.id);
      await fetchHistory();
    } catch (error) {
      console.error('删除历史记录失败:', error);
    }
  };

  const handleClearHistory = async () => {
    if (confirm('确定要清空所有历史记录吗？此操作不可撤销。')) {
      try {
        await clearHistory();
        await fetchHistory();
      } catch (error) {
        console.error('清空历史记录失败:', error);
      }
    }
  };

  if (loading) return <div className="text-center py-4 text-xs" style={{ color: 'var(--text-muted)' }}>加载中...</div>;

  return (
    <div className="flex flex-col gap-2">
      {/* 操作栏 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <svg
            className="absolute left-2 top-1/2 -translate-y-1/2"
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索 URL..."
            className="sidebar-search"
            style={{ paddingLeft: '28px' }}
          />
        </div>
        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="ghost-btn shrink-0"
            style={{ color: 'var(--danger-fg)', fontSize: '12px', whiteSpace: 'nowrap' }}
          >
            清空所有
          </button>
            </svg>
          </button>
        )}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-6 text-xs" style={{ color: 'var(--text-muted)' }}>
          {history.length === 0 ? '暂无历史记录' : '无匹配结果'}
        </div>
      )}

      {filtered.map((record) => (
        <div
          key={record.id}
          className="group cursor-pointer transition-colors"
          style={{
            padding: '8px 10px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border-muted)',
            background: 'var(--bg-elevated)',
          }}
          onClick={() => handleLoadToForm(record)}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`method-badge ${getMethodClass(record.request.method)}`} style={{ fontSize: '9px', padding: '0 4px' }}>
              {record.request.method}
            </span>
            {record.response?.statusCode && (
              <span className={`status-badge ${getStatusClass(record.response.statusCode)}`} style={{ fontSize: '10px', padding: '0 5px' }}>
                {record.response.statusCode}
              </span>
            )}
            <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
              {record.response?.responseTime != null ? `${record.response.responseTime}ms` : ''}
            </span>
          </div>
          <div className="text-xs font-mono truncate mb-1" style={{ color: 'var(--text-secondary)' }}>
            {record.request.url}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {formatTime(record.createdAt)}
            </span>
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => handleFavorite(record)}
                className="ghost-btn"
                style={{ color: 'var(--warning-fg)', padding: '2px 6px', fontSize: '12px' }}
                title="收藏"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                收藏
              </button>
              <button
                onClick={() => handleDelete(record)}
                className="ghost-btn"
                style={{ color: 'var(--danger-fg)', padding: '2px 6px', fontSize: '12px' }}
                title="删除"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
                删除
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
