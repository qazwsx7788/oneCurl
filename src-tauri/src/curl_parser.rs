use crate::models::{AuthConfig, HttpRequest, KeyValuePair, ProxyConfig, ProxyType, RequestBody};
use anyhow::{anyhow, Result};

/// 预处理 bash ANSI-C quoting ($'...')
fn preprocess_ansi_c_quoting(input: &str) -> String {
    let mut result = String::new();
    let mut chars = input.chars().peekable();

    while let Some(c) = chars.next() {
        if c == '$' && chars.peek() == Some(&'\'') {
            chars.next(); // 跳过 $
            // 读取 $'...' 内容
            let mut content = String::new();
            let mut escaped = false;
            for c in chars.by_ref() {
                if escaped {
                    match c {
                        'n' => content.push('\n'),
                        't' => content.push('\t'),
                        'r' => content.push('\r'),
                        '\\' => content.push('\\'),
                        '\'' => content.push('\''),
                        _ => {
                            content.push('\\');
                            content.push(c);
                        }
                    }
                    escaped = false;
                } else if c == '\\' {
                    escaped = true;
                } else if c == '\'' {
                    break;
                } else {
                    content.push(c);
                }
            }
            // 用双引号包裹，转义内部的双引号
            result.push('"');
            for c in content.chars() {
                if c == '"' {
                    result.push_str("\\\"");
                } else {
                    result.push(c);
                }
            }
            result.push('"');
        } else {
            result.push(c);
        }
    }

    result
}

pub fn parse_curl(input: &str) -> Result<HttpRequest> {
    let processed_input = preprocess_ansi_c_quoting(input);
    let args = shell_words::split(&processed_input).map_err(|e| anyhow!("解析命令失败: {}", e))?;

    if args.is_empty() {
        return Err(anyhow!("空命令"));
    }

    if args[0] != "curl" {
        return Err(anyhow!("不是 curl 命令"));
    }

    let mut request = HttpRequest {
        id: None,
        name: None,
        method: "GET".to_string(),
        url: String::new(),
        headers: Vec::new(),
        body: None,
        auth: None,
        proxy: None,
        ssl_verify: true,
        timeout: None,
    };

    let mut i = 1;
    while i < args.len() {
        match args[i].as_str() {
            "-X" | "--request" => {
                i += 1;
                if i < args.len() {
                    request.method = args[i].to_uppercase();
                }
            }
            "-H" | "--header" => {
                i += 1;
                if i < args.len() {
                    if let Some((key, value)) = parse_header(&args[i]) {
                        request.headers.push(KeyValuePair {
                            key,
                            value,
                            enabled: true,
                        });
                    }
                }
            }
            "-d" | "--data" | "--data-raw" | "--data-binary" => {
                i += 1;
                if i < args.len() {
                    let data = args[i].clone();
                    // 检测是否是 JSON 格式
                    if data.starts_with('{') || data.starts_with('[') {
                        request.body = Some(RequestBody::Json(data));
                    } else {
                        request.body = Some(RequestBody::Raw(data));
                    }
                    if request.method == "GET" {
                        request.method = "POST".to_string();
                    }
                }
            }
            "-F" | "--form" => {
                i += 1;
                if i < args.len() {
                    if let Some((key, value)) = parse_header(&args[i]) {
                        let fields = match request.body {
                            Some(RequestBody::Form(mut fields)) => {
                                fields.push(KeyValuePair {
                                    key,
                                    value,
                                    enabled: true,
                                });
                                fields
                            }
                            _ => vec![KeyValuePair {
                                key,
                                value,
                                enabled: true,
                            }],
                        };
                        request.body = Some(RequestBody::Form(fields));
                        if request.method == "GET" {
                            request.method = "POST".to_string();
                        }
                    }
                }
            }
            "-u" | "--user" => {
                i += 1;
                if i < args.len() {
                    let parts: Vec<&str> = args[i].splitn(2, ':').collect();
                    if parts.len() == 2 {
                        request.auth = Some(AuthConfig::Basic {
                            username: parts[0].to_string(),
                            password: parts[1].to_string(),
                        });
                    }
                }
            }
            "-x" | "--proxy" => {
                i += 1;
                if i < args.len() {
                    request.proxy = parse_proxy(&args[i]);
                }
            }
            "-m" | "--max-time" => {
                i += 1;
                if i < args.len() {
                    if let Ok(timeout) = args[i].parse::<u64>() {
                        request.timeout = Some(timeout);
                    }
                }
            }
            "-k" | "--insecure" => {
                request.ssl_verify = false;
            }
            "-L" | "--location" => {
                // 跟随重定向 - 暂时忽略
            }
            "-b" | "--cookie" => {
                i += 1;
                // Cookie 处理 - 暂时忽略
            }
            "-A" | "--user-agent" => {
                i += 1;
                if i < args.len() {
                    request.headers.push(KeyValuePair {
                        key: "User-Agent".to_string(),
                        value: args[i].clone(),
                        enabled: true,
                    });
                }
            }
            "-e" | "--referer" => {
                i += 1;
                if i < args.len() {
                    request.headers.push(KeyValuePair {
                        key: "Referer".to_string(),
                        value: args[i].clone(),
                        enabled: true,
                    });
                }
            }
            "--compressed" => {
                request.headers.push(KeyValuePair {
                    key: "Accept-Encoding".to_string(),
                    value: "gzip, deflate".to_string(),
                    enabled: true,
                });
            }
            _ => {
                if !args[i].starts_with('-') && request.url.is_empty() {
                    request.url = args[i].clone();
                }
            }
        }
        i += 1;
    }

    if request.url.is_empty() {
        return Err(anyhow!("未指定 URL"));
    }

    // 验证 URL
    url::Url::parse(&request.url).map_err(|e| anyhow!("无效的 URL: {}", e))?;

    Ok(request)
}

