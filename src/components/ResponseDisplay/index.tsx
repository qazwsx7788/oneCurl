import React, { useState } from 'react';
import { useTabStore } from '../../stores/tabStore';
import { ResponseMeta } from './ResponseMeta';
import { ResponseHeaders } from './ResponseHeaders';
import { ResponseBody } from './ResponseBody';
import { Tabs } from '../Common/Tabs';

export const ResponseDisplay: React.FC = () => {
  const { getActiveTab } = useTabStore();
  const activeTab = getActiveTab();
  const response = activeTab?.response || null;
  const error = activeTab?.error || null;
  const [activeResTab, setActiveResTab] = useState('body');

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className="w-full max-w-lg p-4"
          style={{
            background: 'rgba(248,81,73,0.06)',
            border: '1px solid rgba(248,81,73,0.2)',
            borderRadius: 'var(--radius)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--danger-fg)" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span className="text-sm font-medium" style={{ color: 'var(--danger-fg)' }}>请求失败</span>
          </div>
          <pre className="text-xs font-mono whitespace-pre-wrap" style={{ color: 'var(--text-secondary)', margin: 0 }}>
            {error}
          </pre>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
          发送请求以查看响应
        </div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
          按 Ctrl+Enter 快速发送
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'body', label: '响应体', content: <ResponseBody body={response.body} contentType={response.contentType} /> },
    { id: 'headers', label: '响应头', content: <ResponseHeaders headers={response.headers} /> },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 shrink-0" style={{ borderBottom: '1px solid var(--border-muted)' }}>
        <ResponseMeta response={response} />
      </div>
      <div className="flex-1 overflow-hidden">
        <Tabs tabs={tabs} activeTab={activeResTab} onTabChange={setActiveResTab} />
      </div>
    </div>
  );
};
