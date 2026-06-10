import ChatList from '../components/ChatList.tsx';
import ChatWindow from '../components/ChatWindow.tsx';
import TopBar from '../components/TopBar.tsx';
import type { User } from '../types/users.tsx';
import { useState } from 'react';

type UsersPageProps = {
  currentUser: User;
  onLogout: () => void;
};

function UsersPage({ currentUser, onLogout }: UsersPageProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  function handleProfile() {
    console.log('Mein Profil');
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100 text-gray-900">
      <TopBar currentUser={currentUser} onLogout={onLogout} onProfile={handleProfile} />
      <div className="flex flex-1 overflow-hidden">
        <ChatList
          currentUser={currentUser}
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
          onLogout={onLogout}
        />
        <ChatWindow selectedUser={selectedUser} currentUser={currentUser} />
      </div>
    </div>
  );
}

export default UsersPage;
