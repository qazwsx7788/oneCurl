export interface KeyValuePair {
  key: string;
  value: string;
  enabled: boolean;
}

export type RequestBody =
  | { Json: string }
  | { Form: KeyValuePair[] }
  | { Multipart: any[] }
  | { Raw: string }
  | null;

export type AuthConfig =
  | { Basic: { username: string; password: string } }
  | { Bearer: { token: string } }
  | null;

export interface ProxyConfig {
  Http: { host: string; port: number };
  Https: { host: string; port: number };
}

export interface HttpRequest {
  id?: number;
  name?: string;
  method: string;
  url: string;
  headers: KeyValuePair[];
  body?: RequestBody;
  auth?: AuthConfig;
  proxy?: { proxy_type: string; host: string; port: number };
  ssl_verify: boolean;
  timeout?: number;
  projectId?: number;
  requirementId?: number;
}
