import React from 'react';
import { HttpResponse } from '../../types/response';

interface ResponseMetaProps {
  response: HttpResponse;
}

export const ResponseMeta: React.FC<ResponseMetaProps> = ({ response }) => {
  const getStatusClass = (code: number) => {
    if (code >= 200 && code < 300) return 'status-success';
    if (code >= 300 && code < 400) return 'status-warning';
    if (code >= 400) return 'status-error';
    return '';
  };

  const formatSize = (bytes?: number) => {
    if (bytes == null || isNaN(bytes)) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTime = (ms?: number) => {
    if (ms == null || isNaN(ms)) return '-';
    return `${ms}ms`;
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    const isoString = dateStr.replace(' ', 'T');
    const date = new Date(isoString);
    return isNaN(date.getTime()) ? dateStr : date.toLocaleString('zh-CN');
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className={`status-badge ${getStatusClass(response.statusCode)}`}>
        {response.statusCode}
      </span>
      <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
        {formatTime(response.responseTime)}
      </div>
      <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
        </svg>
        {formatSize(response.responseSize)}
      </div>
      {response.contentType && (
        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          {response.contentType.split(';')[0]}
        </span>
      )}
      <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
        {formatDateTime(response.createdAt)}
      </span>
    </div>
  );
};