fn parse_header(header: &str) -> Option<(String, String)> {
    let parts: Vec<&str> = header.splitn(2, ':').collect();
    if parts.len() == 2 {
        Some((parts[0].trim().to_string(), parts[1].trim().to_string()))
    } else {
        None
    }
}

fn parse_proxy(proxy: &str) -> Option<ProxyConfig> {
    if let Ok(url) = url::Url::parse(proxy) {
        let proxy_type = match url.scheme() {
            "http" => ProxyType::Http,
            "https" => ProxyType::Https,
            _ => ProxyType::Http,
        };
        Some(ProxyConfig {
            proxy_type,
            host: url.host_str()?.to_string(),
            port: url.port_or_known_default().unwrap_or(8080),
        })
    } else {
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_simple_get() {
        let input = "curl https://example.com";
        let result = parse_curl(input).unwrap();
        assert_eq!(result.method, "GET");
        assert_eq!(result.url, "https://example.com");
    }

    #[test]
    fn test_parse_post_with_data() {
        let input = r#"curl -X POST https://api.example.com/users -d '{"name":"test"}'"#;
        let result = parse_curl(input).unwrap();
        assert_eq!(result.method, "POST");
        assert_eq!(result.url, "https://api.example.com/users");
        assert!(result.body.is_some());
    }

    #[test]
    fn test_parse_with_headers() {
        let input = r#"curl -H "Content-Type: application/json" -H "Authorization: Bearer token" https://api.example.com"#;
        let result = parse_curl(input).unwrap();
        assert_eq!(result.headers.len(), 2);
    }

    #[test]
    fn test_parse_with_proxy() {
        let input = "curl -x http://proxy:8080 https://example.com";
        let result = parse_curl(input).unwrap();
        assert!(result.proxy.is_some());
    }

    #[test]
    fn test_parse_with_insecure() {
        let input = "curl -k https://example.com";
        let result = parse_curl(input).unwrap();
        assert_eq!(result.ssl_verify, false);
    }
}
