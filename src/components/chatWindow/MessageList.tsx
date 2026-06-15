import { Chat } from '../../types/chats.tsx';
import type { Message } from '../../types/messages.tsx';
import { User } from '../../types/users.tsx';
import Avatar from '../ui/Avatar.tsx';
import { Trash2 } from 'lucide-react';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type MessageListProps = {
  messages: Message[];
  selectedChat: Chat | null;
  currentUser: User;
  onDeleteMessage: (messageId: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
};

function MessageList({
  messages,
  selectedChat,
  currentUser,
  onDeleteMessage,
  onLoadMore,
  hasMore,
  isLoadingMore
}: MessageListProps) {
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const prevMessagesLength = useRef(0);

  useEffect(() => {
    if (messages.length > prevMessagesLength.current && prevMessagesLength.current > 0) {
      prevMessagesLength.current = messages.length;
      return;
    }
    prevMessagesLength.current = messages.length;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function formatMessageDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    }

    return (
      date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ', ' +
      date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    );
  }

  return (
    <>
      <section className="flex-1 overflow-y-auto bg-bg-chat p-6">
        {selectedChat ? (
          <div className="flex flex-col gap-3">
            {hasMore && (
              <button
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="self-center rounded-lg border border-primary-border px-4 py-2 text-xs text-text-muted hover:bg-primary-light transition disabled:opacity-50"
              >
                {isLoadingMore ? 'Wird geladen...' : 'Ältere Nachrichten laden'}
              </button>
            )}
            {[...messages].reverse().map((message) => {
              const isOwnMessage = message.sender.id === currentUser.id;
              return (
                <div
                  key={message.id}
                  className={`flex gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  onMouseEnter={() => setHoveredMessageId(message.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                >
                  {!isOwnMessage && <Avatar user={{ ...message.sender, email: '' }} size="sm" />}
                  <div className="flex items-end gap-2">
                    {isOwnMessage && hoveredMessageId === message.id && (
                      <button
                        onClick={() => setDeleteConfirmId(message.id)}
                        title="Nachricht löschen"
                        className="text-text-muted hover:text-red-500 transition text-xs mb-1 opacity-70"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                    <div
                      className={`max-w-[90%] rounded-2xl px-4 py-2.5 overflow-hidden ${
                        isOwnMessage
                          ? 'bg-bg-message-out text-text-out rounded-br-sm'
                          : 'bg-bg-message-in text-text-main rounded-bl-sm border border-primary-border'
                      }`}
                    >
                      {!isOwnMessage && (
                        <p className="text-xs font-semibold text-primary mb-1">{message.sender.name}</p>
                      )}
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      {message.attachments.map((attachment) => (
                        <img
                          key={attachment.id}
                          src={`${import.meta.env.VITE_API_BASE_URL}${attachment.url}`}
                          alt="attachment"
                          className="mt-2 w-full max-w-[200px] max-h-[200px] rounded-lg object-cover cursor-pointer block"
                          onLoad={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                          onClick={() => setLightboxUrl(`${import.meta.env.VITE_API_BASE_URL}${attachment.url}`)}
                        />
                      ))}
                      <p className={`mt-1 text-xs ${isOwnMessage ? 'text-text-out-muted' : 'text-text-muted'}`}>
                        {formatMessageDate(message.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center h-full">
            <p className="text-text-muted">Wähle einen Chat aus und starte eine Unterhaltung.</p>
          </div>
        )}
      </section>
      {lightboxUrl && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setLightboxUrl(null)}
        >
          <img
            src={lightboxUrl}
            alt="Lightbox"
            className="max-w-[90vw] max-h-[90vh] rounded-xl object-contain"
            onClick={(event) => event.stopPropagation()}
          />
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-message-in rounded-xl p-6 w-80 flex flex-col gap-4 border border-primary-border">
            <p className="text-sm font-semibold text-text-main">Nachricht wirklich löschen?</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onDeleteMessage(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition"
              >
                Löschen
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 rounded-lg border border-primary-border px-4 py-2 text-sm font-semibold text-text-muted hover:bg-bg-sidebar transition"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MessageList;
