import { create } from 'zustand';
import { HistoryRecord } from '../types/history';
import { invoke } from '@tauri-apps/api/core';

interface HistoryState {
  history: HistoryRecord[];
  loading: boolean;

  fetchHistory: () => Promise<void>;
  addToHistory: (record: HistoryRecord) => void;
  refreshHistory: () => Promise<void>;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  history: [],
  loading: false,

  fetchHistory: async () => {
    set({ loading: true });
    try {
      const history = await invoke<HistoryRecord[]>('get_history', { limit: 50 });
      set({ history, loading: false });
    } catch (error) {
      console.error('获取历史记录失败:', error);
      set({ loading: false });
    }
  },

  addToHistory: (record) => set((state) => ({
    history: [record, ...state.history].slice(0, 50)
  })),

  refreshHistory: async () => {
    try {
      const history = await invoke<HistoryRecord[]>('get_history', { limit: 50 });
      console.log('📥 [FRONTEND] Received history:', history);
      if (history.length > 0) {
        console.log('📥 [FRONTEND] First record curlCommand:', history[0].curlCommand);
        console.log('📥 [FRONTEND] First record request headers:', history[0].request.headers);
        console.log('📥 [FRONTEND] First record request body:', history[0].request.body);
      }
      set({ history });
    } catch (error) {
      console.error('刷新历史记录失败:', error);
    }
  },
}));
