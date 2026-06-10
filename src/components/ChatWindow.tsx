import { createChat, getChats } from '../api/chatsApi.tsx';
import { createMessage, getMessages } from '../api/messagesApi.tsx';
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  function handleAttachement(){

  }
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
    if (!selectedChat || messageText.trim() === '') {
      return;
    }
    try {
      const createdMessage = await createMessage(selectedChat.id, {
        content: messageText,
        senderId: currentUser.id,
        attachmentIds: []
      });

      setMessages((previousMessages) => [createdMessage, ...previousMessages]);
      setMessageText('');
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
          return;
        }

        const createdChat = await createChat({
          type: 'DIRECT',
          participantIds: [currentUser.id, user.id]
        });

        setSelectedChat(createdChat);
        const response = await getMessages(createdChat.id);
        setMessages(response.items);
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
        <div className="flex gap-3">
          <input
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-indigo-500"
            placeholder="Nachricht schreiben..."
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
          />
          <Button onClick={handleAttachement}>Attach Files</Button>
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </footer>
    </main>
  );
}

export default ChatWindow;
