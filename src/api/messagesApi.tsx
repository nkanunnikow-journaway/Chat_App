import type { CreateMessageRequest, Message, MessagesResponse } from '../types/messages';
import { httpClient } from './httpClient';

export function getMessages(chatId: string): Promise<MessagesResponse> {
  return httpClient<MessagesResponse>(`/chats/${chatId}/messages`);
}

export function createMessage(chatId: string, request: CreateMessageRequest): Promise<Message> {
  return httpClient<Message>(`/chats/${chatId}/messages`, {
    method: 'POST',
    body: JSON.stringify(request)
  });
}
