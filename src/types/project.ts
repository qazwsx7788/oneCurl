import { FavoriteRecord } from './favorite';

export interface Project {
  id: number;
  name: string;
  description?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Requirement {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface RequirementWithFavorites {
  requirement: Requirement;
  favorites: FavoriteRecord[];
}

export interface ProjectTree {
  project: Project;
  requirements: RequirementWithFavorites[];
}
