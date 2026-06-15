import type { User } from '../types/users.tsx';
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
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shrink-0">
      <h1 className="text-lg font-bold text-indigo-600">MyChat</h1>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-gray-100"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 font-bold text-white text-sm">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-semibold">{currentUser.name}</span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-gray-200 bg-white shadow-lg z-50">
            <button
              onClick={() => {
                onProfile();
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-t-2xl px-4 py-3 text-sm transition hover:bg-gray-100"
            >
              Mein Profil
            </button>
            <hr className="border-gray-100" />
            <button
              onClick={() => {
                onLogout();
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-b-2xl px-4 py-3 text-sm text-red-500 transition hover:bg-red-50"
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
