import React, { useRef } from 'react';
import { ThemeToggle } from '../Common/ThemeToggle';
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
    <header
      className="flex items-center justify-between px-3 shrink-0"
      style={{
        height: 'var(--header-height)',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-fg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            oneCurl
          </span>
        </div>
        <div style={{ width: '1px', height: '16px', background: 'var(--border-default)' }} />
        <button
          onClick={addTab}
          className="ghost-btn"
          title="新建请求 (Ctrl+N)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>新建</span>
        </button>
      </div>
      <div className="flex items-center gap-1">
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        <button className="ghost-btn" onClick={() => fileInputRef.current?.click()} title="导入请求">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>导入</span>
        </button>
        <button className="ghost-btn" onClick={handleExportJson} title="导出 JSON">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>导出</span>
        </button>
        <button className="ghost-btn" onClick={handleExportCurl} title="复制 curl 命令">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          <span>cURL</span>
        </button>
        <div style={{ width: '1px', height: '16px', background: 'var(--border-default)' }} />
        <ThemeToggle />
      </div>
    </header>
  );
};
