import { markChatAsRead } from '../api/chatsApi.tsx';
import { createMessage, getMessages, uploadAttachment, deleteMessage } from '../api/messagesApi.tsx';
import type { Chat } from '../types/chats.tsx';
import type { Message } from '../types/messages.tsx';
import type { User } from '../types/users.tsx';
import ChatHeader from './chatWindow/ChatHeader.tsx';
import MessageInput from './chatWindow/MessageInput.tsx';
import MessageList from './chatWindow/MessageList.tsx';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

type ChatWindowProps = {
  selectedChat: Chat | null;
  currentUser: User;
  onChatUpdate: (chat: Chat) => void;
  onLeaveChat: () => void;
  onMessageSent: () => void;
  onDeleteChat: () => void;
  onBackToList: () => void;
};

function ChatWindow({
  selectedChat,
  currentUser,
  onChatUpdate,
  onLeaveChat,
  onMessageSent,
  onDeleteChat,
  onBackToList
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const { t } = useTranslation();

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
      console.error('Message could not be sent', error);
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
      console.error('Message could not be deleted', error);
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
        console.error('Messages could not be loaded', error);
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
      setIsLoadingOlder(true);
      const response = await getMessages(selectedChat.id, nextCursor);
      setMessages((prev) => [...prev, ...response.items]);
      setNextCursor(response.nextCursor);
    } catch (error) {
      console.error('Older messages could not be loaded', error);
    } finally {
      setIsLoadingMore(false);
      setIsLoadingOlder(false);
    }
  }

  const currentUserParticipant = selectedChat?.participants.find((p) => p.userId === currentUser.id);
  const isAdmin = currentUserParticipant?.role === 'ADMIN';

  if (!selectedChat) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center bg-bg-chat chat-bg gap-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-light">
            <img src="/favicon.svg" alt="logo" className="h-12 w-12" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-main mb-1">
              {currentUser.name ? `${t('chat.empty_greeting')}, ${currentUser.name}!` : t('chat.empty_greeting')}
            </h2>
            <p className="text-sm text-text-muted leading-relaxed">{t('chat.empty_subtitle')}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col">
      <ChatHeader
        selectedChat={selectedChat}
        currentUser={currentUser}
        onChatUpdate={onChatUpdate}
        onLeaveChat={onLeaveChat}
        isAdmin={isAdmin}
        onDeleteChat={onDeleteChat}
        onBackToList={onBackToList}
      />
      <MessageList
        messages={messages}
        selectedChat={selectedChat}
        currentUser={currentUser}
        onDeleteMessage={handleDeleteMessage}
        onLoadMore={handleLoadMore}
        hasMore={nextCursor !== null}
        isLoadingMore={isLoadingMore}
        isLoadingOlder={isLoadingOlder}
      />
      <MessageInput onSendMessage={handleSendMessage} />
    </main>
  );
}

export default ChatWindow;
