use crate::models::*;
use anyhow::{anyhow, Result};
use reqwest::Client;
use std::time::Instant;

pub struct HttpClient {
    client: Client,
    client_no_ssl_verify: Client,
}

impl HttpClient {
    pub fn new() -> Self {
        let client = Client::builder()
            .cookie_store(true)
            .build()
            .expect("Failed to create HTTP client");

        let client_no_ssl_verify = Client::builder()
            .cookie_store(true)
            .danger_accept_invalid_certs(true)
            .build()
            .expect("Failed to create HTTP client with SSL verification disabled");

        Self { client, client_no_ssl_verify }
    }

    pub async fn execute(&self, request: &HttpRequest) -> Result<HttpResponse> {
        let start = Instant::now();

        // 根据 ssl_verify 选择合适的客户端
        let client = if request.ssl_verify {
            &self.client
        } else {
            &self.client_no_ssl_verify
        };

        let mut builder = match request.method.as_str() {
            "GET" => client.get(&request.url),
            "POST" => client.post(&request.url),
            "PUT" => client.put(&request.url),
            "DELETE" => client.delete(&request.url),
            "PATCH" => client.patch(&request.url),
            "HEAD" => client.head(&request.url),
            "OPTIONS" => client.request(reqwest::Method::OPTIONS, &request.url),
            _ => return Err(anyhow!("不支持的 HTTP 方法: {}", request.method)),
        };

        // 添加请求头
        for header in &request.headers {
            if header.enabled {
                builder = builder.header(&header.key, &header.value);
            }
        }

        // 添加认证
        if let Some(auth) = &request.auth {
            match auth {
                AuthConfig::Basic { username, password } => {
                    builder = builder.basic_auth(username, Some(password));
                }
                AuthConfig::Bearer { token } => {
                    builder = builder.bearer_auth(token);
                }
            }
        }

        // 添加请求体
        if let Some(body) = &request.body {
            match body {
                RequestBody::Json(json) => {
                    builder = builder
                        .header("Content-Type", "application/json")
                        .body(json.clone());
                }
                RequestBody::Form(fields) => {
                    let form: Vec<(String, String)> = fields
                        .iter()
                        .filter(|f| f.enabled)
                        .map(|f| (f.key.clone(), f.value.clone()))
                        .collect();
                    builder = builder.form(&form);
                }
                RequestBody::Raw(raw) => {
                    builder = builder.body(raw.clone());
                }
                RequestBody::Multipart(_) => {
                    return Err(anyhow!("Multipart 暂不支持"));
                }
            }
        }

        // 设置超时
        if let Some(timeout) = request.timeout {
            builder = builder.timeout(std::time::Duration::from_secs(timeout));
        }

        // 执行请求
        let response = builder
            .send()
            .await
            .map_err(|e| anyhow!("请求执行失败: {}", e))?;

        let elapsed = start.elapsed().as_millis() as u64;

        let status_code = response.status().as_u16();
        let headers: Vec<KeyValuePair> = response
            .headers()
            .iter()
            .map(|(key, value)| KeyValuePair {
                key: key.to_string(),
                value: value.to_str().unwrap_or("").to_string(),
                enabled: true,
            })
            .collect();

        let body = response
            .text()
            .await
            .map_err(|e| anyhow!("读取响应失败: {}", e))?;

        let response_size = body.len();
        let content_type = headers
            .iter()
            .find(|h| h.key.to_lowercase() == "content-type")
            .map(|h| h.value.clone());

        Ok(HttpResponse {
            status_code,
            headers,
            body,
            response_time: elapsed,
            response_size,
            content_type,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_execute_get_request() {
        let client = HttpClient::new();
        let request = HttpRequest {
            id: None,
            name: None,
            method: "GET".to_string(),
            url: "https://httpbin.org/get".to_string(),
            headers: vec![],
            body: None,
            auth: None,
            proxy: None,
            ssl_verify: true,
            timeout: Some(30),
            project_id: None,
            requirement_id: None,
        };

        let result = client.execute(&request).await;
        assert!(result.is_ok());
        let response = result.unwrap();
        assert_eq!(response.status_code, 200);
    }

    #[tokio::test]
    async fn test_execute_post_request() {
        let client = HttpClient::new();
        let request = HttpRequest {
            id: None,
            name: None,
            method: "POST".to_string(),
            url: "https://httpbin.org/post".to_string(),
            headers: vec![KeyValuePair {
                key: "Content-Type".to_string(),
                value: "application/json".to_string(),
                enabled: true,
            }],
            body: Some(RequestBody::Raw(r#"{"test": "data"}"#.to_string())),
            auth: None,
            proxy: None,
            ssl_verify: true,
            timeout: Some(30),
            project_id: None,
            requirement_id: None,
        };

        let result = client.execute(&request).await;
        assert!(result.is_ok());
        let response = result.unwrap();
        assert_eq!(response.status_code, 200);
    }
}
