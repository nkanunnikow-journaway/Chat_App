import { CreateMessageRequest, Message, MessageAttachment, MessagesResponse } from '../types/messages';
import { httpClient } from './httpClient';

export function getMessages(chatId: string, cursor?: string, limit?: number): Promise<MessagesResponse> {
  const params = new URLSearchParams();
  if (cursor) {
    params.append('cursor', cursor);
  }
  if (limit) {
    params.append('limit', limit.toString());
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  return httpClient<MessagesResponse>(`/chats/${chatId}/messages${query}`);
}

export function createMessage(chatId: string, request: CreateMessageRequest): Promise<Message> {
  return httpClient<Message>(`/chats/${chatId}/messages`, {
    method: 'POST',
    body: JSON.stringify(request)
  });
}

export function uploadAttachment(chatId: string, file: File, uploaderId: string): Promise<MessageAttachment> {
  const formData = new FormData();
  formData.append('file', file);
  return httpClient<MessageAttachment>(
    `/chats/${chatId}/attachments?uploaderId=${uploaderId}`,
    {
      method: 'POST',
      body: formData
    },
    true
  );
}

export function deleteMessage(chatId: string, messageId: string): Promise<void> {
  return httpClient<void>(`/chats/${chatId}/messages/${messageId}`, {
    method: 'DELETE'
  });
}
