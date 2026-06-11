import { getChats } from '../api/chatsApi.tsx';
import type { Chat } from '../types/chats.tsx';
import type { User } from '../types/users.tsx';
import SearchUserInput from './ui/SearchUserInput.tsx';
import { useState, useEffect } from 'react';

type UserListProps = {
  currentUser: User;
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
  onOpenGroupModal: () => void;
};

function ChatList({ currentUser, selectedUser, onSelectUser, onOpenGroupModal }: UserListProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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
        <SearchUserInput onSelectUser={onSelectUser} onSearchTermChange={setIsSearching} />
        <button
          onClick={onOpenGroupModal}
          className="shrink-0 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition"
        >
          +
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 p-4">
        {isSearching
          ? null
          : chats.map((chat) => {
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
            })}
      </div>
    </aside>
  );
}

export default ChatList;
