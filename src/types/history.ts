import { HttpRequest } from './request';
import { HttpResponse } from './response';

export interface HistoryRecord {
  id: number;
  request: HttpRequest;
  curlCommand: string | null;
  response?: HttpResponse;
  createdAt: string;
}
