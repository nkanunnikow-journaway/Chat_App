import type { CreateUserRequest, UpdateUserRequest, User } from '../types/users.tsx';
import { httpClient } from './httpClient';

export function getUsers(): Promise<User[]> {
  return httpClient<User[]>('/users');
}

export function createUser(request: CreateUserRequest): Promise<User> {
  return httpClient<User>('/users', {
    method: 'POST',
    body: JSON.stringify(request)
  });
}

export function getUserByEmail(email: string): Promise<User> {
  return httpClient<User>(`/users/by-email?email=${encodeURIComponent(email)}`);
}
export function getUserById(id: string): Promise<User> {
  return httpClient<User>(`/users/${id}`);
}

export function searchUsersByName(name: string): Promise<User[]> {
  return httpClient<User[]>(`/users/search?name=${encodeURIComponent(name)}`);
}

export function updateUser(id: string, request: UpdateUserRequest): Promise<User> {
  return httpClient<User>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(request)
  });
}

export function uploadProfileImage(id: string, file: File): Promise<User> {
  const formData = new FormData();
  formData.append('file', file);
  return httpClient<User>(
    `/users/${id}/profile-image`,
    {
      method: 'POST',
      body: formData
    },
    true
  );
}

export function deleteProfileImage(id: string): Promise<User> {
  return httpClient<User>(`/users/${id}/profile-image`, {
    method: 'DELETE'
  });
}

export function deleteUser(id: string): Promise<User> {
  return httpClient<User>(`/users/${id}`, {
    method: 'DELETE'
  });
}
