use crate::curl_parser;
use crate::http_client::HttpClient;
use crate::models::*;
use crate::storage::Storage;
use crate::websocket::WebSocketClient;
use std::sync::Arc;
use tauri::State;

pub struct AppState {
    pub http_client: HttpClient,
    pub storage: Storage,
    pub websocket: WebSocketClient,
}

#[tauri::command]
pub async fn parse_curl_command(input: String) -> Result<HttpRequest, String> {
    curl_parser::parse_curl(&input).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn execute_request(
    request: HttpRequest,
    curl_command: Option<String>,
    state: State<'_, Arc<AppState>>,
) -> Result<HttpResponse, String> {
    let response = state
        .http_client
        .execute(&request)
        .await
        .map_err(|e| e.to_string())?;

    // 保存到历史记录
    if let Ok(request_id) = state.storage.save_request(&request) {
        let curl_cmd = curl_command.unwrap_or_else(|| {
            // 如果没有 curl 命令，构建一个基本的
            format!("curl -X {} {}", request.method, request.url)
        });
        let _ = state.storage.save_history(request_id, &curl_cmd, &response);
    }

    Ok(response)
}

#[tauri::command]
pub async fn get_history(
    limit: Option<usize>,
    state: State<'_, Arc<AppState>>,
) -> Result<Vec<HistoryRecord>, String> {
    state
        .storage
        .get_history(limit.unwrap_or(50))
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_history(history_id: i64, state: State<'_, Arc<AppState>>) -> Result<(), String> {
    state
        .storage
        .delete_history(history_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn clear_history(state: State<'_, Arc<AppState>>) -> Result<(), String> {
    state
        .storage
        .clear_history()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn add_favorite(
    request_id: i64,
    name: String,
    description: Option<String>,
    state: State<'_, Arc<AppState>>,
) -> Result<i64, String> {
    state
        .storage
        .add_favorite(request_id, &name, description.as_deref())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_favorites(
    state: State<'_, Arc<AppState>>,
) -> Result<Vec<FavoriteRecord>, String> {
    state.storage.get_favorites().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn remove_favorite(
    favorite_id: i64,
    state: State<'_, Arc<AppState>>,
) -> Result<(), String> {
    state.storage.remove_favorite(favorite_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn save_environment(
    env: Environment,
    state: State<'_, Arc<AppState>>,
) -> Result<i64, String> {
    state
        .storage
        .save_environment(&env)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_environments(
    state: State<'_, Arc<AppState>>,
) -> Result<Vec<Environment>, String> {
    state.storage.get_environments().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn websocket_connect(
    url: String,
    headers: Vec<KeyValuePair>,
    state: State<'_, Arc<AppState>>,
) -> Result<(), String> {
    state
        .websocket
        .connect(&url, headers)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn websocket_send(
    message: String,
    state: State<'_, Arc<AppState>>,
) -> Result<(), String> {
    state
        .websocket
        .send_text(&message)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn websocket_messages(
    state: State<'_, Arc<AppState>>,
) -> Result<Vec<crate::websocket::WebSocketMessage>, String> {
    Ok(state.websocket.get_messages().await)
}

#[tauri::command]
pub async fn websocket_disconnect(
    state: State<'_, Arc<AppState>>,
) -> Result<(), String> {
    state
        .websocket
        .disconnect()
        .await
        .map_err(|e| e.to_string())
}
