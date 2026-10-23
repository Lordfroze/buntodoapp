import { env } from '$env/dynamic/public';

export const API_URL = (env.PUBLIC_API_URL || 'http://localhost:3000').replace(/\/+$/, '');

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Todo {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  isCompleted?: boolean;
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      credentials: 'include',
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server. Pastikan backend sedang berjalan.', 0);
  }

  const text = await response.text();
  let payload: ApiEnvelope<T> | null = null;
  if (text) {
    try {
      payload = JSON.parse(text) as ApiEnvelope<T>;
    } catch {
      payload = null;
    }
  }

  if (!response.ok || payload?.success === false) {
    const message = payload?.error || `Permintaan gagal (${response.status})`;
    throw new ApiError(message, response.status);
  }

  return payload?.data as T;
}

export const api = {
  register(input: { name: string; email: string; password: string }) {
    return request<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  login(input: { email: string; password: string }) {
    return request<User>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async logout() {
    await request<unknown>('/api/auth/logout', { method: 'POST' });
  },

  me() {
    return request<User>('/api/auth/me');
  },

  listTodos() {
    return request<Todo[]>('/api/todos');
  },

  createTodo(input: CreateTodoInput) {
    return request<Todo>('/api/todos', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  getTodo(id: string) {
    return request<Todo>(`/api/todos/${id}`);
  },

  updateTodo(id: string, input: UpdateTodoInput) {
    return request<Todo>(`/api/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  async deleteTodo(id: string) {
    await request<unknown>(`/api/todos/${id}`, { method: 'DELETE' });
  },
};
