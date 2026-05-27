import { create } from 'zustand';
import { HttpRequest, KeyValuePair, RequestBody } from '../types/request';
import { HttpResponse } from '../types/response';

export interface Tab {
  id: string;
  name: string;
  request: HttpRequest;
  curlCommand: string;
  response: HttpResponse | null;
  error: string | null;
  loading: boolean;
}

interface TabState {
  tabs: Tab[];
  activeTabId: string | null;

  // Tab 操作
  addTab: () => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;

  // 当前活跃 tab 的操作
  getActiveTab: () => Tab | null;
  setMethod: (method: string) => void;
  setUrl: (url: string) => void;
  setHeaders: (headers: KeyValuePair[]) => void;
  setBody: (body: RequestBody | null) => void;
  setAuth: (auth: any) => void;
  setProxy: (proxy: any) => void;
  setSslVerify: (verify: boolean) => void;
  setTimeout: (timeout: number | undefined) => void;
  setCurlCommand: (command: string) => void;
  setResponse: (response: HttpResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetRequest: () => void;
  loadRequest: (request: HttpRequest) => void;
}

const defaultRequest: HttpRequest = {
  method: 'GET',
  url: '',
  headers: [],
  ssl_verify: false,
};

const createDefaultTab = (id: string, name: string): Tab => ({
  id,
  name,
  request: { ...defaultRequest },
  curlCommand: '',
  response: null,
  error: null,
  loading: false,
});

let tabCounter = 1;

const updateActiveTab = (set: any, updater: (tab: Tab) => Tab) => {
  set((state: TabState) => ({
    tabs: state.tabs.map((t) =>
      t.id === state.activeTabId ? updater(t) : t
    ),
  }));
};

export const useTabStore = create<TabState>((set, get) => ({
  tabs: [createDefaultTab('tab-1', '请求 1')],
  activeTabId: 'tab-1',

  addTab: () => {
    tabCounter++;
    const newTab = createDefaultTab(`tab-${Date.now()}`, `请求 ${tabCounter}`);
    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id,
    }));
  },

  closeTab: (tabId) => {
    set((state) => {
      if (state.tabs.length <= 1) return state;
      const newTabs = state.tabs.filter((t) => t.id !== tabId);
      const activeTabId = state.activeTabId === tabId
        ? newTabs[newTabs.length - 1].id
        : state.activeTabId;
      return { tabs: newTabs, activeTabId };
    });
  },

  setActiveTab: (tabId) => set({ activeTabId: tabId }),

  getActiveTab: () => {
    const state = get();
    return state.tabs.find((t) => t.id === state.activeTabId) || null;
  },

  setMethod: (method) => updateActiveTab(set, (tab) => ({
    ...tab,
    request: { ...tab.request, method },
  })),

  setUrl: (url) => updateActiveTab(set, (tab) => ({
    ...tab,
    request: { ...tab.request, url },
  })),

  setHeaders: (headers) => updateActiveTab(set, (tab) => ({
    ...tab,
    request: { ...tab.request, headers },
  })),

  setBody: (body) => updateActiveTab(set, (tab) => ({
    ...tab,
    request: { ...tab.request, body: body || undefined },
  })),

  setAuth: (auth) => updateActiveTab(set, (tab) => ({
    ...tab,
    request: { ...tab.request, auth: auth || undefined },
  })),

  setProxy: (proxy) => updateActiveTab(set, (tab) => ({
    ...tab,
    request: { ...tab.request, proxy: proxy || undefined },
  })),

  setSslVerify: (ssl_verify) => updateActiveTab(set, (tab) => ({
    ...tab,
    request: { ...tab.request, ssl_verify },
  })),

  setTimeout: (timeout) => updateActiveTab(set, (tab) => ({
    ...tab,
    request: { ...tab.request, timeout },
  })),

  setCurlCommand: (curlCommand) => updateActiveTab(set, (tab) => ({
    ...tab,
    curlCommand,
  })),

  setResponse: (response) => updateActiveTab(set, (tab) => ({
    ...tab,
    response,
  })),

  setLoading: (loading) => updateActiveTab(set, (tab) => ({
    ...tab,
    loading,
  })),

  setError: (error) => updateActiveTab(set, (tab) => ({
    ...tab,
    error,
  })),

  resetRequest: () => updateActiveTab(set, (tab) => ({
    ...tab,
    request: { ...defaultRequest },
    curlCommand: '',
    response: null,
    error: null,
  })),

  loadRequest: (request) => updateActiveTab(set, (tab) => ({
    ...tab,
    request,
    response: null,
    error: null,
  })),
}));
