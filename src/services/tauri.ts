import { invoke } from '@tauri-apps/api/core';
import { HttpRequest } from '../types/request';
import { HttpResponse } from '../types/response';
import { HistoryRecord } from '../types/history';
import { FavoriteRecord } from '../types/favorite';
import { Environment } from '../types/environment';

export async function parseCurlCommand(input: string): Promise<HttpRequest> {
  return await invoke('parse_curl_command', { input });
}

export async function executeRequest(request: HttpRequest, curlCommand?: string): Promise<HttpResponse> {
  return await invoke('execute_request', { request, curlCommand });
}

export async function getHistory(limit?: number): Promise<HistoryRecord[]> {
  return await invoke('get_history', { limit });
}

export async function deleteHistory(historyId: number): Promise<void> {
  return await invoke('delete_history', { historyId });
}

export async function clearHistory(): Promise<void> {
  return await invoke('clear_history');
}

export async function addFavorite(
  requestId: number,
  name: string,
  description?: string
): Promise<number> {
  return await invoke('add_favorite', { requestId, name, description });
}

export async function getFavorites(): Promise<FavoriteRecord[]> {
  return await invoke('get_favorites');
}

export async function removeFavorite(favoriteId: number): Promise<void> {
  return await invoke('remove_favorite', { favoriteId });
}

export async function saveEnvironment(env: Environment): Promise<number> {
  return await invoke('save_environment', { env });
}

export async function getEnvironments(): Promise<Environment[]> {
  return await invoke('get_environments');
}

export async function websocketConnect(url: string, headers: any[]): Promise<void> {
  return await invoke('websocket_connect', { url, headers });
}

export async function websocketSend(message: string): Promise<void> {
  return await invoke('websocket_send', { message });
}

export async function websocketMessages(): Promise<any[]> {
  return await invoke('websocket_messages');
}

export async function websocketDisconnect(): Promise<void> {
  return await invoke('websocket_disconnect');
}
