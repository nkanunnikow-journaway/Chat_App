import { Chat } from '../../types/chats.tsx';
import type { Message } from '../../types/messages.tsx';
import { User } from '../../types/users.tsx';
import Avatar from '../ui/Avatar.tsx';
import { Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type MessageListProps = {
  messages: Message[];
  selectedChat: Chat | null;
  currentUser: User;
  onDeleteMessage: (messageId: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  isLoadingOlder: boolean;
};

function MessageList({
  messages,
  selectedChat,
  currentUser,
  onDeleteMessage,
  onLoadMore,
  hasMore,
  isLoadingMore,
  isLoadingOlder
}: MessageListProps) {
  const { t, i18n } = useTranslation();
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoadingOlder) {
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingOlder]);

  function formatMessageDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const locale = i18n.language === 'de' ? 'de-DE' : 'en-US';

    if (isToday) {
      return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    }

    return (
      date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ', ' +
      date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
    );
  }

  return (
    <>
      <section className="flex-1 overflow-y-auto bg-bg-chat p-6 chat-bg">
        {selectedChat ? (
          <div className="flex flex-col gap-3">
            {hasMore && (
              <button
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="self-center rounded-lg border border-primary-border px-4 py-2 text-xs text-text-muted hover:bg-primary-light transition disabled:opacity-50"
              >
                {isLoadingMore ? t('common.loading') : t('chat.load_older')}
              </button>
            )}
            {[...messages].reverse().map((message) => {
              const isOwnMessage = message.sender.id === currentUser.id;
              const isHovered = hoveredMessageId === message.id;
              return (
                <div key={message.id} className={`flex gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                  {!isOwnMessage && <Avatar user={{ ...message.sender, email: '' }} size="sm" />}

                  <div className="flex flex-col max-w-[90%]">
                    <div
                      className={`flex items-center gap-2 mb-1 px-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isOwnMessage && (
                        <span className="text-xs font-semibold text-primary">{message.sender.name}</span>
                      )}
                      <span className="text-xs text-text-muted">{formatMessageDate(message.createdAt)}</span>
                    </div>

                    <div
                      className="relative"
                      onMouseEnter={() => setHoveredMessageId(message.id)}
                      onMouseLeave={() => setHoveredMessageId(null)}
                    >
                      {isOwnMessage && (
                        <div
                          className={`absolute -top-9 right-0 flex items-center gap-1 rounded-lg border border-primary-border bg-bg-message-in shadow-lg px-1 py-1 transition-opacity duration-150 z-20 ${
                            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
                          }`}
                        >
                          <button
                            onClick={() => setDeleteConfirmId(message.id)}
                            title={t('chat.delete_message')}
                            className="p-1.5 rounded text-text-muted hover:text-red-500 hover:bg-red-50 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}

                      <div
                        className={`rounded-2xl px-4 py-2.5 overflow-hidden ${
                          isOwnMessage
                            ? 'bg-bg-message-out text-text-out rounded-br-sm'
                            : 'bg-bg-message-in text-text-main rounded-bl-sm border border-primary-border'
                        }`}
                      >
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
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center h-full">
            <p className="text-text-muted">{t('chat.no_chat')}</p>
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
            alt="attachment"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-message-in rounded-xl p-6 w-full max-w-xs flex flex-col gap-4 border border-primary-border">
            <p className="text-sm font-semibold text-text-main">{t('chat.delete_message_confirm')}</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onDeleteMessage(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition"
              >
                {t('common.delete')}
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 rounded-lg border border-primary-border px-4 py-2 text-sm font-semibold text-text-muted hover:bg-bg-sidebar transition"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MessageList;
