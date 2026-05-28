import React, { useState, useEffect } from 'react';
import { Button } from '../Common/Button';
import { useTabStore } from '../../stores/tabStore';
import { useHistoryStore } from '../../stores/historyStore';
import { useProjectStore } from '../../stores/projectStore';
import { executeRequest } from '../../services/tauri';
import { RequestBody } from '../../types/request';
import { generateCurlCommand } from '../../utils/curl';

const HTTP_METHODS = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'PATCH', label: 'PATCH' },
  { value: 'HEAD', label: 'HEAD' },
  { value: 'OPTIONS', label: 'OPTIONS' },
];

const getMethodClass = (method: string) => `method-${method.toLowerCase()}`;

const getBodyContent = (body?: RequestBody): string => {
  if (!body) return '';
  if ('Raw' in body) return body.Raw;
  if ('Json' in body) return body.Json;
  if ('Form' in body) return JSON.stringify(body.Form);
  return '';
};

const createBody = (content: string): RequestBody => ({ Raw: content });

const SectionToggle: React.FC<{
  label: string;
  count?: number;
  open: boolean;
  onToggle: () => void;
}> = ({ label, count, open, onToggle }) => (
  <button
    onClick={onToggle}
    className="flex items-center gap-2 w-full text-left py-1 group"
    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}
  >
    <svg
      width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.15s' }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
    <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
    {count !== undefined && (
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({count})</span>
    )}
  </button>
);

export const FormInput: React.FC = () => {
  const { getActiveTab, setMethod, setUrl, setHeaders, setBody, setSslVerify, setTimeout: setRequestTimeout, setResponse, setLoading, setError } = useTabStore();
  const { refreshHistory } = useHistoryStore();
  const { selectedProjectId, selectedRequirementId } = useProjectStore();
  const currentRequest = getActiveTab()?.request || { method: 'GET', url: '', headers: [], ssl_verify: false };
  const loading = getActiveTab()?.loading || false;
  const [showHeaders, setShowHeaders] = useState(currentRequest.headers.length > 0);
  const [showBody, setShowBody] = useState(!!currentRequest.body);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    setShowHeaders(currentRequest.headers.length > 0);
    setShowBody(!!currentRequest.body);
  }, [currentRequest.headers.length, currentRequest.body]);

  const handleSend = async () => {
    if (!currentRequest.url) return;
    setLoading(true);
    setError(null);
    try {
      // 先清空结果区域
      setResponse(null);
      const curlCommand = generateCurlCommand(currentRequest);
      // 关联当前选中的项目和需求
      const requestWithProject = {
        ...currentRequest,
        projectId: selectedProjectId ?? undefined,
        requirementId: selectedRequirementId ?? undefined,
      };
      const response = await executeRequest(requestWithProject, curlCommand);
      setResponse({ ...response, createdAt: new Date().toISOString() });
      await refreshHistory();
    } catch (error) {
      console.error('请求执行失败:', error);
      setError(String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleAddHeader = () => {
    setHeaders([...currentRequest.headers, { key: '', value: '', enabled: true }]);
  };

  const handleHeaderChange = (index: number, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    const newHeaders = [...currentRequest.headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setHeaders(newHeaders);
  };

  const handleRemoveHeader = (index: number) => {
    setHeaders(currentRequest.headers.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-2">
      {/* URL 栏 */}
      <div className="flex gap-2 items-stretch">
        <select
          value={currentRequest.method}
          onChange={(e) => setMethod(e.target.value)}
          className={`method-badge ${getMethodClass(currentRequest.method)}`}
          style={{
            padding: '4px 10px',
            fontSize: '14px',
            fontWeight: 700,
            fontFamily: 'inherit',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius)',
            background: 'var(--bg-base)',
            cursor: 'pointer',
            minWidth: '80px',
            textAlign: 'center',
          }}
        >
          {HTTP_METHODS.map((m) => (
            <option key={m.value} value={m.value}>{m.value}</option>
          ))}
        </select>
        <input
          value={currentRequest.url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/endpoint"
          className="flex-1 input-field font-mono"
          style={{ fontSize: '14px' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
        />
        <Button onClick={handleSend} loading={loading} size="sm">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          发送
        </Button>
      </div>

      {/* 折叠区域 */}
      <div className="flex flex-col gap-1">
        {/* Headers */}
        <SectionToggle label="Headers" count={currentRequest.headers.length} open={showHeaders} onToggle={() => setShowHeaders(!showHeaders)} />
        {showHeaders && (
          <div className="flex flex-col gap-1.5 pl-4">
            {currentRequest.headers.map((header, index) => (
              <div key={index} className="flex gap-1.5 items-center">
                <input
                  type="checkbox"
                  checked={header.enabled}
                  onChange={(e) => handleHeaderChange(index, 'enabled', e.target.checked)}
                  style={{ accentColor: 'var(--accent-fg)' }}
                />
                <input
                  value={header.key}
                  onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                  placeholder="名称"
                  className="flex-1 input-field font-mono"
                  style={{ fontSize: '14px', padding: '4px 8px' }}
                />
                <input
                  value={header.value}
                  onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                  placeholder="值"
                  className="flex-1 input-field font-mono"
                  style={{ fontSize: '14px', padding: '4px 8px' }}
                />
                <button
                  onClick={() => handleRemoveHeader(index)}
                  className="icon-btn"
                  style={{ width: '22px', height: '22px', color: 'var(--danger-fg)' }}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={handleAddHeader}
              className="ghost-btn self-start text-xs"
              style={{ color: 'var(--accent-fg)' }}
            >
              + 添加
            </button>
          </div>
        )}

        {/* Body */}
        <SectionToggle label="Body" open={showBody} onToggle={() => setShowBody(!showBody)} />
        {showBody && (
          <div className="pl-4">
            <textarea
              value={getBodyContent(currentRequest.body)}
              onChange={(e) => setBody(createBody(e.target.value))}
              placeholder="请求体内容（JSON、XML 等）"
              className="w-full font-mono text-xs resize-none outline-none"
              style={{
                height: '80px',
                padding: '8px 10px',
                background: 'var(--bg-base)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius)',
                color: 'var(--text-primary)',
                lineHeight: '1.6',
              }}
            />
          </div>
        )}

        {/* Options */}
        <SectionToggle label="选项" open={showOptions} onToggle={() => setShowOptions(!showOptions)} />
        {showOptions && (
          <div className="flex flex-col gap-2 pl-4">
            <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={currentRequest.ssl_verify}
                onChange={(e) => setSslVerify(e.target.checked)}
                style={{ accentColor: 'var(--accent-fg)' }}
              />
              SSL 证书验证
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>超时 (秒):</span>
              <input
                type="number"
                value={currentRequest.timeout || ''}
                onChange={(e) => setRequestTimeout(e.target.value ? parseInt(e.target.value) : undefined)}
                className="input-field"
                style={{ fontSize: '14px', padding: '3px 8px', width: '80px' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
