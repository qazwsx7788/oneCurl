import React, { useState, useEffect } from 'react';
import { Select } from '../Common/Select';
import { Input } from '../Common/Input';
import { Button } from '../Common/Button';
import { useTabStore } from '../../stores/tabStore';
import { useHistoryStore } from '../../stores/historyStore';
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

const getBodyContent = (body?: RequestBody): string => {
  if (!body) return '';
  if ('Raw' in body) return body.Raw;
  if ('Json' in body) return body.Json;
  if ('Form' in body) return JSON.stringify(body.Form);
  return '';
};

const createBody = (content: string): RequestBody => ({ Raw: content });

export const FormInput: React.FC = () => {
  const { getActiveTab, setMethod, setUrl, setHeaders, setBody, setSslVerify, setTimeout: setRequestTimeout, setResponse, setLoading, setError } = useTabStore();
  const { refreshHistory } = useHistoryStore();
  const currentRequest = getActiveTab()?.request || { method: 'GET', url: '', headers: [], ssl_verify: false };
  const loading = getActiveTab()?.loading || false;
  const [showHeaders, setShowHeaders] = useState(currentRequest.headers.length > 0);
  const [showBody, setShowBody] = useState(!!currentRequest.body);
  const [showAuth, setShowAuth] = useState(!!currentRequest.auth);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    setShowHeaders(currentRequest.headers.length > 0);
    setShowBody(!!currentRequest.body);
    setShowAuth(!!currentRequest.auth);
  }, [currentRequest.headers.length, currentRequest.body, currentRequest.auth]);

  const handleSend = async () => {
    if (!currentRequest.url) {
      alert('请输入 URL');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const curlCommand = generateCurlCommand(currentRequest);
      const response = await executeRequest(currentRequest, curlCommand);
      setResponse({
        ...response,
        createdAt: new Date().toISOString(),
      });
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

  const handleBodyChange = (content: string) => {
    setBody(createBody(content));
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 请求行 */}
      <div className="flex gap-2">
        <Select options={HTTP_METHODS} value={currentRequest.method} onChange={setMethod} className="w-32" />
        <Input value={currentRequest.url} onChange={(e) => setUrl(e.target.value)} placeholder="输入 URL" className="flex-1" />
        <Button onClick={handleSend} loading={loading}>发送</Button>
      </div>

      {/* Headers */}
      <div>
        <button
          onClick={() => setShowHeaders(!showHeaders)}
          className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
        >
          {showHeaders ? '▼' : '▶'} Headers ({currentRequest.headers.length})
        </button>
        {showHeaders && (
          <div className="mt-2 flex flex-col gap-2">
            {currentRequest.headers.map((header, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={header.enabled}
                  onChange={(e) => handleHeaderChange(index, 'enabled', e.target.checked)}
                  className="w-4 h-4"
                />
                <Input
                  value={header.key}
                  onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                  placeholder="Header 名称"
                  className="flex-1"
                />
                <Input
                  value={header.value}
                  onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                  placeholder="Header 值"
                  className="flex-1"
                />
                <button
                  onClick={() => handleRemoveHeader(index)}
                  className="px-2 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                >
                  ✕
                </button>
              </div>
            ))}
            <Button onClick={handleAddHeader} size="sm" variant="secondary">+ 添加 Header</Button>
          </div>
        )}
      </div>

      {/* Body */}
      <div>
        <button
          onClick={() => setShowBody(!showBody)}
          className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
        >
          {showBody ? '▼' : '▶'} Body
        </button>
        {showBody && (
          <div className="mt-2">
            <textarea
              value={getBodyContent(currentRequest.body)}
              onChange={(e) => handleBodyChange(e.target.value)}
              placeholder="请求体内容"
              className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Auth */}
      <div>
        <button
          onClick={() => setShowAuth(!showAuth)}
          className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
        >
          {showAuth ? '▼' : '▶'} Auth
        </button>
        {showAuth && (
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            认证功能开发中...
          </div>
        )}
      </div>

      {/* Options */}
      <div>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
        >
          {showOptions ? '▼' : '▶'} Options
        </button>
        {showOptions && (
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sslVerify"
                checked={currentRequest.ssl_verify}
                onChange={(e) => setSslVerify(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="sslVerify" className="text-sm text-gray-700 dark:text-gray-300">SSL 证书验证</label>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">超时 (秒):</label>
              <Input
                type="number"
                value={currentRequest.timeout || ''}
                onChange={(e) => setRequestTimeout(e.target.value ? parseInt(e.target.value) : undefined)}
                className="flex-1"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
