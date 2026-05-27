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
  const [activeTab2, setActiveTab2] = useState('body');

  if (error) {
    return (
      <div className="p-4">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">请求失败</h3>
          <pre className="text-red-700 dark:text-red-300 text-sm whitespace-pre-wrap">{error}</pre>
        </div>
      </div>
    );
  }

  if (!response) {
    return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">发送请求以查看响应</div>;
  }

  const tabs = [
    { id: 'body', label: '响应体', content: <ResponseBody body={response.body} contentType={response.contentType} /> },
    { id: 'headers', label: '响应头', content: <ResponseHeaders headers={response.headers} /> },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <ResponseMeta response={response} />
      </div>
      <div className="flex-1 overflow-auto p-4">
        <Tabs tabs={tabs} activeTab={activeTab2} onTabChange={setActiveTab2} />
      </div>
    </div>
  );
};
