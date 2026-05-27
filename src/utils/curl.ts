import { HttpRequest, RequestBody } from '../types/request';

/**
 * 从 HttpRequest 结构化数据生成完整的 curl 命令
 */
export function generateCurlCommand(request: HttpRequest): string {
  const parts: string[] = ['curl'];

  // Method
  if (request.method && request.method !== 'GET') {
    parts.push(`-X ${request.method}`);
  }

  // Headers
  if (request.headers) {
    for (const header of request.headers) {
      if (header.enabled && header.key) {
        parts.push(`-H '${header.key}: ${header.value}'`);
      }
    }
  }

  // Body
  if (request.body) {
    const bodyStr = formatBody(request.body);
    if (bodyStr) {
      parts.push(`-d '${bodyStr}'`);
    }
  }

  // Auth
  if (request.auth) {
    if ('Basic' in request.auth) {
      parts.push(`-u '${request.auth.Basic.username}:${request.auth.Basic.password}'`);
    } else if ('Bearer' in request.auth) {
      parts.push(`-H 'Authorization: Bearer ${request.auth.Bearer.token}'`);
    }
  }

  // SSL verify
  if (!request.ssl_verify) {
    parts.push('-k');
  }

  // Timeout
  if (request.timeout) {
    parts.push(`--connect-timeout ${request.timeout}`);
  }

  // Proxy
  if (request.proxy) {
    parts.push(`--proxy ${request.proxy.proxy_type}://${request.proxy.host}:${request.proxy.port}`);
  }

  // URL (放在最后)
  parts.push(`'${request.url}'`);

  return parts.join(' ');
}

function formatBody(body: RequestBody): string | null {
  if (!body) return null;
  if ('Raw' in body) return body.Raw;
  if ('Json' in body) return body.Json;
  if ('Form' in body) {
    return body.Form
      .filter(f => f.enabled && f.key)
      .map(f => `${encodeURIComponent(f.key)}=${encodeURIComponent(f.value)}`)
      .join('&');
  }
  return null;
}
