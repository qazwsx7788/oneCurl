import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../Common/Button';
import { useTabStore } from '../../stores/tabStore';
import { useHistoryStore } from '../../stores/historyStore';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { useProjectStore } from '../../stores/projectStore';
import { parseCurlCommand, executeRequest, upsertFavorite } from '../../services/tauri';
import { useEnvironmentStore } from '../../stores/environmentStore';
import { mergeEnvironmentHeaders } from '../../utils/environment';

const MIN_HEIGHT = 60;
const MAX_HEIGHT = 500;
const STORAGE_KEY = 'curl-input-height';
const DEFAULT_HEIGHT = 140;

const getStoredHeight = (): number => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const height = stored ? parseInt(stored, 10) : DEFAULT_HEIGHT;
    return Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, height));
  } catch {
    return DEFAULT_HEIGHT;
  }
};

export const CurlInput: React.FC = () => {
  const [height, setHeight] = useState(getStoredHeight);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const { getActiveTab, setCurlCommand, resetRequest, setMethod, setUrl, setHeaders, setBody, setAuth, setProxy,
    setSslVerify, setTimeout: setRequestTimeout, setLoading, setError, setResponse } = useTabStore();
  const { refreshHistory } = useHistoryStore();
  const { activeEnvironment } = useEnvironmentStore();
  const { selectedProjectId, selectedRequirementId, fetchProjectTree } = useProjectStore();
  const { fetchFavorites } = useFavoritesStore();
  const curlCommand = getActiveTab()?.curlCommand || '';
  const loading = getActiveTab()?.loading || false;

  // 保存高度到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, height.toString());
    } catch {
      // Ignore storage errors
    }
  }, [height]);

  // 处理拖动开始
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartY.current = clientY;
    dragStartHeight.current = height;
  };

  // 处理拖动中
  useEffect(() => {
    if (!isDragging) return;

    const handleDragMove = (e: MouseEvent | TouchEvent) => {
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaY = clientY - dragStartY.current;
      const newHeight = dragStartHeight.current + deltaY;

      setHeight(Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, newHeight)));
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove);
    document.addEventListener('touchend', handleDragEnd);

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  const handleParse = async () => {
    if (!curlCommand.trim()) return;
    try {
      const request = await parseCurlCommand(curlCommand);
      setMethod(request.method);
      setUrl(request.url);
      setHeaders(request.headers);
      setBody(request.body || null);
      setAuth(request.auth || null);
      setProxy(request.proxy || null);
      setSslVerify(request.ssl_verify);
      setRequestTimeout(request.timeout);
    } catch (error) {
      console.error('解析 curl 命令失败:', error);
      alert(`解析失败: ${error}`);
    }
  };

  const handleExecute = async () => {
    if (!curlCommand.trim()) return;
    try {
      // 先清空结果区域
      setResponse(null);
      const request = await parseCurlCommand(curlCommand);
      // 关联当前选中的项目和需求
      const requestWithProject = {
        ...request,
        headers: mergeEnvironmentHeaders(request.headers, activeEnvironment),
        projectId: selectedProjectId ?? undefined,
        requirementId: selectedRequirementId ?? undefined,
      };
      setMethod(requestWithProject.method);
      setUrl(requestWithProject.url);
      setHeaders(requestWithProject.headers);
      setBody(requestWithProject.body || null);
      setAuth(requestWithProject.auth || null);
      setProxy(requestWithProject.proxy || null);
      setSslVerify(requestWithProject.ssl_verify);
      setRequestTimeout(requestWithProject.timeout);
      setLoading(true);
      setError(null);
      const response = await executeRequest(requestWithProject, curlCommand);
      setResponse({ ...response, createdAt: new Date().toISOString() });
      await refreshHistory();
    } catch (error) {
      console.error('执行 curl 命令失败:', error);
      setError(String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!curlCommand.trim()) return;
    try {
      const request = await parseCurlCommand(curlCommand);
      const defaultName = request.url || curlCommand.substring(0, 50);
      const name = window.prompt('请输入收藏名称:', defaultName);
      if (!name?.trim()) return;

      // 获取当前响应
      const currentTab = getActiveTab();
      const response = currentTab?.response || undefined;

      const requestWithProject = {
        ...request,
        projectId: selectedProjectId ?? undefined,
        requirementId: selectedRequirementId ?? undefined,
      };
      await upsertFavorite(requestWithProject, name.trim(), undefined, response);
      await fetchProjectTree();
      await fetchFavorites();
    } catch (error) {
      console.error('收藏失败:', error);
      alert('收藏失败: ' + error);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        className="relative"
        style={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}
      >
        <div
          className="absolute top-2 left-3 text-xs font-mono"
          style={{ color: 'var(--text-muted)', pointerEvents: 'none', userSelect: 'none' }}
        >
          $
        </div>
        <textarea
          value={curlCommand}
          onChange={(e) => setCurlCommand(e.target.value)}
          placeholder="粘贴 curl 命令..."
          className="w-full font-mono text-sm resize-none outline-none"
          style={{
            height: `${height}px`,
            padding: '8px 12px 8px 24px',
            paddingBottom: '20px',
            background: 'var(--bg-base)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-primary)',
            lineHeight: '1.6',
          }}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              handleExecute();
            }
          }}
        />
        <div
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '6px',
            cursor: 'row-resize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
            background: 'transparent',
          }}
          className="drag-handle"
        >
          <div
            style={{
              width: '40px',
              height: '3px',
              borderRadius: '2px',
              background: isDragging ? 'var(--accent-fg)' : 'var(--border-muted)',
              transition: isDragging ? 'none' : 'background 0.15s',
            }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Button onClick={resetRequest} size="sm" variant="ghost">
          清空
        </Button>
        <div className="flex gap-3">
          <Button onClick={handleParse} size="sm" variant="secondary">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            解析
          </Button>
          <Button onClick={handleFavorite} size="sm" variant="ghost" style={{ color: 'var(--warning-fg)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            收藏
          </Button>
          <Button onClick={handleExecute} size="sm" loading={loading}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '4px' }}>
              <path d="M8 5v14l11-7z" />
            </svg>
            执行
          </Button>
        </div>
      </div>
    </div>
  );
};
