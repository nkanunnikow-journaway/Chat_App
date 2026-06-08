import RegisterPage from './pages/RegisterPage';
import UsersPage from './pages/UsersPage';
import type { User } from './types/users.tsx';
import { useState } from 'react';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  function handleAuthSuccess(user: User) {
    setCurrentUser(user);
  }

  if (!currentUser) {
    return <RegisterPage onAuthSuccess={handleAuthSuccess} />;
  }

  return <UsersPage currentUser={currentUser} />;
}

export default App;
