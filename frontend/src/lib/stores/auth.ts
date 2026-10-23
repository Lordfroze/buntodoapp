import { writable } from 'svelte/store';
import { api, ApiError, type User } from '$lib/api';

export const currentUser = writable<User | null>(null);
export const authReady = writable(false);

/** Load the session from the HttpOnly cookie. Returns the user or `null`. */
export async function loadCurrentUser(): Promise<User | null> {
  try {
    const user = await api.me();
    currentUser.set(user);
    return user;
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    currentUser.set(null);
    return null;
  } finally {
    authReady.set(true);
  }
}

export async function login(email: string, password: string): Promise<User> {
  const user = await api.login({ email, password });
  currentUser.set(user);
  authReady.set(true);
  return user;
}

export async function register(name: string, email: string, password: string): Promise<User> {
  const user = await api.register({ name, email, password });
  currentUser.set(user);
  authReady.set(true);
  return user;
}

export async function logout(): Promise<void> {
  try {
    await api.logout();
  } finally {
    currentUser.set(null);
  }
}
