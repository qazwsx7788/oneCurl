import React, { useState } from 'react';
import { Button } from '../Common/Button';

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
    } catch {
      // 格式化失败返回原始内容
    }
    return body;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(body);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant={formatted ? 'primary' : 'secondary'} size="sm" onClick={() => setFormatted(true)}>格式化</Button>
          <Button variant={!formatted ? 'primary' : 'secondary'} size="sm" onClick={() => setFormatted(false)}>原始</Button>
        </div>
        <Button variant="secondary" size="sm" onClick={copyToClipboard}>复制</Button>
      </div>
      <pre className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-x-auto text-sm font-mono text-gray-900 dark:text-white whitespace-pre-wrap break-words">
        {formatBody(body)}
      </pre>
    </div>
  );
};
