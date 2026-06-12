import { markChatAsRead } from '../api/chatsApi.tsx';
import { createMessage, getMessages, uploadAttachment } from '../api/messagesApi.tsx';
import type { Chat } from '../types/chats.tsx';
import type { Message } from '../types/messages.tsx';
import type { User } from '../types/users.tsx';
import ChatHeader from './chatWindow/ChatHeader.tsx';
import MessageInput from './chatWindow/MessageInput.tsx';
import MessageList from './chatWindow/MessageList.tsx';
import { useState, useEffect } from 'react';

type ChatWindowProps = {
  selectedChat: Chat | null;
  currentUser: User;
  onChatUpdate: (chat: Chat) => void;
  onLeaveChat: () => void;
  onMessageSent: () => void;
};

function ChatWindow({ selectedChat, currentUser, onChatUpdate, onLeaveChat, onMessageSent }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);

  async function handleSendMessage(text: string, file: File | null) {
    if (!selectedChat || (text.trim() === '' && !file)) {
      return;
    }
    try {
      let attachmentIds: string[] = [];
      if (file) {
        const attachment = await uploadAttachment(selectedChat.id, file, currentUser.id);
        attachmentIds = [attachment.id];
      }
      const createdMessage = await createMessage(selectedChat.id, {
        content: text,
        senderId: currentUser.id,
        attachmentIds
      });
      setMessages((previousMessages) => [createdMessage, ...previousMessages]);
      onMessageSent();
    } catch (error) {
      console.error('Nachricht konnte nicht gesendet werden', error);
    }
  }

  useEffect(() => {
    if (!selectedChat) {
      return;
    }
    const chat = selectedChat;

    async function loadMessages() {
      try {
        const response = await getMessages(chat.id);
        setMessages(response.items);
        await markChatAsRead(chat.id, currentUser.id);
      } catch (error) {
        console.error('Nachrichten konnten nicht geladen werden', error);
      }
    }

    loadMessages();
  }, [selectedChat]);

  const currentUserParticipant = selectedChat?.participants.find((p) => p.userId === currentUser.id);
  const isAdmin = currentUserParticipant?.role === 'ADMIN';

  return (
    <main className="flex flex-1 flex-col">
      <ChatHeader
        selectedChat={selectedChat}
        currentUser={currentUser}
        onChatUpdate={onChatUpdate}
        onLeaveChat={onLeaveChat}
        isAdmin={isAdmin}
      />
      <MessageList messages={messages} selectedChat={selectedChat} currentUser={currentUser} />
      <MessageInput onSendMessage={handleSendMessage} />
    </main>
  );
}

export default ChatWindow;
