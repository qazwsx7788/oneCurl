use crate::models::*;
use anyhow::{anyhow, Result};
use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio_tungstenite::{connect_async, tungstenite::protocol::Message};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebSocketMessage {
    pub id: i64,
    pub direction: MessageDirection,
    pub content: String,
    pub message_type: MessageType,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MessageDirection {
    Sent,
    Received,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MessageType {
    Text,
    Binary,
}

pub struct WebSocketClient {
    sender: Arc<Mutex<Option<futures_util::stream::SplitSink<tokio_tungstenite::WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>, Message>>>>,
    messages: Arc<Mutex<Vec<WebSocketMessage>>>,
    connected: Arc<Mutex<bool>>,
}

impl WebSocketClient {
    pub fn new() -> Self {
        Self {
            sender: Arc::new(Mutex::new(None)),
            messages: Arc::new(Mutex::new(Vec::new())),
            connected: Arc::new(Mutex::new(false)),
        }
    }

    pub async fn connect(&self, url: &str, headers: Vec<KeyValuePair>) -> Result<()> {
        let mut builder = tauri::http::Request::builder()
            .uri(url)
            .method("GET");

        for header in &headers {
            if header.enabled {
                builder = builder.header(header.key.as_str(), header.value.as_str());
            }
        }

        let request = builder.body(())
            .map_err(|e| anyhow!("创建请求失败: {}", e))?;

        let (ws_stream, _) = connect_async(request).await
            .map_err(|e| anyhow!("连接失败: {}", e))?;

        let (write, _read) = ws_stream.split();

        *self.sender.lock().await = Some(write);
        *self.connected.lock().await = true;

        Ok(())
    }

    pub async fn send_text(&self, content: &str) -> Result<()> {
        let mut sender = self.sender.lock().await;
        if let Some(ref mut sender) = *sender {
            sender.send(Message::Text(content.to_string())).await
                .map_err(|e| anyhow!("发送失败: {}", e))?;

            let mut messages = self.messages.lock().await;
            let next_id = messages.len() as i64 + 1;
            messages.push(WebSocketMessage {
                id: next_id,
                direction: MessageDirection::Sent,
                content: content.to_string(),
                message_type: MessageType::Text,
                timestamp: chrono::Utc::now().to_rfc3339(),
            });

            Ok(())
        } else {
            Err(anyhow!("未连接"))
        }
    }

    pub async fn get_messages(&self) -> Vec<WebSocketMessage> {
        self.messages.lock().await.clone()
    }

    pub async fn is_connected(&self) -> bool {
        *self.connected.lock().await
    }

    pub async fn disconnect(&self) -> Result<()> {
        let mut sender = self.sender.lock().await;
        if let Some(ref mut sender) = *sender {
            sender.send(Message::Close(None)).await
                .map_err(|e| anyhow!("关闭连接失败: {}", e))?;
        }
        *self.connected.lock().await = false;
        Ok(())
    }
}
