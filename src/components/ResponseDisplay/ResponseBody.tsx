import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';

interface ResponseBodyProps {
  body: string;
  contentType?: string;
}

export const ResponseBody: React.FC<ResponseBodyProps> = ({ body, contentType }) => {
  const [formatted, setFormatted] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  // 计算所有匹配位置
  const matches = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const formattedBody = formatBody(body);
    const matches: { index: number; start: number; end: number; text: string }[] = [];
    let pos = 0;
    let matchIndex = 0;

    while (pos < formattedBody.length) {
      const foundPos = formattedBody.toLowerCase().indexOf(searchTerm.toLowerCase(), pos);
      if (foundPos === -1) break;

      const endPos = foundPos + searchTerm.length;
      // 获取匹配行的上下文用于显示
      const lineStart = formattedBody.lastIndexOf('\n', foundPos) + 1;
      const lineEnd = formattedBody.indexOf('\n', endPos);
      const context = formattedBody.substring(lineStart, lineEnd === -1 ? undefined : lineEnd).trim();

      matches.push({
        index: matchIndex++,
        start: foundPos,
        end: endPos,
        text: context
      });
      pos = endPos;
    }

    return matches;
  }, [body, searchTerm, formatted]);

  // 高亮显示的文本
  const highlightedBody = useMemo(() => {
    if (!searchTerm.trim() || matches.length === 0) {
      return formatBody(body);
    }

    const formattedBody = formatBody(body);
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    matches.forEach((match, i) => {
      // 添加匹配前的文本
      if (match.start > lastIndex) {
        parts.push(formattedBody.substring(lastIndex, match.start));
      }

      // 添加高亮的匹配文本
      const isCurrentMatch = i === currentMatchIndex;
      parts.push(
        <mark
          key={i}
          style={{
            backgroundColor: isCurrentMatch ? 'var(--accent-fg)' : 'rgba(88,166,255,0.3)',
            color: isCurrentMatch ? 'white' : 'inherit',
            padding: '0 2px',
            borderRadius: '2px',
          }}
        >
          {formattedBody.substring(match.start, match.end)}
        </mark>
      );

      lastIndex = match.end;
    });

    // 添加剩余文本
    if (lastIndex < formattedBody.length) {
      parts.push(formattedBody.substring(lastIndex));
    }

    return <>{parts}</>;
  }, [body, searchTerm, matches, currentMatchIndex, formatted]);

  // 导航到上一个/下一个匹配
  const navigateMatch = useCallback((direction: 'prev' | 'next') => {
    if (matches.length === 0) return;

    const newIndex = direction === 'next'
      ? (currentMatchIndex + 1) % matches.length
      : (currentMatchIndex - 1 + matches.length) % matches.length;

    setCurrentMatchIndex(newIndex);

    // 滚动到匹配位置
    const match = matches[newIndex];
    if (scrollContainerRef.current && match) {
      const scrollElement = scrollContainerRef.current;
      const formattedBody = formatBody(body);

      // 简单的滚动策略：根据字符位置估算
      const beforeMatch = formattedBody.substring(0, match.start);
      const lineHeight = 20; // 估算行高
      const linesBefore = beforeMatch.split('\n').length;
      const targetPosition = linesBefore * lineHeight - scrollElement.clientHeight / 2;

      scrollElement.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: 'smooth'
      });
    }
  }, [matches, currentMatchIndex, body, formatted]);

  // 重置当前匹配索引当搜索词变化时
  useEffect(() => {
    setCurrentMatchIndex(0);
  }, [searchTerm]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!searchTerm.trim() || matches.length === 0) return;

      if (e.key === 'F3' || (e.ctrlKey && e.key === 'g')) {
        e.preventDefault();
        navigateMatch(e.shiftKey ? 'prev' : 'next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchTerm, matches, navigateMatch]);

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between px-3 py-1.5 shrink-0 sticky top-0 z-10"
        style={{ borderBottom: '1px solid var(--border-muted)', background: 'var(--bg-surface)' }}
      >
        <div className="flex gap-1 items-center">
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

          <div style={{ width: '1px', height: '16px', background: 'var(--border-muted)', margin: '0 4px' }} />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索..."
            className="text-xs"
            style={{
              padding: '2px 8px',
              border: '1px solid var(--border-default)',
              borderRadius: '3px',
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              width: '120px',
              outline: 'none',
            }}
          />

          {matches.length > 0 && (
            <>
              <button
                className="px-1.5 py-0.5 text-xs font-medium transition-colors"
                style={{
                  color: 'var(--text-secondary)',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                }}
                onClick={() => navigateMatch('prev')}
                title="上一个 (Shift+F3)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                className="px-1.5 py-0.5 text-xs font-medium transition-colors"
                style={{
                  color: 'var(--text-secondary)',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                }}
                onClick={() => navigateMatch('next')}
                title="下一个 (F3)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              <span className="text-xs" style={{ color: 'var(--text-muted)', minWidth: '60px', textAlign: 'center' }}>
                {matches.length > 0 && `${currentMatchIndex + 1}/${matches.length}`}
              </span>
            </>
          )}
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
      <div ref={scrollContainerRef} className="flex-1 overflow-auto p-3">
        <pre
          className="code-block font-mono"
          style={{ margin: 0 }}
        >
          {highlightedBody}
        </pre>
      </div>
    </div>
  );
};
