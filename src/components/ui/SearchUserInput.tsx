import { searchUsersByName } from '../../api/usersApi.tsx';
import { User } from '../../types/users.tsx';
import { useState } from 'react';

type SearchUserInputProps = {
  onSelectUser: (user: User) => void;
  onSearchTermChange?: (hasSearchTerm: boolean) => void;
};

function SearchUserInput({ onSelectUser, onSearchTermChange }: SearchUserInputProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchError, setSearchError] = useState(false);

  async function handleSearch(value: string) {
    const hasSearchTerm = value.trim() !== '';
    setSearchTerm(value);
    if (onSearchTermChange) {
      onSearchTermChange(hasSearchTerm);
    }

    setSearchError(false);

    if (value.trim() === '') {
      setSearchResults([]);
      return;
    }
    try {
      const results = await searchUsersByName(value);
      setSearchResults(results);
      setSearchError(results.length === 0);
    } catch (error) {
      console.error('Fehler beim Suchen', error);
      setSearchError(true);
    }
  }
  return (
    <div>
      <input
        type="text"
        placeholder="Search for User"
        value={searchTerm}
        onChange={(event) => handleSearch(event.target.value)}
        className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-indigo-500"
      />
      {searchTerm.trim() !== '' ? (
        searchError ? (
          <p className="text-sm text-gray-400 text-center mt-4">No results found</p>
        ) : (
          searchResults.map((user) => (
            <button
              key={user.id}
              onClick={() => {
                onSelectUser(user);
                setSearchTerm('');
                setSearchResults([]);
                onSearchTermChange?.(false);
              }}
              className={'flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:bg-gray-100'}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-semibold">{user.name}</h2>
                <p className="truncate text-sm text-gray-500">{user.email}</p>
              </div>
            </button>
          ))
        )
      ) : null}
    </div>
  );
}

export default SearchUserInput;
