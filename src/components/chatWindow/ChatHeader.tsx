import { deleteChat } from '../../api/chatsApi.tsx';
import { Chat } from '../../types/chats.tsx';
import { User } from '../../types/users.tsx';
import Avatar from '../ui/Avatar.tsx';
import GroupDropdown from './GroupDropdown.tsx';
import { MoreVertical, Trash2, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type ChatHeaderProps = {
  selectedChat: Chat | null;
  currentUser: User;
  onChatUpdate: (chat: Chat) => void;
  onLeaveChat: () => void;
  onDeleteChat: () => void;
  isAdmin: boolean;
  onBackToList: () => void;
};

function ChatHeader({
  selectedChat,
  currentUser,
  onChatUpdate,
  onLeaveChat,
  onDeleteChat,
  isAdmin,
  onBackToList
}: ChatHeaderProps) {
  const { t } = useTranslation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);

  return (
    <header className="flex items-center justify-between bg-bg-chat px-6 py-4 shrink-0">
      {selectedChat ? (
        <>
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToList}
              className="flex lg:hidden p-1.5 rounded-lg text-text-muted hover:bg-primary-light hover:text-primary transition"
            >
              <ArrowLeft size={18} />
            </button>

            <Avatar
              user={
                selectedChat.type === 'DIRECT'
                  ? (selectedChat.participants.find((p) => p.userId !== currentUser.id)?.user ?? currentUser)
                  : { id: selectedChat.id, name: selectedChat.name ?? t('group.new'), email: '' }
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
              <>
                <button
                  onClick={() => setIsDropDownOpen((prev) => !prev)}
                  title={t('group.manage')}
                  className="p-1.5 rounded-lg text-text-muted hover:bg-primary-light hover:text-primary transition ml-1"
                >
                  <MoreVertical size={18} />
                </button>
                {isDropDownOpen && (
                  <GroupDropdown
                    selectedChat={selectedChat!}
                    currentUser={currentUser}
                    isAdmin={isAdmin}
                    onChatUpdate={onChatUpdate}
                    onLeaveChat={onLeaveChat}
                    onDeleteChat={onDeleteChat}
                    onClose={() => setIsDropDownOpen(false)}
                  />
                )}
              </>
            )}
          </div>
          {selectedChat.type === 'DIRECT' && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              title={t('chat.delete_chat')}
              className="text-text-muted hover:text-red-500 transition text-sm p-2 rounded-lg hover:bg-red-50"
            >
              <Trash2 size={18} />
            </button>
          )}
        </>
      ) : (
        <h2 className="text-base font-semibold text-text-muted">{t('chat.no_chat')}</h2>
      )}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-message-in rounded-xl p-6 w-80 flex flex-col gap-4 border border-primary-border">
            <p className="text-sm font-semibold text-text-main">{t('chat.delete_chat_confirm')}</p>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (selectedChat) {
                    await deleteChat(selectedChat.id);
                  }
                  onDeleteChat();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition"
              >
                {t('common.delete')}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-lg border border-primary-border px-4 py-2 text-sm font-semibold text-text-muted hover:bg-bg-sidebar transition"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default ChatHeader;
