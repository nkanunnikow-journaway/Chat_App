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
