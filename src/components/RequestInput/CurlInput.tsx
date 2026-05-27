import React from 'react';
import { Button } from '../Common/Button';
import { useTabStore } from '../../stores/tabStore';
import { useHistoryStore } from '../../stores/historyStore';
import { parseCurlCommand, executeRequest } from '../../services/tauri';

export const CurlInput: React.FC = () => {
  const { getActiveTab, setCurlCommand, setMethod, setUrl, setHeaders, setBody, setAuth, setProxy,
    setSslVerify, setTimeout: setRequestTimeout, setLoading, setError, setResponse } = useTabStore();
  const { refreshHistory } = useHistoryStore();
  const curlCommand = getActiveTab()?.curlCommand || '';

  const handleParse = async () => {
    if (!curlCommand.trim()) {
      alert('请输入 curl 命令');
      return;
    }
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
    if (!curlCommand.trim()) {
      alert('请输入 curl 命令');
      return;
    }
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
      setLoading(true);
      setError(null);
      const response = await executeRequest(request, curlCommand);
      setResponse({
        ...response,
        createdAt: new Date().toISOString(),
      });
      await refreshHistory();
    } catch (error) {
      console.error('执行 curl 命令失败:', error);
      setError(String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={curlCommand}
        onChange={(e) => setCurlCommand(e.target.value)}
        placeholder="粘贴 curl 命令..."
        className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex justify-end gap-2">
        <Button onClick={handleParse} size="sm" variant="secondary">
          解析命令
        </Button>
        <Button onClick={handleExecute} size="sm">
          直接执行
        </Button>
      </div>
    </div>
  );
};
