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

  const [showModal, setShowModal] = useState(false);

  function handleGroupModal() {
    setShowModal(true);
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
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
        />
        <ChatWindow selectedUser={selectedUser} currentUser={currentUser} />
      </div>
      {showModal && (
        <div
          className={'fixed inset-0 bg-black/80 flex items-center justify-center z-50'}
          onClick={() => setLightboxUrl(null)}
        >
          <input
            type="text"
            placeholder="Search for User"
            value={searchTerm}
            onChange={(event) => handleSearch(event.target.value)}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-indigo-500"
          />
          <img
            src={lightboxUrl}
            alt="Lightbox"
            className="max-w-[90vw] max-h-[90vh] rounded-xl object-contain"
            onClick={(event) => event.stopPropagation()}
          />
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition"
          >
            x
          </button>
        </div>
      )}
    </div>
  );
}

export default UsersPage;
