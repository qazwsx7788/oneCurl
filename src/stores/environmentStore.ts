import { create } from 'zustand';
import { Environment } from '../types/environment';
import { invoke } from '@tauri-apps/api/core';
import { getConfig, setConfig, deleteConfig } from '../services/tauri';

interface EnvironmentState {
  environments: Environment[];
  activeEnvironment: Environment | null;
  loading: boolean;

  fetchEnvironments: () => Promise<void>;
  saveEnvironment: (env: Environment) => Promise<void>;
  deleteEnvironment: (id: number) => Promise<void>;
  setActiveEnvironment: (env: Environment | null) => Promise<void>;
  init: () => Promise<void>;
}

const syncEnvironments = async (set: any, get: any) => {
  const environments = await invoke<Environment[]>('get_environments');
  const { activeEnvironment } = get();
  const updatedActive = activeEnvironment
    ? environments.find((e) => e.id === activeEnvironment.id) || null
    : null;
  set({ environments, activeEnvironment: updatedActive });
  return environments;
};

export const useEnvironmentStore = create<EnvironmentState>((set, get) => ({
  environments: [],
  activeEnvironment: null,
  loading: false,

  init: async () => {
    try {
      const environments = await invoke<Environment[]>('get_environments');
      const activeIdStr = await getConfig('activeEnvironmentId');
      let activeEnvironment: Environment | null = null;

      if (activeIdStr) {
        const activeId = parseInt(activeIdStr, 10);
        activeEnvironment = environments.find((e) => e.id === activeId) || null;
      }

      set({ environments, activeEnvironment });
    } catch (error) {
      console.error('初始化环境失败:', error);
    }
  },

  fetchEnvironments: async () => {
    set({ loading: true });
    try {
      await syncEnvironments(set, get);
      set({ loading: false });
    } catch (error) {
      console.error('获取环境变量失败:', error);
      set({ loading: false });
    }
  },

  saveEnvironment: async (env) => {
    try {
      await invoke('save_environment', { env });
      await syncEnvironments(set, get);
    } catch (error) {
      console.error('保存环境变量失败:', error);
    }
  },

  deleteEnvironment: async (id) => {
    try {
      await invoke('delete_environment', { id });
      await syncEnvironments(set, get);
      const { activeEnvironment } = get();
      if (activeEnvironment === null) {
        await deleteConfig('activeEnvironmentId');
      }
    } catch (error) {
      console.error('删除环境失败:', error);
    }
  },

  setActiveEnvironment: async (env) => {
    set({ activeEnvironment: env });
    try {
      await setConfig('activeEnvironmentId', env ? env.id.toString() : '');
    } catch (error) {
      console.error('持久化激活环境失败:', error);
    }
  },
}));
