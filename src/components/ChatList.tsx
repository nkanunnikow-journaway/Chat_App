import { getChats } from '../api/chatsApi.tsx';
import { searchUsersByName } from '../api/usersApi.tsx';
import type { Chat } from '../types/chats.tsx';
import type { User } from '../types/users.tsx';
import { useState, useEffect } from 'react';

type UserListProps = {
  currentUser: User;
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
};

function ChatList({ currentUser, selectedUser, onSelectUser }: UserListProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchError, setSearchError] = useState(false);

  async function handleSearch(value: string) {
    setSearchTerm(value);
    setSearchError(false);

    if (value.trim() === '') {
      setSearchResults([]);
      return;
    }
    try {
      const results = await searchUsersByName(value);
      setSearchResults(results);
    } catch (error) {
      console.error('Fehler beim Suchen', error);
      setSearchError(true);
    }
  }

  useEffect(() => {
    async function loadChats() {
      try {
        const allChats = await getChats({ userId: currentUser.id });
        const directChats = allChats.filter((chat) => chat.type === 'DIRECT');
        setChats(directChats);
      } catch (error) {
        console.error('Chats konnten nicht geladen werden', error);
      }
    }

    loadChats();
  }, [currentUser.id]);

  return (
    <aside className="w-80 flex flex-col h-full border-r border-gray-200 bg-white">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold">Chats</h1>
        <input
          type="text"
          placeholder="Search for User"
          value={searchTerm}
          onChange={(event) => handleSearch(event.target.value)}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-indigo-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 p-4">
        {searchTerm.trim() !== '' ? (
          searchError ? (
            <p className="text-sm text-gray-400 text-center mt-4">No results found</p>
          ) : (
            searchResults.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  onSelectUser(user);
                  setSearchTerm('');
                  setSearchResults([]);
                }}
                className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                  selectedUser?.id === user.id ? 'bg-indigo-100' : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">{user.name}</h2>
                  <p className="truncate text-sm text-gray-500">{user.email}</p>
                </div>
              </button>
            ))
          )
        ) : (
          chats.map((chat) => {
            const otherParticipant = chat.participants.find((p) => p.userId !== currentUser.id);

            if (!otherParticipant) {
              return null;
            }

            const otherUser = otherParticipant.user;
            const isSelected = selectedUser?.id === otherUser.id;

            return (
              <button
                key={chat.id}
                onClick={() => {
                  onSelectUser(otherUser);
                  setChats((prev) => prev.map((c) => (c.id === chat.id ? { ...c, unreadCount: 0 } : c)));
                }}
                className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                  isSelected ? 'bg-indigo-100' : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
                  {otherUser.name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="truncate font-semibold">{otherUser.name}</h2>
                    {chat.unreadCount > 0 && (
                      <span className="ml-2 shrink-0 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                  {chat.lastMessage && <p className="truncate text-sm text-gray-500">{chat.lastMessage.content}</p>}
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}

export default ChatList;
