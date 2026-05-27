import React, { useRef } from 'react';
import { ThemeToggle } from '../Common/ThemeToggle';
import { Button } from '../Common/Button';
import { useTabStore } from '../../stores/tabStore';
import { exportRequest, exportAsCurl, copyToClipboard, downloadAsFile } from '../../utils/export';
import { importFromFile } from '../../utils/import';

export const Header: React.FC = () => {
  const { addTab, getActiveTab, setMethod, setUrl, setHeaders, setBody, setAuth } = useTabStore();
  const currentRequest = getActiveTab()?.request || { method: 'GET', url: '', headers: [], ssl_verify: false };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJson = () => {
    const json = exportRequest(currentRequest);
    downloadAsFile(json, 'request.json');
  };

  const handleExportCurl = async () => {
    const curl = exportAsCurl(currentRequest);
    const success = await copyToClipboard(curl);
    if (success) {
      alert('已复制到剪贴板');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const request = await importFromFile(file);
    if (request) {
      setMethod(request.method);
      setUrl(request.url);
      setHeaders(request.headers);
      setBody(request.body || null);
      setAuth(request.auth || null);
    } else {
      alert('导入失败：无效的文件格式');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">oneCurl</h1>
        <Button size="sm" onClick={addTab}>新建请求</Button>
      </div>
      <div className="flex items-center gap-2">
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>导入</Button>
        <Button variant="secondary" size="sm" onClick={handleExportJson}>导出 JSON</Button>
        <Button variant="secondary" size="sm" onClick={handleExportCurl}>复制 curl</Button>
        <ThemeToggle />
      </div>
    </header>
  );
};
