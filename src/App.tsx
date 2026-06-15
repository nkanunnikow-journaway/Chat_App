import { deleteUser } from './api/usersApi';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import UsersPage from './pages/UsersPage';
import type { User } from './types/users.tsx';
import { useState } from 'react';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [page, setPage] = useState<'chat' | 'profile'>('chat');

  function handleAuthSuccess(user: User) {
    setCurrentUser(user);
  }

  function handleLogout() {
    setCurrentUser(null);
    setPage('chat');
  }

  async function handleDeleteAccount() {
    if (!currentUser) {
      return;
    }
    try {
      await deleteUser(currentUser.id);
      setCurrentUser(null);
      setPage('chat');
    } catch (error) {
      console.error('Account konnte nicht gelöscht werden', error);
    }
  }

  if (!currentUser) {
    return <RegisterPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (page === 'profile') {
    return (
      <ProfilePage
        currentUser={currentUser}
        onUserUpdate={setCurrentUser}
        onDeleteAccount={handleDeleteAccount}
        onBack={() => setPage('chat')}
      />
    );
  }

  return <UsersPage currentUser={currentUser} onLogout={handleLogout} onProfile={() => setPage('profile')} />;
}

export default App;
