import { HttpRequest } from './request';

export interface FavoriteRecord {
  id: number;
  request: HttpRequest;
  name: string;
  description?: string;
  createdAt: string;
}
