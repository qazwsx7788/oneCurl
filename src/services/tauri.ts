import { invoke } from '@tauri-apps/api/core';
import { HttpRequest } from '../types/request';
import { HttpResponse } from '../types/response';
import { HistoryRecord } from '../types/history';
import { FavoriteRecord } from '../types/favorite';
import { Environment } from '../types/environment';
import { Project, Requirement, ProjectTree } from '../types/project';

export async function parseCurlCommand(input: string): Promise<HttpRequest> {
  return await invoke('parse_curl_command', { input });
}

export async function saveRequest(request: HttpRequest): Promise<number> {
  return await invoke('save_request', { request });
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
  description?: string,
  response?: HttpResponse
): Promise<number> {
  return await invoke('add_favorite', { requestId, name, description, response });
}

export async function upsertFavorite(
  request: HttpRequest,
  name: string,
  description?: string,
  response?: HttpResponse
): Promise<number> {
  return await invoke('upsert_favorite', { request, name, description, response });
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

export async function deleteEnvironment(id: number): Promise<void> {
  return await invoke('delete_environment', { id });
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

// ========== Project API ==========

export async function getProjects(): Promise<Project[]> {
  return await invoke('get_projects');
}

export async function getProjectTree(): Promise<ProjectTree[]> {
  return await invoke('get_project_tree');
}

export async function createProject(name: string, description?: string): Promise<number> {
  return await invoke('create_project', { name, description });
}

export async function updateProject(id: number, name: string, description?: string): Promise<void> {
  return await invoke('update_project', { id, name, description });
}

export async function deleteProject(id: number): Promise<void> {
  return await invoke('delete_project', { id });
}

// ========== Requirement API ==========

export async function getRequirements(projectId: number): Promise<Requirement[]> {
  return await invoke('get_requirements', { projectId });
}

export async function createRequirement(projectId: number, name: string, description?: string): Promise<number> {
  return await invoke('create_requirement', { projectId, name, description });
}

export async function updateRequirement(id: number, name: string, description?: string): Promise<void> {
  return await invoke('update_requirement', { id, name, description });
}

export async function deleteRequirement(id: number): Promise<void> {
  return await invoke('delete_requirement', { id });
}

export async function moveRequestTo(requestId: number, projectId?: number, requirementId?: number): Promise<void> {
  return await invoke('move_request_to', { requestId, projectId, requirementId });
}

export async function getFavoritesFiltered(projectId?: number, requirementId?: number): Promise<FavoriteRecord[]> {
    return await invoke('get_favorites_filtered', { projectId, requirementId });
}

export async function getConfig(key: string): Promise<string | null> {
    return await invoke('get_config', { key });
}

export async function setConfig(key: string, value: string): Promise<void> {
    return await invoke('set_config', { key, value });
}

export async function deleteConfig(key: string): Promise<void> {
    return await invoke('delete_config', { key });
}
