import { markChatAsRead } from '../api/chatsApi.tsx';
import { createMessage, getMessages, uploadAttachment, deleteMessage } from '../api/messagesApi.tsx';
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
  onDeleteChat: () => void;
};

function ChatWindow({
  selectedChat,
  currentUser,
  onChatUpdate,
  onLeaveChat,
  onMessageSent,
  onDeleteChat
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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

  async function handleDeleteMessage(messageId: string) {
    if (!selectedChat) {
      return;
    }
    try {
      await deleteMessage(selectedChat.id, messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (error) {
      console.error('Nachricht konnte nicht gelöscht werden', error);
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
        setNextCursor(response.nextCursor);
        await markChatAsRead(chat.id, currentUser.id);
      } catch (error) {
        console.error('Nachrichten konnten nicht geladen werden', error);
      }
    }

    loadMessages();
  }, [currentUser.id, selectedChat]);

  async function handleLoadMore() {
    if (!selectedChat || !nextCursor || isLoadingMore) {
      return;
    }
    try {
      setIsLoadingMore(true);
      const response = await getMessages(selectedChat.id, nextCursor);
      setMessages((prev) => [...prev, ...response.items]);
      setNextCursor(response.nextCursor);
    } catch (error) {
      console.error('Ältere Nachrichten konnten nicht geladen werden', error);
    } finally {
      setIsLoadingMore(false);
    }
  }

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
        onDeleteChat={onDeleteChat}
      />
      <MessageList
        messages={messages}
        selectedChat={selectedChat}
        currentUser={currentUser}
        onDeleteMessage={handleDeleteMessage}
        onLoadMore={handleLoadMore}
        hasMore={nextCursor !== null}
        isLoadingMore={isLoadingMore}
      />
      <MessageInput onSendMessage={handleSendMessage} />
    </main>
  );
}

export default ChatWindow;
