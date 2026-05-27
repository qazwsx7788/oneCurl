import React, { useState } from 'react';

interface ResponseBodyProps {
  body: string;
  contentType?: string;
}

export const ResponseBody: React.FC<ResponseBodyProps> = ({ body, contentType }) => {
  const [formatted, setFormatted] = useState(true);

  const formatBody = (body: string): string => {
    if (!formatted) return body;
    try {
      if (contentType?.includes('json')) {
        return JSON.stringify(JSON.parse(body), null, 2);
      }
    } catch { /* ignore */ }
    return body;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(body);
  };

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between px-3 py-1.5 shrink-0 sticky top-0 z-10"
        style={{ borderBottom: '1px solid var(--border-muted)', background: 'var(--bg-surface)' }}
      >
        <div className="flex gap-1">
          <button
            className="px-2 py-0.5 text-xs font-medium transition-colors"
            style={{
              color: formatted ? 'var(--accent-fg)' : 'var(--text-muted)',
              background: formatted ? 'rgba(88,166,255,0.1)' : 'transparent',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
            onClick={() => setFormatted(true)}
          >
            格式化
          </button>
          <button
            className="px-2 py-0.5 text-xs font-medium transition-colors"
            style={{
              color: !formatted ? 'var(--accent-fg)' : 'var(--text-muted)',
              background: !formatted ? 'rgba(88,166,255,0.1)' : 'transparent',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
            onClick={() => setFormatted(false)}
          >
            原始
          </button>
        </div>
        <button
          className="ghost-btn text-xs"
          onClick={handleCopy}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          复制
        </button>
      </div>
      <div className="flex-1 overflow-auto p-3">
        <pre
          className="code-block font-mono"
          style={{ margin: 0 }}
        >
          {formatBody(body)}
        </pre>
      </div>
    </div>
  );
};
