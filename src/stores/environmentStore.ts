import { create } from 'zustand';
import { Environment } from '../types/environment';
import { invoke } from '@tauri-apps/api/core';

interface EnvironmentState {
  environments: Environment[];
  activeEnvironment: Environment | null;
  loading: boolean;

  fetchEnvironments: () => Promise<void>;
  saveEnvironment: (env: Environment) => Promise<void>;
  setActiveEnvironment: (env: Environment | null) => void;
}

export const useEnvironmentStore = create<EnvironmentState>((set) => ({
  environments: [],
  activeEnvironment: null,
  loading: false,

  fetchEnvironments: async () => {
    set({ loading: true });
    try {
      const environments = await invoke<Environment[]>('get_environments');
      set({ environments, loading: false });
    } catch (error) {
      console.error('获取环境变量失败:', error);
      set({ loading: false });
    }
  },

  saveEnvironment: async (env) => {
    try {
      await invoke('save_environment', { env });
      const environments = await invoke<Environment[]>('get_environments');
      set({ environments });
    } catch (error) {
      console.error('保存环境变量失败:', error);
    }
  },

  setActiveEnvironment: (env) => set({ activeEnvironment: env }),
}));
