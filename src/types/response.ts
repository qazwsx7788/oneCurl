import { KeyValuePair } from './request';

export interface HttpResponse {
  statusCode: number;
  headers: KeyValuePair[];
  body: string;
  responseTime: number;
  responseSize: number;
  contentType?: string;
  createdAt?: string;
}
