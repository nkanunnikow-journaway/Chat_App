import { createChat, getChats, markChatAsRead } from '../api/chatsApi.tsx';
import { createMessage, getMessages, uploadAttachment } from '../api/messagesApi.tsx';
import type { Chat } from '../types/chats.tsx';
import type { Message } from '../types/messages.tsx';
import type { User } from '../types/users.tsx';
import Button from './ui/Button.tsx';
import { useState, useEffect, useRef } from 'react';

type ChatWindowProps = {
  selectedUser: User | null;
  currentUser: User;
};

function ChatWindow({ selectedUser, currentUser }: ChatWindowProps) {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleAttachment() {
    fileInputRef.current?.click();
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  }

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
  async function handleSendMessage() {
    if (!selectedChat || (messageText.trim() === '' && !attachedFile)) {
      return;
    }

    try {
      let attachmentIds: string[] = [];

      if (attachedFile) {
        const attachment = await uploadAttachment(selectedChat.id, attachedFile, currentUser.id);
        attachmentIds = [attachment.id];
      }

      const createdMessage = await createMessage(selectedChat.id, {
        content: messageText,
        senderId: currentUser.id,
        attachmentIds
      });

      setMessages((previousMessages) => [createdMessage, ...previousMessages]);
      setMessageText('');
      setAttachedFile(null);
    } catch (error) {
      console.error('Nachricht konnte nicht gesendet werden', error);
    }
  }
  useEffect(() => {
    if (!selectedUser) {
      return;
    }

    const user = selectedUser;

    async function loadChat() {
      try {
        const allChats = await getChats();

        const existingDirectChat = allChats.find((chat) => {
          if (chat.type !== 'DIRECT') {
            return false;
          }
          const participantIds = chat.participants.map((p) => p.userId);
          return participantIds.includes(currentUser.id) && participantIds.includes(user.id);
        });

        if (existingDirectChat) {
          setSelectedChat(existingDirectChat);
          const response = await getMessages(existingDirectChat.id);
          setMessages(response.items);
          await markChatAsRead(existingDirectChat.id, currentUser.id);
          return;
        }

        const createdChat = await createChat({
          type: 'DIRECT',
          participantIds: [currentUser.id, user.id]
        });

        setSelectedChat(createdChat);
        const response = await getMessages(createdChat.id);
        setMessages(response.items);
        await markChatAsRead(createdChat.id, currentUser.id);
      } catch (error) {
        console.error('Chat konnte nicht geöffnet werden', error);
      }
    }

    loadChat();
  }, [selectedUser]);
  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white p-6">
        {selectedUser ? (
          <div>
            <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
            <p className="text-sm text-gray-500">{selectedUser.email}</p>
          </div>
        ) : (
          <h2 className="text-2xl font-bold">Kein User ausgewählt</h2>
        )}
      </header>

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
                        className="mt-2 max-w-[200px] max-h-[200px] rounded-lg object-cover cursor-pointer"
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

      <footer className="border-t border-gray-200 bg-white p-4">
        {attachedFile && (
          <div className="mb-3 relative w-fit">
            <img src={URL.createObjectURL(attachedFile)} alt="Vorschau" className="h-20 w-20 rounded-xl object-cover" />
            <button
              onClick={() => setAttachedFile(null)}
              className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs hover:bg-red-600 transition"
            >
              ✕
            </button>
          </div>
        )}
        <div className="flex gap-3">
          <input
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-indigo-500"
            placeholder="Nachricht schreiben..."
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
          />
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelected} />
          <Button onClick={handleAttachment}>Attach</Button>
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </footer>
      {lightboxUrl && (
        <div
          className={'fixed inset-0 bg-black/80 flex items-center justify-center z-50'}
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
    </main>
  );
}

export default ChatWindow;
