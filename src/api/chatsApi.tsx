import type { Chat, ChatParticipant, CreateChatRequest } from '../types/chats';
import { httpClient } from './httpClient';





export function createChat(request: CreateChatRequest): Promise<Chat> {
  return httpClient<Chat>('/chats', {
    method: 'POST',
    body: JSON.stringify(request)
  });
}

export function addParticipant(chatId: string, userId: string): Promise<ChatParticipant> {
  return httpClient<ChatParticipant>(`/chats/${chatId}/participants`, {
    method: 'POST',
    body: JSON.stringify({ userId })
  });
}

export function getChats(params?: { userId?: string }): Promise<Chat[]> {
  const query = params?.userId ? `?userId=${params.userId}` : '';
  return httpClient<Chat[]>(`/chats${query}`);
}

export function markChatAsRead(chatId: string, userId: string): Promise<void> {
  return httpClient<void>(`/chats/${chatId}/read?userId=${userId}`, {
    method: 'POST'
  });
}

export function removeParticipant(chatId: string, userId: string): Promise<void> {
  return httpClient<void>(`/chats/${chatId}/participants/${userId}`, {
    method: 'DELETE'
  });
}

export function updateChatName(chatId: string, name: string): Promise<Chat> {
  return httpClient<Chat>(`/chats/${chatId}`, {
    method: 'PATCH',
    body: JSON.stringify({ name })
  });
}

export function updateParticipantsRole(
  chatId: string,
  userId: string,
  role: 'MEMBER' | 'ADMIN'
): Promise<ChatParticipant> {
  return httpClient<ChatParticipant>(`/chats/${chatId}/participants/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ role })
  });
}

export function deleteChat(chatId: string): Promise<void> {
  return httpClient<void>(`/chats/${chatId}`, {
    method: 'DELETE'
  });
}