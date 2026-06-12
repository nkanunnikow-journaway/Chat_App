import { Chat } from '../../types/chats.tsx';
import type { Message } from '../../types/messages.tsx';
import { User } from '../../types/users.tsx';
import { useEffect, useRef, useState } from 'react';

type MessageListProps = {
  messages: Message[];
  selectedChat: Chat | null;
  currentUser: User;
};

function MessageList({ messages, selectedChat, currentUser }: MessageListProps) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
      <section className="flex-1 overflow-y-auto bg-gray-50 p-8">
        {selectedChat ? (
          <div className="flex flex-col gap-4">
            {[...messages].reverse().map((message) => {
              const isOwnMessage = message.sender.id === currentUser.id;
              return (
                <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[70%] rounded-xl p-4 shadow ${isOwnMessage ? 'bg-indigo-500 text-white' : 'bg-white text-gray-900'}`}
                  >
                    <p>{message.content}</p>
                    {message.attachments.map((attachment) => (
                      <img
                        key={attachment.id}
                        src={`${import.meta.env.VITE_API_BASE_URL}${attachment.url}`}
                        alt="attachment"
                        className="mt-2 max-w-50 max-h-50 rounded-lg object-cover cursor-pointer"
                        onLoad={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                        onClick={() => setLightboxUrl(`${import.meta.env.VITE_API_BASE_URL}${attachment.url}`)}
                      />
                    ))}
                    <p className={`mt-2 text-xs ${isOwnMessage ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {message.sender.name} · {formatMessageDate(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-gray-500">Wähle einen User aus und starte einen Chat.</p>
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
            x
          </button>
        </div>
      )}
    </>
  );
}

export default MessageList;
