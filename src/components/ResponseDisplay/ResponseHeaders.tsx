import React from 'react';
import { KeyValuePair } from '../../types/request';

interface ResponseHeadersProps {
  headers: KeyValuePair[];
}

export const ResponseHeaders: React.FC<ResponseHeadersProps> = ({ headers }) => {
  if (headers.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-xs" style={{ color: 'var(--text-muted)' }}>
        无响应头
      </div>
    );
  }

  return (
    <div className="overflow-auto p-3">
      <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
            <th className="text-left py-1.5 px-2 font-medium" style={{ color: 'var(--text-secondary)', width: '35%' }}>
              名称
            </th>
            <th className="text-left py-1.5 px-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
              值
            </th>
          </tr>
        </thead>
        <tbody>
          {headers.map((header, index) => (
            <tr key={index} style={{ borderBottom: '1px solid var(--border-muted)' }}>
              <td className="py-1.5 px-2 font-mono" style={{ color: 'var(--accent-fg)' }}>
                {header.key}
              </td>
              <td className="py-1.5 px-2 font-mono break-all" style={{ color: 'var(--text-secondary)' }}>
                {header.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
