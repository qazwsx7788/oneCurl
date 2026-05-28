import { create } from 'zustand';
import { getConfig, setConfig } from '../services/tauri';

type Theme = 'light' | 'dark' | 'system';
type InputMode = 'curl' | 'form';

interface UIState {
    theme: Theme;
    sidebarOpen: boolean;
    activeTab: 'history' | 'favorites' | 'environments';
    inputMode: InputMode;
    initialized: boolean;

    init: () => Promise<void>;
    setTheme: (theme: Theme) => Promise<void>;
    toggleSidebar: () => Promise<void>;
    setActiveTab: (tab: 'history' | 'favorites' | 'environments') => Promise<void>;
    setInputMode: (mode: InputMode) => Promise<void>;
}

export const useUIStore = create<UIState>((set, get) => ({
    theme: 'light',
    sidebarOpen: true,
    activeTab: 'history',
    inputMode: 'curl',
    initialized: false,

    init: async () => {
        const [theme, sidebarOpenStr, activeTab, inputMode] = await Promise.all([
            getConfig('theme'),
            getConfig('sidebarOpen'),
            getConfig('activeTab'),
            getConfig('inputMode'),
        ]);

        set({
            theme: (theme === 'light' || theme === 'dark' || theme === 'system') ? theme : 'light',
            sidebarOpen: sidebarOpenStr !== 'false',
            activeTab: (activeTab === 'history' || activeTab === 'favorites' || activeTab === 'environments') ? activeTab : 'history',
            inputMode: (inputMode === 'curl' || inputMode === 'form') ? inputMode : 'curl',
            initialized: true,
        });
    },

    setTheme: async (theme: Theme) => {
        set({ theme });
        await setConfig('theme', theme);
    },

    toggleSidebar: async () => {
        const newValue = !get().sidebarOpen;
        set({ sidebarOpen: newValue });
        await setConfig('sidebarOpen', newValue.toString());
    },

    setActiveTab: async (activeTab: 'history' | 'favorites' | 'environments') => {
        set({ activeTab });
        await setConfig('activeTab', activeTab);
    },

    setInputMode: async (inputMode: InputMode) => {
        set({ inputMode });
        await setConfig('inputMode', inputMode);
    },
}));
