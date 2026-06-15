import { CreateMessageRequest, Message, MessageAttachment, MessagesResponse } from '../types/messages';
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
