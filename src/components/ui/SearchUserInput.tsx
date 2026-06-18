import { searchUsersByName } from '../../api/usersApi.tsx';
import { User } from '../../types/users.tsx';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type SearchUserInputProps = {
  onSelectUser: (user: User) => void;
  onSearchTermChange?: (hasSearchTerm: boolean) => void;
};

function SearchUserInput({ onSelectUser, onSearchTermChange }: SearchUserInputProps) {
  const { t } = useTranslation();
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
      console.error('Search failed', error);
      setSearchError(true);
    }
  }

  return (
    <div>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder={t('group.search_placeholder')}
          value={searchTerm}
          onChange={(event) => handleSearch(event.target.value)}
          className="w-full rounded-lg border border-primary-border bg-bg-chat pl-9 pr-4 py-2.5 text-sm text-text-main outline-none focus:border-primary transition placeholder:text-text-muted"
        />
      </div>
      {searchTerm.trim() !== '' ? (
        searchError ? (
          <p className="text-xs text-text-muted text-center mt-3">{t('group.no_user_found')}</p>
        ) : (
          <div className="mt-1 max-h-44 rounded-lg border border-primary-border bg-bg-message-in overflow-y-auto">
            {searchResults.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  onSelectUser(user);
                  setSearchTerm('');
                  setSearchResults([]);
                  onSearchTermChange?.(false);
                }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-primary-light last:border-0"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-white text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-text-main">{user.name}</h2>
                  <p className="truncate text-xs text-text-muted">{user.email}</p>
                </div>
              </button>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}

export default SearchUserInput;
