import { create } from 'zustand';
import { FavoriteRecord } from '../types/favorite';
import { HttpResponse } from '../types/response';
import { invoke } from '@tauri-apps/api/core';

interface FavoritesState {
  favorites: FavoriteRecord[];
  loading: boolean;

  fetchFavorites: () => Promise<void>;
  addFavorite: (requestId: number, name: string, description?: string, response?: HttpResponse) => Promise<void>;
  removeFavorite: (favoriteId: number) => Promise<void>;
  updateFavoriteName: (favoriteId: number, name: string) => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set) => ({
  favorites: [],
  loading: false,

  fetchFavorites: async () => {
    set({ loading: true });
    try {
      const favorites = await invoke<FavoriteRecord[]>('get_favorites');
      set({ favorites, loading: false });
    } catch (error) {
      console.error('获取收藏失败:', error);
      set({ loading: false });
    }
  },

  addFavorite: async (requestId, name, description, response) => {
    try {
      await invoke('add_favorite', { requestId, name, description, response });
      const favorites = await invoke<FavoriteRecord[]>('get_favorites');
      set({ favorites });
    } catch (error) {
      console.error('添加收藏失败:', error);
    }
  },

  removeFavorite: async (favoriteId) => {
    try {
      await invoke('remove_favorite', { favoriteId });
      const favorites = await invoke<FavoriteRecord[]>('get_favorites');
      set({ favorites });
    } catch (error) {
      console.error('取消收藏失败:', error);
    }
  },

  updateFavoriteName: async (favoriteId, name) => {
    try {
      await invoke('update_favorite_name', { favoriteId, name });
      const favorites = await invoke<FavoriteRecord[]>('get_favorites');
      set({ favorites });
    } catch (error) {
      console.error('更新收藏名称失败:', error);
    }
  },
}));
