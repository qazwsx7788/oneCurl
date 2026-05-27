use crate::models::*;
use anyhow::{anyhow, Result};
use rusqlite::{Connection, params};
use std::sync::Mutex;

fn generate_curl_command(request: &HttpRequest) -> String {
    println!("🔧 [GENERATE] Starting curl command generation");
    println!("🔧 [GENERATE] Method: {}", request.method);
    println!("🔧 [GENERATE] URL: {}", request.url);
    println!("🔧 [GENERATE] Headers count: {}", request.headers.len());
    println!("🔧 [GENERATE] Body: {:?}", request.body);
    println!("🔧 [GENERATE] Auth: {:?}", request.auth);

    let mut cmd = format!("curl -X {}", request.method);

    // 添加 headers
    for header in &request.headers {
        if header.enabled {
            println!("🔧 [GENERATE] Adding header: {}: {}", header.key, header.value);
            cmd.push_str(&format!(" -H '{}: {}'", header.key, header.value));
        }
    }

    // 添加 body
    if let Some(body) = &request.body {
        match body {
            RequestBody::Raw(content) => {
                println!("🔧 [GENERATE] Adding raw body: {}", content);
                cmd.push_str(&format!(" -d '{}'", content));
            }
            RequestBody::Json(content) => {
                println!("🔧 [GENERATE] Adding json body: {}", content);
                cmd.push_str(&format!(" -d '{}'", content));
            }
            RequestBody::Form(fields) => {
                for field in fields {
                    if field.enabled {
                        println!("🔧 [GENERATE] Adding form field: {}={}", field.key, field.value);
                        cmd.push_str(&format!(" -F '{}={}'", field.key, field.value));
                    }
                }
            }
            RequestBody::Multipart(_) => {
                // Multipart 暂不支持
            }
        }
    }

    // 添加认证
    if let Some(auth) = &request.auth {
        match auth {
            AuthConfig::Basic { username, password } => {
                println!("🔧 [GENERATE] Adding basic auth");
                cmd.push_str(&format!(" -u '{}:{}'", username, password));
            }
            AuthConfig::Bearer { token } => {
                println!("🔧 [GENERATE] Adding bearer auth");
                cmd.push_str(&format!(" -H 'Authorization: Bearer {}'", token));
            }
        }
    }

    // SSL 验证
    if !request.ssl_verify {
        println!("🔧 [GENERATE] Adding -k (no SSL verify)");
        cmd.push_str(" -k");
    }

    // 超时
    if let Some(timeout) = request.timeout {
        println!("🔧 [GENERATE] Adding timeout: {}", timeout);
        cmd.push_str(&format!(" -m {}", timeout));
    }

    // URL
    cmd.push_str(&format!(" '{}'", request.url));

    println!("🔧 [GENERATE] Final command: {}", cmd);
    cmd
}

pub struct Storage {
    conn: Mutex<Connection>,
}

impl Storage {
    pub fn new(db_path: &str) -> Result<Self> {
        let conn = Connection::open(db_path)?;
        let storage = Self {
            conn: Mutex::new(conn),
        };
        storage.init_tables()?;
        Ok(storage)
    }

    fn init_tables(&self) -> Result<()> {
        let conn = self.conn.lock().map_err(|e| anyhow!("获取锁失败: {}", e))?;

        conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                method TEXT NOT NULL,
                url TEXT NOT NULL,
                headers TEXT,
                body TEXT,
                auth TEXT,
                proxy TEXT,
                ssl_verify BOOLEAN DEFAULT 1,
                timeout INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                request_id INTEGER NOT NULL,
                curl_command TEXT,
                status_code INTEGER,
                response_headers TEXT,
                response_body TEXT,
                response_time INTEGER,
                response_size INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (request_id) REFERENCES requests(id)
            );

