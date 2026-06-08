import type { Message } from './messages';
import type { User } from './users.tsx';

export type ChatType = 'DIRECT' | 'GROUP';

export type ChatParticipant = {
  id: string;
  chatId: string;
  userId: string;
  role: 'MEMBER' | 'ADMIN';
  user: User;
};

export type Chat = {
  id: string;
  type: ChatType;
  name?: string;
  createdAt: string;
  updatedAt: string;
  participants: ChatParticipant[];
  lastMessage?: Message;
  unreadCount: number;
};

export type CreateChatRequest =
  | {
      type: 'DIRECT';
      participantIds: string[];
    }
  | {
      type: 'GROUP';
      name: string;
      participantIds: string[];
    };
