import ChatWindow from '../components/ChatWindow.tsx';
import UserList from '../components/UserList.tsx';
import type { User } from '../types/users.tsx';
import { useState } from 'react';

type UsersPageProps = {
  currentUser: User;
  onLogout: () => void;
};

function UsersPage({ currentUser, onLogout }: UsersPageProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      <UserList selectedUser={selectedUser} onSelectUser={setSelectedUser} onLogout={onLogout} />
      <ChatWindow selectedUser={selectedUser} currentUser={currentUser} />
    </div>
  );
}

export default UsersPage;
