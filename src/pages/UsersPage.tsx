import { createChat, getChats } from '../api/chatsApi.tsx';
import ChatList from '../components/ChatList.tsx';
import ChatWindow from '../components/ChatWindow.tsx';
import SearchUserInput from '../components/ui/SearchUserInput.tsx';
import type { Chat } from '../types/chats.tsx';
import type { User } from '../types/users.tsx';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type UsersPageProps = {
  currentUser: User;
  onLogout: () => void;
  onProfile: () => void;
};

function UsersPage({ currentUser, onLogout, onProfile }: UsersPageProps) {
  const { t } = useTranslation();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [userArray, setUserArray] = useState<User[]>([]);
  const [groupName, setGroupName] = useState<string>('');
  const [groupRefresh, setGroupRefresh] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleGroupModal() {
    setShowModal(true);
  }

  async function handleCreateGroup() {
    setSubmitted(true);
    if (groupName.trim() === '' || userArray.length === 0) {
      return;
    }
    try {
      setIsLoading(true);
      const participantIds = [currentUser.id, ...userArray.map((user) => user.id)];
      await createChat({
        type: 'GROUP',
        name: groupName,
        participantIds: participantIds
      });
      setGroupRefresh((prev) => prev + 1);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      handleCancel();
    } catch (error) {
      console.log('Group creation failed', error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleError(error: string) {
    setError(error);
    setTimeout(() => {
      setError(null);
    }, 5000);
  }

  function handleCancel() {
    setUserArray([]);
    setGroupName('');
    setSubmitted(false);
    setShowModal(false);
  }

  async function handleSelectUser(user: User) {
    const allChats = await getChats({ userId: currentUser.id });
    const existingChat = allChats.find((chat) => {
      if (chat.type !== 'DIRECT') {
        return false;
      }
      const participantIds = chat.participants.map((p) => p.userId);
      return participantIds.includes(currentUser.id) && participantIds.includes(user.id);
    });

    if (existingChat) {
      setSelectedChat(existingChat);
      return;
    }

    const createdChat = await createChat({
      type: 'DIRECT',
      participantIds: [currentUser.id, user.id]
    });
    setSelectedChat(createdChat);
  }

  function handleAddUser(user: User) {
    if (user.id === currentUser.id) {
      handleError(t('group.error_self'));
      return;
    }
    const alreadyAdded = userArray.some((u) => u.id === user.id);
    if (alreadyAdded) {
      handleError(t('group.error_already_added'));
      return;
    }
    setUserArray([...userArray, user]);
  }

  const isGroupNameValid = groupName.trim() !== '';

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg-app text-text-main">
      <div className="flex flex-1 overflow-hidden">
        <ChatList
          onOpenGroupModal={handleGroupModal}
          currentUser={currentUser}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
          groupRefresh={groupRefresh}
          onSelectUser={handleSelectUser}
          onProfile={onProfile}
          onLogout={onLogout}
        />
        <ChatWindow
          selectedChat={selectedChat}
          currentUser={currentUser}
          onChatUpdate={setSelectedChat}
          onLeaveChat={() => {
            setSelectedChat(null);
            setGroupRefresh((prev) => prev + 1);
          }}
          onMessageSent={() => setGroupRefresh((prev) => prev + 1)}
          onDeleteChat={() => {
            setSelectedChat(null);
            setGroupRefresh((prev) => prev + 1);
          }}
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-bg-message-in rounded-2xl p-6 w-[480px] h-[480px] flex flex-col relative border border-primary-border shadow-lg">
            <h2 className="text-base font-semibold text-text-main mb-4">{t('group.new')}</h2>
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-bg-chat text-text-muted hover:bg-primary-light transition text-sm"
            >
              <X size={14} />
            </button>

            <input
              type="text"
              placeholder={t('group.name_placeholder')}
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
              className={`w-full mt-3 rounded-xl border px-4 py-2.5 text-sm text-text-main bg-bg-chat outline-none transition placeholder:text-text-muted ${
                submitted && groupName.trim() === '' ? 'border-red-400' : 'border-primary-border focus:border-primary'
              }`}
            />
            {submitted && groupName.trim() === '' && (
              <p className="text-red-500 text-xs mt-1">{t('group.name_required')}</p>
            )}

            <div
              className={`mt-3 min-h-0 transition-opacity ${isGroupNameValid ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}
            >
              <SearchUserInput onSelectUser={handleAddUser} />
              {!isGroupNameValid && <p className="text-xs text-text-muted mt-1">{t('group.name_required')}</p>}
            </div>

            <div className="flex-1 overflow-y-auto mt-3">
              <ul className="flex flex-wrap gap-2">
                {userArray.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center gap-1 rounded-full bg-primary-light px-3 py-1 text-xs text-primary-dark"
                  >
                    {user.name}
                    <button
                      onClick={() => setUserArray(userArray.filter((u) => u.id !== user.id))}
                      className="ml-1 text-primary hover:text-red-500 transition"
                    >
                      <X size={10} />
                    </button>
                  </li>
                ))}
              </ul>
              {submitted && userArray.length === 0 && (
                <p className="text-red-500 text-xs mt-1">{t('group.members_required')}</p>
              )}
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </div>

            <div className="flex gap-2 mt-4 shrink-0">
              <button
                onClick={handleCreateGroup}
                className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition"
              >
                {isLoading ? t('group.creating') : t('group.create')}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 rounded-xl border border-primary-border px-4 py-2.5 text-sm font-semibold text-text-muted hover:bg-bg-sidebar transition"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersPage;
