import { createChat, getChats } from '../api/chatsApi';
import { createMessage, getMessages } from '../api/messagesApi';
import UserList from '../components/UserList.tsx';
import type { Chat } from '../types/chats';
import type { Message } from '../types/messages';
import type { User } from '../types/users.tsx';
import { useState } from 'react';

type UsersPageProps = {
  currentUser: User;
};

function UsersPage({ currentUser }: UsersPageProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');

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

  async function handleSelectUser(user: User) {
    try {
      setSelectedUser(user);

      const allChats = await getChats();

      const existingDirectChat = allChats.find((chat) => {
        if (chat.type !== 'DIRECT') {
          return false;
        }

        const participantIds = chat.participants.map((participant) => participant.userId);

        return participantIds.includes(currentUser.id) && participantIds.includes(user.id);
      });

      if (existingDirectChat) {
        setSelectedChat(existingDirectChat);

        const loadedMessagesResponse = await getMessages(existingDirectChat.id);
        setMessages(loadedMessagesResponse.items);

        return;
      }

      const createdChat = await createChat({
        type: 'DIRECT',
        participantIds: [currentUser.id, user.id]
      });

      setSelectedChat(createdChat);
      const loadedMessagesResponse = await getMessages(createdChat.id);
      setMessages(loadedMessagesResponse.items);
    } catch (error) {
      console.error('Chat konnte nicht geöffnet werden', error);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      <UserList selectedUser={selectedUser} onSelectUser={handleSelectUser} />
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

        <section className="flex flex-1 flex-col bg-gray-50 p-8">
          {selectedChat ? (
            <div className="flex flex-1 flex-col gap-4">
              {messages.map((message) => (
                <div key={message.id} className="rounded-xl bg-white p-4 shadow">
                  <p>{message.content}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    {message.sender.name} · {message.createdAt}
                  </p>
                </div>
              ))}
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

            <button
              className="rounded-xl bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
              onClick={handleSendMessage}
            >
              Senden
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default UsersPage;
