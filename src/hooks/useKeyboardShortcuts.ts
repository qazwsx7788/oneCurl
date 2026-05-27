import { useEffect } from 'react';
import { useTabStore } from '../stores/tabStore';
import { executeRequest } from '../services/tauri';

export const useKeyboardShortcuts = () => {
  const { getActiveTab, setResponse, setLoading, setError, resetRequest } = useTabStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && e.key === 'Enter') {
        e.preventDefault();
        handleSendRequest();
      }

      if (isCtrl && e.key === 'l') {
        e.preventDefault();
        resetRequest();
      }

      if (isCtrl && e.key === 'n') {
        e.preventDefault();
        resetRequest();
      }
    };

    const handleSendRequest = async () => {
      const activeTab = getActiveTab();
      if (!activeTab || !activeTab.request.url) return;
      setLoading(true);
      setError(null);
      try {
        const response = await executeRequest(activeTab.request);
        setResponse(response);
      } catch (error) {
        setError(String(error));
      } finally {
        setLoading(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [getActiveTab, setResponse, setLoading, setError, resetRequest]);
};
