import { getChats } from '../api/chatsApi.tsx';
import type { Chat } from '../types/chats.tsx';
import type { User } from '../types/users.tsx';
import Avatar from './ui/Avatar.tsx';
import SearchUserInput from './ui/SearchUserInput.tsx';
import {
  Plus,
  UserIcon,
  LogOut,
  Rocket,
  CableCar,
  Handshake,
  Bike,
  PlaneTakeoff,
  Footprints,
  Moon,
  Sun
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

type UserListProps = {
  currentUser: User;
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onSelectUser: (user: User) => void;
  onOpenGroupModal: () => void;
  groupRefresh: number;
  onProfile: () => void;
  onLogout: () => void;
};

function ChatList({
  currentUser,
  selectedChat,
  onSelectChat,
  onSelectUser,
  onOpenGroupModal,
  groupRefresh,
  onProfile,
  onLogout
}: UserListProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [logoutHovered, setLogoutHovered] = useState(false);
  const [currentLogoutIcon, setCurrentLogoutIcon] = useState(0);
  const hoverIcons = [Rocket, CableCar, Handshake, Bike, PlaneTakeoff, Footprints];
  const HoverIcon = hoverIcons[currentLogoutIcon];
  const [isDark, setIsDark] = useState(false);
  const { t, i18n } = useTranslation();

  function toggleDarkMode() {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.setAttribute('data-theme', newDark ? 'dark' : 'light');
  }

  useEffect(() => {
    async function loadChats() {
      try {
        const allChats = await getChats({ userId: currentUser.id });
        const filtered = allChats.filter((chat) => chat.lastMessage !== null || chat.type === 'GROUP');
        const sorted = filtered.sort((a, b) => {
          const aTime = a.lastMessage?.createdAt ?? a.createdAt;
          const bTime = b.lastMessage?.createdAt ?? b.createdAt;
          return new Date(bTime).getTime() - new Date(aTime).getTime();
        });
        setChats(sorted);
      } catch (error) {
        console.error('Chats could not be loaded', error);
      }
    }

    loadChats();
  }, [currentUser.id, groupRefresh]);

  return (
    <aside className="w-80 flex flex-col h-full bg-bg-sidebar">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-base font-semibold text-text-main">{t('chat.title')}</h1>
          <button
            onClick={onOpenGroupModal}
            title={t('group.new')}
            className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-white hover:bg-primary-dark transition text-lg leading-none"
          >
            <Plus size={14} />
          </button>
        </div>
        <SearchUserInput onSelectUser={onSelectUser} onSearchTermChange={setIsSearching} />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isSearching
          ? null
          : chats.map((chat) => {
              const otherParticipant = chat.participants.find((p) => p.userId !== currentUser.id);

              if (!otherParticipant) {
                return null;
              }

              const otherUser = otherParticipant.user;
              const isSelected = selectedChat?.id === chat.id;
              const displayName = chat.type === 'DIRECT' ? otherUser.name : (chat.name ?? t('group.new'));

              return (
                <button
                  key={chat.id}
                  onClick={() => {
                    onSelectChat(chat);
                    setChats((prev) => prev.map((c) => (c.id === chat.id ? { ...c, unreadCount: 0 } : c)));
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    isSelected ? 'bg-primary-light' : 'hover:bg-primary-light/50'
                  }`}
                >
                  <Avatar
                    user={chat.type === 'DIRECT' ? otherUser : { id: chat.id, name: displayName, email: '' }}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <h2
                          className={`truncate text-sm font-semibold ${isSelected ? 'text-primary-dark' : 'text-text-main'}`}
                        >
                          {displayName}
                        </h2>
                        {chat.type === 'GROUP' && (
                          <p className="truncate text-xs text-text-muted">
                            {chat.participants
                              .filter((p) => p.userId !== currentUser.id)
                              .map((p) => p.user.name)
                              .join(', ')}
                          </p>
                        )}
                      </div>
                      {chat.unreadCount > 0 && (
                        <span className="ml-2 shrink-0 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    {chat.lastMessage && (
                      <p className={`truncate text-xs mt-0.5 ${isSelected ? 'text-primary' : 'text-text-muted'}`}>
                        {chat.lastMessage.content}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
      </div>

      <div className="shrink-0 p-3 flex items-center gap-3 bg-bg-sidebar">
        <Avatar user={currentUser} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text-main truncate">{currentUser.name}</p>
          <p className="text-xs text-text-muted truncate">{currentUser.email}</p>
        </div>
        <button
          onClick={onProfile}
          className="text-text-muted hover:text-primary transition p-1.5 rounded-lg hover:bg-primary-light"
          title={t('profile.title')}
        >
          <UserIcon size={18} />
        </button>
        <button
          onClick={toggleDarkMode}
          title={isDark ? 'Light Mode' : 'Dark Mode'}
          className="text-text-muted hover:text-primary transition p-1.5 rounded-lg hover:bg-primary-light"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          onClick={() => i18n.changeLanguage(i18n.language === 'de' ? 'en' : 'de')}
          title={i18n.language === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln'}
          className="text-text-muted hover:text-primary transition p-1.5 rounded-lg hover:bg-primary-light text-xs font-semibold"
        >
          {i18n.language === 'de' ? 'EN' : 'DE'}
        </button>
        <button
          onClick={onLogout}
          title="Logout"
          onMouseEnter={() => {
            setLogoutHovered(true);
            setCurrentLogoutIcon((prev) => (prev + 1) % hoverIcons.length);
          }}
          onMouseLeave={() => setLogoutHovered(false)}
          className={`transition p-1.5 rounded-lg ${logoutHovered ? 'text-red-500 bg-red-50' : 'text-text-muted'}`}
        >
          {logoutHovered ? <HoverIcon size={18} /> : <LogOut size={18} />}
        </button>
      </div>
    </aside>
  );
}

export default ChatList;
