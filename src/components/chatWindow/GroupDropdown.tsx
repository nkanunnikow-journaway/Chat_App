import { addParticipant, removeParticipant, updateParticipantsRole, updateChatName } from '../../api/chatsApi.tsx';
import type { Chat } from '../../types/chats.tsx';
import type { User } from '../../types/users.tsx';
import SearchUserInput from '../ui/SearchUserInput.tsx';
import { useState } from 'react';

type GroupDropdownProps = {
  selectedChat: Chat;
  currentUser: User;
  isAdmin: boolean;
  onChatUpdate: (chat: Chat) => void;
  onLeaveChat: () => void;
};

function GroupDropdown({ selectedChat, currentUser, isAdmin, onChatUpdate, onLeaveChat }: GroupDropdownProps) {
  const [showMembers, setShowMembers] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showRenameInput, setShowRenameInput] = useState(false);
  const [newGroupName, setNewGroupName] = useState(selectedChat.name ?? '');

  async function handleUpdateRole(userId: string, role: 'MEMBER' | 'ADMIN') {
    try {
      const updatedParticipant = await updateParticipantsRole(selectedChat.id, userId, role);
      onChatUpdate({
        ...selectedChat,
        participants: selectedChat.participants.map((p) =>
          p.userId === userId ? { ...p, role: updatedParticipant.role } : p
        )
      });
    } catch (error) {
      console.error('Rolle konnte nicht geändert werden', error);
    }
  }

  async function handleAddMember(user: User) {
    try {
      const newParticipant = await addParticipant(selectedChat.id, user.id);
      onChatUpdate({
        ...selectedChat,
        participants: [...selectedChat.participants, newParticipant]
      });
      setShowAddMember(false);
    } catch (error) {
      console.error('Mitglied konnte nicht hinzugefügt werden', error);
    }
  }

  async function handleRemoveMember(userId: string) {
    try {
      await removeParticipant(selectedChat.id, userId);
      onChatUpdate({
        ...selectedChat,
        participants: selectedChat.participants.filter((p) => p.userId !== userId)
      });
    } catch (error) {
      console.error('Mitglied konnte nicht entfernt werden', error);
    }
  }

  async function handleRenameGroup() {
    if (newGroupName.trim() === '') {
      return;
    }
    try {
      const updatedChat = await updateChatName(selectedChat.id, newGroupName);
      onChatUpdate(updatedChat);
      setShowRenameInput(false);
    } catch (error) {
      console.error('Gruppenname konnte nicht geändert werden', error);
    }
  }

  async function handleLeaveGroup() {
    try {
      await removeParticipant(selectedChat.id, currentUser.id);
      onLeaveChat();
    } catch (error) {
      console.error('Gruppe konnte nicht verlassen werden', error);
    }
  }

  return (
    <div className="absolute left-0 top-full mt-2 w-56 rounded-2xl border border-gray-200 bg-white shadow-lg z-50">
      <button
        onClick={() => setShowMembers((prev) => !prev)}
        className="flex w-full items-center gap-2 rounded-t-2xl px-4 py-3 text-sm hover:bg-gray-100 transition"
      >
        Mitglieder anzeigen
      </button>
      {showMembers && (
        <div className="px-4 pb-3">
          {selectedChat.participants.map((participant) => (
            <div key={participant.id} className="flex items-center gap-2 py-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-bold text-white text-xs">
                {participant.user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm flex-1">{participant.user.name}</span>
              {participant.userId === currentUser.id ? (
                <span className="text-xs text-gray-400">Du</span>
              ) : isAdmin ? (
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleUpdateRole(participant.userId, participant.role === 'ADMIN' ? 'MEMBER' : 'ADMIN')
                    }
                    className="text-xs text-indigo-400 hover:text-indigo-600 transition"
                  >
                    {participant.role === 'ADMIN' ? 'Zu Member' : 'Zu Admin'}
                  </button>
                  <button
                    onClick={() => handleRemoveMember(participant.userId)}
                    className="text-xs text-red-400 hover:text-red-600 transition"
                  >
                    Entfernen
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => setShowAddMember((prev) => !prev)}
        className="flex w-full items-center gap-2 px-4 py-3 text-sm hover:bg-gray-100 transition"
      >
        Mitglied hinzufügen
      </button>
      {showAddMember && (
        <div className="px-4 pb-3">
          <SearchUserInput onSelectUser={handleAddMember} />
        </div>
      )}
      <button
        onClick={() => {
          setShowRenameInput((prev) => !prev);
          setNewGroupName(selectedChat.name ?? '');
        }}
        className="flex w-full items-center gap-2 px-4 py-3 text-sm hover:bg-gray-100 transition"
      >
        Gruppenname ändern
      </button>
      {showRenameInput && (
        <div className="px-4 pb-3 flex gap-2">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleRenameGroup}
            className="rounded-xl bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700 transition"
          >
            OK
          </button>
        </div>
      )}
      <hr className="border-gray-100" />
      <button
        onClick={handleLeaveGroup}
        className="flex w-full items-center gap-2 rounded-b-2xl px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition"
      >
        Gruppe verlassen
      </button>
    </div>
  );
}

export default GroupDropdown;
