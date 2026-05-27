import React from 'react';
import { KeyValuePair } from '../../types/request';

interface ResponseHeadersProps {
  headers: KeyValuePair[];
}

export const ResponseHeaders: React.FC<ResponseHeadersProps> = ({ headers }) => {
  if (headers.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400 text-sm">无响应头</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400 font-medium">名称</th>
            <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400 font-medium">值</th>
          </tr>
        </thead>
        <tbody>
          {headers.map((header, index) => (
            <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
              <td className="py-2 px-3 font-mono text-gray-900 dark:text-white">{header.key}</td>
              <td className="py-2 px-3 font-mono text-gray-700 dark:text-gray-300 break-all">{header.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
