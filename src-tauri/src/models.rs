use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HttpRequest {
    pub id: Option<i64>,
    pub name: Option<String>,
    pub method: String,
    pub url: String,
    pub headers: Vec<KeyValuePair>,
    pub body: Option<RequestBody>,
    pub auth: Option<AuthConfig>,
    pub proxy: Option<ProxyConfig>,
    pub ssl_verify: bool,
    pub timeout: Option<u64>,
    pub project_id: Option<i64>,
    pub requirement_id: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyValuePair {
    pub key: String,
    pub value: String,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RequestBody {
    Json(String),
    Form(Vec<KeyValuePair>),
    Multipart(Vec<MultipartField>),
    Raw(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MultipartField {
    pub name: String,
    pub value: MultipartValue,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MultipartValue {
    Text(String),
    File(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuthConfig {
    Basic { username: String, password: String },
    Bearer { token: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProxyConfig {
    pub proxy_type: ProxyType,
    pub host: String,
    pub port: u16,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ProxyType {
    Http,
    Https,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HttpResponse {
    pub status_code: u16,
    pub headers: Vec<KeyValuePair>,
    pub body: String,
    pub response_time: u64,
    pub response_size: usize,
    pub content_type: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HistoryRecord {
    pub id: i64,
    pub request: HttpRequest,
    pub curl_command: String,
    pub response: Option<HttpResponse>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FavoriteRecord {
    pub id: i64,
    pub request: HttpRequest,
    pub name: String,
    pub description: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Environment {
    pub id: i64,
    pub name: String,
    pub variables: Vec<EnvironmentVariable>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvironmentVariable {
    pub key: String,
    pub value: String,
    pub variable_type: VariableType,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VariableType {
    String,
    Number,
    Boolean,
    Secret,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    pub id: i64,
    pub request_id: Option<i64>,
    pub level: LogLevel,
    pub message: String,
    pub details: Option<serde_json::Value>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LogLevel {
    Minimal,
    Normal,
    Verbose,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
    pub sort_order: i32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Requirement {
    pub id: i64,
    pub project_id: i64,
    pub name: String,
    pub description: Option<String>,
    pub sort_order: i32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectTree {
    pub project: Project,
    pub requirements: Vec<RequirementWithFavorites>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequirementWithFavorites {
    pub requirement: Requirement,
    pub favorites: Vec<FavoriteRecord>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    pub key: String,
    pub value: String,
}
