import { HttpRequest } from './request';
import { HttpResponse } from './response';

export interface FavoriteRecord {
  id: number;
  request: HttpRequest;
  name: string;
  description?: string;
  response?: HttpResponse;
  createdAt: string;
}
