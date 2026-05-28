pub mod commands;
pub mod curl_parser;
pub mod http_client;
pub mod models;
pub mod storage;
pub mod websocket;

use commands::AppState;
use std::sync::Arc;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // 使用用户主目录下的 oneCurl 目录
            let home_dir = dirs::home_dir().expect("获取用户主目录失败");
            let app_dir = home_dir.join("oneCurl");
            std::fs::create_dir_all(&app_dir).expect("创建应用数据目录失败");

            let db_path = app_dir.join("onecurl.db");
            let storage =
                storage::Storage::new(db_path.to_str().unwrap()).expect("初始化数据库失败");

            let state = Arc::new(AppState {
                http_client: http_client::HttpClient::new(),
                storage,
                websocket: websocket::WebSocketClient::new(),
            });

            app.manage(state);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::parse_curl_command,
            commands::save_request,
            commands::execute_request,
            commands::get_history,
            commands::delete_history,
            commands::clear_history,
            commands::add_favorite,
            commands::upsert_favorite,
            commands::get_favorites,
            commands::remove_favorite,
            commands::update_favorite_name,
            commands::save_environment,
            commands::get_environments,
            commands::websocket_connect,
            commands::websocket_send,
            commands::websocket_messages,
            commands::websocket_disconnect,
            commands::get_projects,
            commands::get_project_tree,
            commands::create_project,
            commands::update_project,
            commands::delete_project,
            commands::get_requirements,
            commands::create_requirement,
            commands::update_requirement,
            commands::delete_requirement,
            commands::move_request_to,
            commands::get_favorites_filtered,
            commands::get_config,
            commands::set_config,
            commands::delete_config,
        ])
        .run(tauri::generate_context!())
        .expect("运行应用失败");
}
