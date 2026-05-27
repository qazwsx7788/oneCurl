import { useEffect } from 'react';
import { Layout } from './components/Layout';
import { TabBar } from './components/Tabs/TabBar';
import { RequestInput } from './components/RequestInput';
import { ResponseDisplay } from './components/ResponseDisplay';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTabStore } from './stores/tabStore';

function App() {
  useKeyboardShortcuts();
  const { tabs, addTab } = useTabStore();

  useEffect(() => {
    if (tabs.length === 0) {
      addTab();
    }
  }, []);

  return (
    <Layout>
      <div className="flex flex-col h-full">
        <TabBar />
        <RequestInput />
        <div className="flex-1 overflow-hidden">
          <ResponseDisplay />
        </div>
      </div>
    </Layout>
  );
}

export default App;
