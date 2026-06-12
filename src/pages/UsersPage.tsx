import { createChat, getChats } from '../api/chatsApi.tsx';
import ChatList from '../components/ChatList.tsx';
import ChatWindow from '../components/ChatWindow.tsx';
import TopBar from '../components/TopBar.tsx';
import Button from '../components/ui/Button.tsx';
import SearchUserInput from '../components/ui/SearchUserInput.tsx';
import type { Chat } from '../types/chats.tsx';
import type { User } from '../types/users.tsx';
import { useState } from 'react';

type UsersPageProps = {
  currentUser: User;
  onLogout: () => void;
};

function UsersPage({ currentUser, onLogout }: UsersPageProps) {
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
      const participantIds = [...userArray.map((user) => user.id), currentUser.id];
      await createChat({
        type: 'GROUP',
        name: groupName,
        participantIds: participantIds
      });
      setGroupRefresh((prev) => prev + 1);
      setSubmitted(true);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      handleCancel();
    } catch (error) {
      console.log('Gruppe konnte nicht erstellt werden', error);
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
      handleError('You cannot add yourself to a chat');
      return;
    }
    const alreadyAdded = userArray.some((u) => u.id === user.id);
    if (alreadyAdded) {
      handleError('User is already in the group');
      return;
    }
    setUserArray([...userArray, user]);
  }

  function handleProfile() {
    console.log('Mein Profil');
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100 text-gray-900">
      <TopBar currentUser={currentUser} onLogout={onLogout} onProfile={handleProfile} />
      <div className="flex flex-1 overflow-hidden">
        <ChatList
          onOpenGroupModal={handleGroupModal}
          currentUser={currentUser}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
          groupRefresh={groupRefresh}
          onSelectUser={handleSelectUser}
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
        />
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[500px] max-h-[80vh] overflow-y-auto relative">
            <SearchUserInput onSelectUser={handleAddUser} />
            <input
              type="text"
              placeholder="Enter Groupname"
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
              className={`flex-1 rounded-xl border px-4 py-3 outline-none focus:border-indigo-500 ${
                submitted && groupName.trim() === '' ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {submitted && groupName.trim() === '' && (
              <p className="text-red-500 text-xs mt-1">Bitte gib einen Gruppennamen ein.</p>
            )}
            <ul className="mt-3 flex flex-wrap gap-2 p-2">
              {userArray.map((user) => (
                <li key={user.id} className="flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm">
                  {user.name}
                  <button
                    onClick={() => setUserArray(userArray.filter((u) => u.id !== user.id))}
                    className="ml-1 text-indigo-400 hover:text-red-500 transition"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            {submitted && userArray.length === 0 && (
              <p className="text-red-500 text-xs mt-1">Bitte füge mindestens zwei Teilnehmer hinzu.</p>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
            >
              x
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <Button onClick={handleCreateGroup}>{isLoading ? 'Loading...' : 'Save'}</Button>
            <Button onClick={handleCancel}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersPage;
