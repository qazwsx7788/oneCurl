import React, { useEffect, useState, useRef } from 'react';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { useTabStore } from '../../stores/tabStore';
import { useProjectStore } from '../../stores/projectStore';
import { FavoriteRecord } from '../../types/favorite';
import { generateCurlCommand } from '../../utils/curl';

export const FavoritesList: React.FC = () => {
  const { favorites, loading, fetchFavorites, removeFavorite, updateFavoriteName } = useFavoritesStore();
  const { setMethod, setUrl, setHeaders, setBody, setAuth, setProxy, setSslVerify, setTimeout: setRequestTimeout, setCurlCommand, setResponse, setError } = useTabStore();
  const { selectedProjectId, selectedRequirementId } = useProjectStore();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const keyword = search.trim().toLowerCase();
  const filtered = favorites.filter((r) => {
    // 按项目/需求筛选
    if (selectedProjectId && r.request.projectId !== selectedProjectId) return false;
    if (selectedRequirementId && r.request.requirementId !== selectedRequirementId) return false;
    // 按关键词筛选
    if (keyword && !r.name.toLowerCase().includes(keyword) && !r.request.url.toLowerCase().includes(keyword)) return false;
    return true;
  });

  const loadRequest = (record: FavoriteRecord) => {
    setMethod(record.request.method);
    setUrl(record.request.url);
    setHeaders(record.request.headers);
    setBody(record.request.body || null);
    setAuth(record.request.auth || null);
    setProxy(record.request.proxy || null);
    setSslVerify(record.request.ssl_verify);
    setRequestTimeout(record.request.timeout);
    const curlCommand = generateCurlCommand(record.request);
    setCurlCommand(curlCommand);
    setResponse(null);
    setError(null);
  };

  const handleRemove = async (record: FavoriteRecord) => {
    if (!confirm(`确定取消收藏 "${record.name}" 吗？`)) return;
    try {
      await removeFavorite(record.id);
    } catch (error) {
      console.error('取消收藏失败:', error);
    }
  };

  const startEditing = (record: FavoriteRecord) => {
    setEditingId(record.id);
    setEditingName(record.name);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const saveEditing = async () => {
    if (editingId === null) return;
    const trimmed = editingName.trim();
    if (!trimmed) return;
    try {
      await updateFavoriteName(editingId, trimmed);
    } catch (error) {
      console.error('更新名称失败:', error);
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEditing();
    if (e.key === 'Escape') setEditingId(null);
  };

  if (loading) return <div className="text-center py-4 text-xs" style={{ color: 'var(--text-muted)' }}>加载中...</div>;

  return (
    <div className="flex flex-col gap-2">
      {/* 搜索框 */}
      <div className="relative">
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
          placeholder="搜索收藏..."
          className="sidebar-search"
          style={{ paddingLeft: '28px' }}
        />
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-6 text-xs" style={{ color: 'var(--text-muted)' }}>
          {favorites.length === 0 ? '暂无收藏' : '无匹配结果'}
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
          onClick={() => loadRequest(record)}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className="text-xs font-mono"
              style={{
                color: record.request.method === 'GET' ? 'var(--green-fg)' :
                       record.request.method === 'POST' ? 'var(--blue-fg)' :
                       record.request.method === 'PUT' ? 'var(--yellow-fg)' :
                       record.request.method === 'DELETE' ? 'var(--red-fg)' :
                       'var(--text-primary)',
              }}
            >
              {record.request.method}
            </span>
            {editingId === record.id ? (
              <input
                ref={inputRef}
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={saveEditing}
                onKeyDown={handleKeyDown}
                className="text-xs font-medium flex-1 min-w-0"
                style={{
                  color: 'var(--text-primary)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-focus)',
                  borderRadius: '3px',
                  padding: '1px 4px',
                  outline: 'none',
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                className="text-xs font-medium truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {record.name}
              </span>
            )}
          </div>
          <div className="text-xs font-mono truncate" style={{ color: 'var(--text-muted)', paddingLeft: '2px' }}>
            {record.request.url}
          </div>
          <div className="flex items-center justify-between mt-1.5">
            {record.description && (
              <span className="text-xs truncate flex-1" style={{ color: 'var(--text-muted)' }}>
                {record.description}
              </span>
            )}
            <div className="flex gap-1">
              {editingId !== record.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing(record);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1.5 py-0.5"
                  style={{
                    color: 'var(--accent-fg)',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                  }}
                  title="编辑"
                >
                  编辑
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(record);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1.5 py-0.5"
                style={{
                  color: 'var(--danger-fg)',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                }}
                title="删除"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
