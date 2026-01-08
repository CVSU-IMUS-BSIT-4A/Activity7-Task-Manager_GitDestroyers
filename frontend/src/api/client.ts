import axios from 'axios';
import { ApiResponse, Project, Task, User, TaskStatus } from './types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// Response interceptor to extract data from { data: T }
api.interceptors.response.use((response) => response.data);

export const usersApi = {
  findAll: () => api.get<any, ApiResponse<User[]>>('/users'),
  findOne: (id: string) => api.get<any, ApiResponse<User>>(`/users/${id}`),
  create: (data: Partial<User>) => api.post<any, ApiResponse<User>>('/users', data),
  update: (id: string, data: Partial<User>) => api.patch<any, ApiResponse<User>>(`/users/${id}`, data),
  remove: (id: string) => api.delete(`/users/${id}`),
};

export const projectsApi = {
  findAll: () => api.get<any, ApiResponse<Project[]>>('/projects'),
  findOne: (id: string) => api.get<any, ApiResponse<Project>>(`/projects/${id}`),
  create: (data: Partial<Project>) => api.post<any, ApiResponse<Project>>('/projects', data),
  update: (id: string, data: Partial<Project>) => api.patch<any, ApiResponse<Project>>(`/projects/${id}`, data),
  remove: (id: string) => api.delete(`/projects/${id}`),
};

export interface TaskFilters {
  projectId?: string;
  assigneeId?: string;
  status?: TaskStatus;
  overdue?: boolean;
}

export const tasksApi = {
  findAll: (filters?: TaskFilters) => api.get<any, ApiResponse<Task[]>>('/tasks', { params: filters }),
  findOne: (id: string) => api.get<any, ApiResponse<Task>>(`/tasks/${id}`),
  create: (data: any) => api.post<any, ApiResponse<Task>>('/tasks', data),
  update: (id: string, data: any) => api.patch<any, ApiResponse<Task>>(`/tasks/${id}`, data),
  remove: (id: string) => api.delete(`/tasks/${id}`),
};

export const healthApi = {
  check: () => api.get('/health'),
};

export default api;
