import { getUsers, searchUsersByName } from '../api/usersApi.tsx';
import type { User } from '../types/users.tsx';
import { useState, useEffect } from 'react';

type UserListProps = {
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
};

function UserList({ selectedUser, onSelectUser }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  async function handleSearch(value: string) {
    setSearchTerm(value);

    try {
      if (value.trim() === '') {
        const loadedUsers = await getUsers();
        setUsers(loadedUsers);
        return;
      }

      const foundUsers = await searchUsersByName(value);
      setUsers(foundUsers);
    } catch (error) {
      console.error('User-Suche fehlgeschlagen', error);
    }
  }

  useEffect(() => {
    async function loadUsers() {
      try {
        const loadedUsers = await getUsers();
        setUsers(loadedUsers);

        if (loadedUsers.length > 0) {
          onSelectUser(loadedUsers[0]);
        }
      } catch (error) {
        console.error('User konnten nicht geladen werden', error);
      }
    }

    loadUsers();
  }, []);
  return (
    <aside className="w-80 border-r border-gray-200 bg-white">
      <div className="p-4">
        <input
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500"
          placeholder="User suchen..."
          value={searchTerm}
          onChange={(event) => handleSearch(event.target.value)}
        />
      </div>

      <div className="space-y-2 px-4">
        {users.map((user) => (
          <button
            onClick={() => onSelectUser(user)}
            key={user.id}
            className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
              selectedUser?.id === user.id ? 'bg-indigo-100' : 'hover:bg-gray-100'
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <h2 className="truncate font-semibold">{user.name}</h2>
              <p className="truncate text-sm text-gray-500">{user.email}</p>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}

export default UserList;
