import { Chat } from '../../types/chats.tsx';
import { User } from '../../types/users.tsx';
import GroupDropdown from './GroupDropdown.tsx';
import { useState, useRef, useEffect } from 'react';

type ChatHeaderProps = {
  selectedChat: Chat | null;
  currentUser: User;
  onChatUpdate: (chat: Chat) => void;
  onLeaveChat: () => void;
  isAdmin: boolean;
};
function ChatHeader({ selectedChat, currentUser, onChatUpdate, onLeaveChat, isAdmin }: ChatHeaderProps) {
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropDownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white p-6">
      {selectedChat ? (
        <div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropDownOpen((prev) => !prev)}
              className="flex items-center gap-2 hover:opacity-70 transition"
            >
              <h2 className="text-2xl font-bold">
                {selectedChat.type === 'DIRECT'
                  ? selectedChat.participants.find((p) => p.userId !== currentUser.id)?.user.name
                  : selectedChat.name}
              </h2>
              {selectedChat.type === 'GROUP' && (
                <span className={`text-gray-400 transition-transform ${isDropDownOpen ? 'rotate-180' : ''}`}>▼</span>
              )}
            </button>
            {isDropDownOpen && selectedChat.type === 'GROUP' && (
              <GroupDropdown
                selectedChat={selectedChat}
                currentUser={currentUser}
                isAdmin={isAdmin}
                onChatUpdate={onChatUpdate}
                onLeaveChat={onLeaveChat}
              />
            )}
          </div>
          {selectedChat.type === 'DIRECT' ? (
            <p className="text-sm text-gray-500">
              {selectedChat.participants.find((p) => p.userId !== currentUser.id)?.user.email}
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              {selectedChat.participants
                .filter((p) => p.userId !== currentUser.id)
                .map((p) => p.user.name)
                .join(', ')}
            </p>
          )}
        </div>
      ) : (
        <h2 className="text-2xl font-bold">Kein Chat ausgewählt</h2>
      )}
    </header>
  );
}

export default ChatHeader;
