import {
  addParticipant,
  removeParticipant,
  updateParticipantsRole,
  updateChatName,
  deleteChat
} from '../../api/chatsApi.tsx';
import type { Chat } from '../../types/chats.tsx';
import type { User } from '../../types/users.tsx';
import Avatar from '../ui/Avatar.tsx';
import SearchUserInput from '../ui/SearchUserInput.tsx';
import { Users, UserPlus, Pencil, Trash2, LogOut, Check } from 'lucide-react';
import { useState } from 'react';

type GroupDropdownProps = {
  selectedChat: Chat;
  currentUser: User;
  isAdmin: boolean;
  onChatUpdate: (chat: Chat) => void;
  onLeaveChat: () => void;
  onDeleteChat: () => void;
};

function GroupDropdown({
  selectedChat,
  currentUser,
  isAdmin,
  onChatUpdate,
  onLeaveChat,
  onDeleteChat
}: GroupDropdownProps) {
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

  async function handleDeleteChat() {
    try {
      await deleteChat(selectedChat.id);
      onDeleteChat();
    } catch (error) {
      console.error('Chat konnte nicht gelöscht werden', error);
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
    <div className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-primary-border bg-bg-message-in shadow-lg z-50 overflow-hidden">
      <button
        onClick={() => setShowMembers((prev) => !prev)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-text-main hover:bg-primary-light transition"
      >
        <Users size={15} className="text-text-muted" />
        Mitglieder anzeigen
      </button>
      {showMembers && (
        <div className="px-4 pb-3 ">
          {selectedChat.participants.map((participant) => (
            <div key={participant.id} className="flex items-center gap-2 py-2">
              <Avatar user={participant.user} size="sm" />
              <span className="text-sm flex-1 text-text-main">{participant.user.name}</span>
              {participant.userId === currentUser.id ? (
                <span className="text-xs text-text-muted">Du</span>
              ) : isAdmin ? (
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleUpdateRole(participant.userId, participant.role === 'ADMIN' ? 'MEMBER' : 'ADMIN')
                    }
                    className="text-xs text-primary hover:text-primary-dark transition"
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
        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-text-main hover:bg-primary-light transition "
      >
        <UserPlus size={15} className="text-text-muted" />
        Mitglied hinzufügen
      </button>
      {showAddMember && (
        <div className="px-4 pb-3 mt-2">
          <SearchUserInput onSelectUser={handleAddMember} />
        </div>
      )}

      <button
        onClick={() => {
          setShowRenameInput((prev) => !prev);
          setNewGroupName(selectedChat.name ?? '');
        }}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-text-main hover:bg-primary-light transition "
      >
        <Pencil size={15} className="text-text-muted" />
        Gruppenname ändern
      </button>
      {showRenameInput && (
        <div className="px-4 pb-3 mt-2 flex gap-2">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="flex-1 rounded-lg border border-primary-border bg-bg-chat px-3 py-2 text-sm text-text-main outline-none focus:border-primary transition"
          />
          <button
            onClick={handleRenameGroup}
            className="rounded-lg bg-primary px-3 py-2 text-sm text-white hover:bg-primary-dark transition"
          >
            <Check size={16} />
          </button>
        </div>
      )}

      <hr className="border-primary-border" />
      {isAdmin && (
        <button
          onClick={handleDeleteChat}
          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
        >
          <Trash2 size={15} />
          Gruppe löschen
        </button>
      )}
      <button
        onClick={handleLeaveGroup}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
      >
        <LogOut size={15} />
        Gruppe verlassen
      </button>
    </div>
  );
}

export default GroupDropdown;