            CREATE TABLE IF NOT EXISTS favorites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                request_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (request_id) REFERENCES requests(id)
            );

            CREATE TABLE IF NOT EXISTS environments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                variables TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                request_id INTEGER,
                level TEXT NOT NULL,
                message TEXT NOT NULL,
                details TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (request_id) REFERENCES requests(id)
            );
            "
        )?;

        // 添加缺失的列（用于数据库迁移）
        // 检查并添加 curl_command 列到 history 表
        let _ = conn.execute(
            "ALTER TABLE history ADD COLUMN curl_command TEXT",
            [],
        );

        Ok(())
    }

    pub fn save_request(&self, request: &HttpRequest) -> Result<i64> {
        let conn = self.conn.lock().map_err(|e| anyhow!("获取锁失败: {}", e))?;

        let headers_json = serde_json::to_string(&request.headers)?;
        let body_json = request.body.as_ref().map(|b| serde_json::to_string(b).unwrap_or_default());
        let auth_json = request.auth.as_ref().map(|a| serde_json::to_string(a).unwrap_or_default());
        let proxy_json = request.proxy.as_ref().map(|p| serde_json::to_string(p).unwrap_or_default());

        conn.execute(
            "INSERT INTO requests (name, method, url, headers, body, auth, proxy, ssl_verify, timeout) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                request.name,
                request.method,
                request.url,
                headers_json,
                body_json,
                auth_json,
                proxy_json,
                request.ssl_verify,
                request.timeout,
            ],
        )?;

        Ok(conn.last_insert_rowid())
    }

    pub fn get_request(&self, id: i64) -> Result<Option<HttpRequest>> {
        let conn = self.conn.lock().map_err(|e| anyhow!("获取锁失败: {}", e))?;

        let mut stmt = conn.prepare(
            "SELECT id, name, method, url, headers, body, auth, proxy, ssl_verify, timeout FROM requests WHERE id = ?1"
        )?;

        let mut rows = stmt.query_map(params![id], |row| {
            let headers_str: Option<String> = row.get(4)?;
            let body_str: Option<String> = row.get(5)?;
            let auth_str: Option<String> = row.get(6)?;
            let proxy_str: Option<String> = row.get(7)?;

            Ok(HttpRequest {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                method: row.get(2)?,
                url: row.get(3)?,
                headers: headers_str
                    .and_then(|s| serde_json::from_str(&s).ok())
                    .unwrap_or_default(),
                body: body_str.and_then(|s| serde_json::from_str(&s).ok()),
                auth: auth_str.and_then(|s| serde_json::from_str(&s).ok()),
                proxy: proxy_str.and_then(|s| serde_json::from_str(&s).ok()),
                ssl_verify: row.get(8)?,
                timeout: row.get(9)?,
            })
        })?;

        match rows.next() {
            Some(Ok(request)) => Ok(Some(request)),
            Some(Err(e)) => Err(anyhow!("查询请求失败: {}", e)),
            None => Ok(None),
        }
    }

    pub fn save_history(&self, request_id: i64, curl_command: &str, response: &HttpResponse) -> Result<i64> {
        let conn = self.conn.lock().map_err(|e| anyhow!("获取锁失败: {}", e))?;

        let headers_json = serde_json::to_string(&response.headers)?;

        conn.execute(
            "INSERT INTO history (request_id, curl_command, status_code, response_headers, response_body, response_time, response_size) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                request_id,
                curl_command,
                response.status_code,
                headers_json,
                response.body,
                response.response_time,
                response.response_size,
            ],
        )?;

        Ok(conn.last_insert_rowid())
    }

    pub fn get_history(&self, limit: usize) -> Result<Vec<HistoryRecord>> {
        let conn = self.conn.lock().map_err(|e| anyhow!("获取锁失败: {}", e))?;

        let mut stmt = conn.prepare(
            "SELECT h.id, h.request_id, h.curl_command, h.status_code, h.response_headers, h.response_body, h.response_time, h.response_size, h.created_at,
                    r.id, r.name, r.method, r.url, r.headers, r.body, r.auth, r.proxy, r.ssl_verify, r.timeout
             FROM history h
             JOIN requests r ON h.request_id = r.id
             ORDER BY h.created_at DESC
             LIMIT ?1"
        )?;

        let rows = stmt.query_map(params![limit], |row| {
            let headers_str: Option<String> = row.get(4)?;
            let req_headers_str: Option<String> = row.get(13)?;
            let req_body_str: Option<String> = row.get(14)?;
            let req_auth_str: Option<String> = row.get(15)?;
            let req_proxy_str: Option<String> = row.get(16)?;
            let curl_command: Option<String> = row.get(2).ok();

            println!("🔍 [DEBUG] Database curl_command: {:?}", curl_command);
            println!("🔍 [DEBUG] req_headers_str: {:?}", req_headers_str);
            println!("🔍 [DEBUG] req_body_str: {:?}", req_body_str);

            // 构建 HttpRequest 对象用于生成 curl 命令
            let request = HttpRequest {
                id: Some(row.get(9)?),
                name: row.get(10)?,
                method: row.get(11)?,
                url: row.get(12)?,
                headers: req_headers_str
                    .and_then(|s| serde_json::from_str(&s).ok())
                    .unwrap_or_default(),
                body: req_body_str.and_then(|s| serde_json::from_str(&s).ok()),
                auth: req_auth_str.and_then(|s| serde_json::from_str(&s).ok()),
                proxy: req_proxy_str.and_then(|s| serde_json::from_str(&s).ok()),
                ssl_verify: row.get(17)?,
                timeout: row.get(18)?,
            };

            println!("🔍 [DEBUG] Reconstructed request headers count: {}", request.headers.len());
            println!("🔍 [DEBUG] Reconstructed request body: {:?}", request.body);

            // 如果数据库中没有 curl 命令，从请求对象重新生成完整的命令
            let final_curl_command = curl_command.unwrap_or_else(|| {
                let generated = generate_curl_command(&request);
                println!("🔍 [DEBUG] Generated curl command: {}", generated);
                generated
            });

            println!("🔍 [DEBUG] Final curl command: {}", final_curl_command);

            Ok(HistoryRecord {
                id: row.get(0)?,
                curl_command: final_curl_command,
                request,
                response: Some(HttpResponse {
                    status_code: row.get(3)?,
                    headers: headers_str
                        .and_then(|s| serde_json::from_str(&s).ok())
                        .unwrap_or_default(),
                    body: row.get(5)?,
                    response_time: row.get(6)?,
                    response_size: row.get(7)?,
                    content_type: None,
                }),
                created_at: row.get(8)?,
            })
        })?;

        let mut history = Vec::new();
        for row in rows {
            history.push(row?);
        }

        Ok(history)
    }

    pub fn delete_history(&self, history_id: i64) -> Result<()> {
        let conn = self.conn.lock().map_err(|e| anyhow!("获取锁失败: {}", e))?;

        // 获取关联的 request_id
        let request_id: Option<i64> = conn.query_row(
            "SELECT request_id FROM history WHERE id = ?1",
            params![history_id],
            |row| row.get(0),
        ).ok();

        // 删除历史记录
        conn.execute("DELETE FROM history WHERE id = ?1", params![history_id])?;

        // 如果关联的请求没有其他历史记录引用，也删除请求
        if let Some(rid) = request_id {
            let count: i64 = conn.query_row(
                "SELECT COUNT(*) FROM history WHERE request_id = ?1",
                params![rid],
                |row| row.get(0),
            ).unwrap_or(0);

            if count == 0 {
                conn.execute("DELETE FROM requests WHERE id = ?1", params![rid])?;
            }
        }

        Ok(())
    }

    pub fn clear_history(&self) -> Result<()> {
        let conn = self.conn.lock().map_err(|e| anyhow!("获取锁失败: {}", e))?;

        // 先删除历史记录
        conn.execute("DELETE FROM history", [])?;

        // 然后删除没有关联的请求
        conn.execute(
            "DELETE FROM requests WHERE id NOT IN (SELECT request_id FROM history WHERE request_id IS NOT NULL)",
            [],
        )?;

        Ok(())
    }

    pub fn add_favorite(&self, request_id: i64, name: &str, description: Option<&str>) -> Result<i64> {
        let conn = self.conn.lock().map_err(|e| anyhow!("获取锁失败: {}", e))?;

        conn.execute(
            "INSERT INTO favorites (request_id, name, description) VALUES (?1, ?2, ?3)",
            params![request_id, name, description],
        )?;

        Ok(conn.last_insert_rowid())
    }

    pub fn remove_favorite(&self, favorite_id: i64) -> Result<()> {
        let conn = self.conn.lock().map_err(|e| anyhow!("获取锁失败: {}", e))?;
        conn.execute("DELETE FROM favorites WHERE id = ?1", params![favorite_id])?;
        Ok(())
    }

    pub fn get_favorites(&self) -> Result<Vec<FavoriteRecord>> {
        let conn = self.conn.lock().map_err(|e| anyhow!("获取锁失败: {}", e))?;

        let mut stmt = conn.prepare(
            "SELECT f.id, f.request_id, f.name, f.description, f.created_at,
                    r.method, r.url, r.headers, r.body, r.auth, r.proxy, r.ssl_verify, r.timeout
             FROM favorites f
             JOIN requests r ON f.request_id = r.id
             ORDER BY f.created_at DESC"
        )?;

        let rows = stmt.query_map([], |row| {
            let headers_str: Option<String> = row.get(7)?;
            let body_str: Option<String> = row.get(8)?;
            let auth_str: Option<String> = row.get(9)?;
            let proxy_str: Option<String> = row.get(10)?;

            Ok(FavoriteRecord {
                id: row.get(0)?,
                request: HttpRequest {
                    id: Some(row.get(1)?),
                    name: None,
                    method: row.get(5)?,
                    url: row.get(6)?,
                    headers: headers_str
                        .and_then(|s| serde_json::from_str(&s).ok())
                        .unwrap_or_default(),
                    body: body_str.and_then(|s| serde_json::from_str(&s).ok()),
                    auth: auth_str.and_then(|s| serde_json::from_str(&s).ok()),
                    proxy: proxy_str.and_then(|s| serde_json::from_str(&s).ok()),
                    ssl_verify: row.get(11)?,
                    timeout: row.get(12)?,
                },
                name: row.get(2)?,
                description: row.get(3)?,
                created_at: row.get(4)?,
            })
        })?;

        let mut favorites = Vec::new();
        for row in rows {
            favorites.push(row?);
        }

        Ok(favorites)
    }

    pub fn save_environment(&self, env: &Environment) -> Result<i64> {
        let conn = self.conn.lock().map_err(|e| anyhow!("获取锁失败: {}", e))?;

        let variables_json = serde_json::to_string(&env.variables)?;

        if env.id > 0 {
            conn.execute(
                "UPDATE environments SET name = ?1, variables = ?2, updated_at = CURRENT_TIMESTAMP WHERE id = ?3",
                params![env.name, variables_json, env.id],
            )?;
            Ok(env.id)
        } else {
            conn.execute(
                "INSERT INTO environments (name, variables) VALUES (?1, ?2)",
                params![env.name, variables_json],
            )?;
            Ok(conn.last_insert_rowid())
        }
    }

    pub fn get_environments(&self) -> Result<Vec<Environment>> {
        let conn = self.conn.lock().map_err(|e| anyhow!("获取锁失败: {}", e))?;

        let mut stmt = conn.prepare(
            "SELECT id, name, variables, created_at, updated_at FROM environments ORDER BY name"
        )?;

        let rows = stmt.query_map([], |row| {
            let variables_str: Option<String> = row.get(2)?;
            Ok(Environment {
                id: row.get(0)?,
                name: row.get(1)?,
                variables: variables_str
                    .and_then(|s| serde_json::from_str(&s).ok())
                    .unwrap_or_default(),
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })?;

        let mut environments = Vec::new();
        for row in rows {
            environments.push(row?);
        }

        Ok(environments)
    }

    pub fn add_log(&self, request_id: Option<i64>, level: LogLevel, message: &str, details: Option<serde_json::Value>) -> Result<i64> {
        let conn = self.conn.lock().map_err(|e| anyhow!("获取锁失败: {}", e))?;

        let level_str = match level {
            LogLevel::Minimal => "minimal",
            LogLevel::Normal => "normal",
            LogLevel::Verbose => "verbose",
        };

        let details_json = details.map(|d| d.to_string());

        conn.execute(
            "INSERT INTO logs (request_id, level, message, details) VALUES (?1, ?2, ?3, ?4)",
            params![request_id, level_str, message, details_json],
        )?;

        Ok(conn.last_insert_rowid())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_and_get_request() {
        let storage = Storage::new(":memory:").unwrap();
        let request = HttpRequest {
            id: None,
            name: Some("测试请求".to_string()),
            method: "GET".to_string(),
            url: "https://example.com".to_string(),
            headers: vec![],
            body: None,
            auth: None,
            proxy: None,
            ssl_verify: true,
            timeout: Some(30),
        };

        let id = storage.save_request(&request).unwrap();
        let loaded = storage.get_request(id).unwrap();
        assert!(loaded.is_some());
        assert_eq!(loaded.unwrap().url, "https://example.com");
    }

    #[test]
    fn test_save_and_get_history() {
        let storage = Storage::new(":memory:").unwrap();
        let request = HttpRequest {
            id: None,
            name: None,
            method: "GET".to_string(),
            url: "https://example.com".to_string(),
            headers: vec![],
            body: None,
            auth: None,
            proxy: None,
            ssl_verify: true,
            timeout: None,
        };
        let request_id = storage.save_request(&request).unwrap();

        let response = HttpResponse {
            status_code: 200,
            headers: vec![],
            body: "OK".to_string(),
            response_time: 100,
            response_size: 2,
            content_type: None,
        };

        storage.save_history(request_id, "curl https://example.com", &response).unwrap();
        let history = storage.get_history(10).unwrap();
        assert_eq!(history.len(), 1);
    }
}