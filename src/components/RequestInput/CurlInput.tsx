import React from 'react';
import { Button } from '../Common/Button';
import { useTabStore } from '../../stores/tabStore';
import { useHistoryStore } from '../../stores/historyStore';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { useProjectStore } from '../../stores/projectStore';
import { parseCurlCommand, executeRequest, upsertFavorite } from '../../services/tauri';

export const CurlInput: React.FC = () => {
  const { getActiveTab, setCurlCommand, resetRequest, setMethod, setUrl, setHeaders, setBody, setAuth, setProxy,
    setSslVerify, setTimeout: setRequestTimeout, setLoading, setError, setResponse } = useTabStore();
  const { refreshHistory } = useHistoryStore();
  const { selectedProjectId, selectedRequirementId, fetchProjectTree } = useProjectStore();
  const { fetchFavorites } = useFavoritesStore();
  const curlCommand = getActiveTab()?.curlCommand || '';
  const loading = getActiveTab()?.loading || false;

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
      const requestWithProject = {
        ...request,
        projectId: selectedProjectId ?? undefined,
        requirementId: selectedRequirementId ?? undefined,
      };
      await upsertFavorite(requestWithProject, name.trim());
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
            height: '140px',
            padding: '8px 12px 8px 24px',
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
      </div>
      <div className="flex items-center justify-between">
        <Button onClick={resetRequest} size="sm" variant="ghost">
          清空
        </Button>
        <div className="flex gap-2">
          <Button onClick={handleParse} size="sm" variant="secondary">
            解析
          </Button>
          <Button onClick={handleFavorite} size="sm" variant="ghost" style={{ color: 'var(--warning-fg)' }}>
            收藏
          </Button>
          <Button onClick={handleExecute} size="sm" loading={loading}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            执行
          </Button>
        </div>
      </div>
    </div>
  );
};
