import { Chat } from '../../types/chats.tsx';
import { User } from '../../types/users.tsx';
import Avatar from '../ui/Avatar.tsx';
import GroupDropdown from './GroupDropdown.tsx';
import { ChevronDown, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

type ChatHeaderProps = {
  selectedChat: Chat | null;
  currentUser: User;
  onChatUpdate: (chat: Chat) => void;
  onLeaveChat: () => void;
  onDeleteChat: () => void;
  isAdmin: boolean;
};

function ChatHeader({ selectedChat, currentUser, onChatUpdate, onLeaveChat, onDeleteChat, isAdmin }: ChatHeaderProps) {
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    <header className="flex items-center justify-between bg-bg-chat px-6 py-4 shrink-0 ">
      {selectedChat ? (
        <>
          <div className="flex items-center gap-3">
            <Avatar
              user={
                selectedChat.type === 'DIRECT'
                  ? (selectedChat.participants.find((p) => p.userId !== currentUser.id)?.user ?? currentUser)
                  : { id: selectedChat.id, name: selectedChat.name ?? 'Gruppe', email: '' }
              }
              size="md"
            />
            <div>
              <h2 className="text-sm font-semibold text-text-main">
                {selectedChat.type === 'DIRECT'
                  ? selectedChat.participants.find((p) => p.userId !== currentUser.id)?.user.name
                  : selectedChat.name}
              </h2>
              {selectedChat.type === 'DIRECT' ? (
                <p className="text-xs text-text-muted">
                  {selectedChat.participants.find((p) => p.userId !== currentUser.id)?.user.email}
                </p>
              ) : (
                <p className="text-xs text-text-muted">
                  {selectedChat.participants
                    .filter((p) => p.userId !== currentUser.id)
                    .map((p) => p.user.name)
                    .join(', ')}
                </p>
              )}
            </div>
            {selectedChat.type === 'GROUP' && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropDownOpen((prev) => !prev)}
                  className="text-text-muted text-xs hover:opacity-70 transition ml-1"
                >
                  <ChevronDown size={18} className={`transition-transform ${isDropDownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDropDownOpen && (
                  <GroupDropdown
                    selectedChat={selectedChat!}
                    currentUser={currentUser}
                    isAdmin={isAdmin}
                    onChatUpdate={onChatUpdate}
                    onLeaveChat={onLeaveChat}
                    onDeleteChat={onDeleteChat}
                  />
                )}
              </div>
            )}
          </div>
          {selectedChat.type === 'DIRECT' && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              title="Chat löschen"
              className="text-text-muted hover:text-red-500 transition text-sm p-2 rounded-lg hover:bg-red-50"
            >
              <Trash2 size={18} />
            </button>
          )}
        </>
      ) : (
        <h2 className="text-base font-semibold text-text-muted">Kein Chat ausgewählt</h2>
      )}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-message-in rounded-xl p-6 w-80 flex flex-col gap-4 border border-primary-border">
            <p className="text-sm font-semibold text-text-main">Chat wirklich löschen?</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onDeleteChat();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition"
              >
                Löschen
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-lg border border-primary-border px-4 py-2 text-sm font-semibold text-text-muted hover:bg-bg-sidebar transition"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default ChatHeader;
