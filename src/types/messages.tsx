export type MessageSender = {
  id: string;
  name: string;
  profileImageUrl?: string;
};

export type MessagesResponse = {
  items: Message[];
  nextCursor: string | null;
};

export type MessageAttachment = {
  id: string;
  type: 'IMAGE' | 'LOCATION';
  url?: string;
  mimeType?: string;
  size?: number;
  position: number;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type Message = {
  id: string;
  content: string;
  chatId: string;
  senderId: string;
  createdAt: string;
  sender: MessageSender;
  attachments: MessageAttachment[];
};

export type CreateMessageRequest = {
  content: string;
  senderId: string;
  attachmentIds: string[];
};
