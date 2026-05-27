import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';
type InputMode = 'curl' | 'form';

interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  activeTab: 'history' | 'favorites' | 'environments';
  inputMode: InputMode;

  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setActiveTab: (tab: 'history' | 'favorites' | 'environments') => void;
  setInputMode: (mode: InputMode) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'dark',
  sidebarOpen: true,
  activeTab: 'history',
  inputMode: 'curl',

  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActiveTab: (activeTab) => set({ activeTab }),
  setInputMode: (inputMode) => set({ inputMode }),
}));
