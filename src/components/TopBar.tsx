import type { User } from '../types/users.tsx';
import Avatar from './ui/Avatar.tsx';
import { useState, useRef, useEffect } from 'react';

type TopBarProps = {
  currentUser: User;
  onLogout: () => void;
  onProfile: () => void;
};

function TopBar({ currentUser, onLogout, onProfile }: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between border-b  bg-bg-sidebar px-6 py-3 shrink-0">
      <h1 className="text-lg font-bold text-primary">MyChat</h1>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-primary-light"
        >
          <Avatar user={currentUser} size="sm" />
          <span className="text-sm font-semibold text-text-main">{currentUser.name}</span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border  bg-bg-sidebar shadow-lg z-50">
            <button
              onClick={() => {
                onProfile();
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-t-xl px-4 py-3 text-sm text-text-main transition hover:bg-primary-light"
            >
              Mein Profil
            </button>
            <hr className="" />
            <button
              onClick={() => {
                onLogout();
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-b-xl px-4 py-3 text-sm text-red-500 transition hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default TopBar;
