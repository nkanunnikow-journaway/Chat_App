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
import ConfirmModal from '../ui/ConfirmModal.tsx';
import SearchUserInput from '../ui/SearchUserInput.tsx';
import { Users, UserPlus, Pencil, Trash2, LogOut, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type GroupDropdownProps = {
  selectedChat: Chat;
  currentUser: User;
  isAdmin: boolean;
  onChatUpdate: (chat: Chat) => void;
  onLeaveChat: () => void;
  onDeleteChat: () => void;
  onClose: () => void;
};

type Tab = 'members' | 'add' | 'rename';

function GroupDropdown({
  selectedChat,
  currentUser,
  isAdmin,
  onChatUpdate,
  onLeaveChat,
  onDeleteChat,
  onClose
}: GroupDropdownProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('members');
  const [newGroupName, setNewGroupName] = useState(selectedChat.name ?? '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showLastAdminWarning, setShowLastAdminWarning] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  const tabLabels: Record<Tab, string> = {
    members: t('group.members'),
    add: t('group.add_member'),
    rename: t('group.rename')
  };

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
      console.error('Role update failed', error);
    }
  }

  async function handleDeleteChat() {
    try {
      await deleteChat(selectedChat.id);
      onDeleteChat();
    } catch (error) {
      console.error('Chat deletion failed', error);
    }
  }

  async function handleAddMember(user: User) {
    try {
      const newParticipant = await addParticipant(selectedChat.id, user.id);
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 2000);
      onChatUpdate({
        ...selectedChat,
        participants: [...selectedChat.participants, newParticipant]
      });
    } catch (error) {
      console.error('Member could not be added', error);
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
      console.error('Member could not be removed', error);
    }
  }

  async function handleRenameGroup() {
    if (newGroupName.trim() === '') {
      return;
    }
    try {
      const updatedChat = await updateChatName(selectedChat.id, newGroupName);
      onChatUpdate(updatedChat);
      setActiveTab('members');
    } catch (error) {
      console.error('Group rename failed', error);
    }
  }

  async function handleLeaveGroup() {
    try {
      await removeParticipant(selectedChat.id, currentUser.id);
      onLeaveChat();
    } catch (error) {
      console.error('Could not leave group', error);
    }
  }

  function handleLeaveClick() {
    const currentUserParticipant = selectedChat.participants.find((p) => p.userId === currentUser.id);
    const isCurrentUserAdmin = currentUserParticipant?.role === 'ADMIN';
    const adminCount = selectedChat.participants.filter((p) => p.role === 'ADMIN').length;

    if (isCurrentUserAdmin && adminCount <= 1) {
      setShowLastAdminWarning(true);
      return;
    }
    setShowLeaveConfirm(true);
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-bg-message-in rounded-2xl border border-primary-light shadow-sm w-full lg:w-[540px] h-[80vh] lg:h-auto lg:max-h-[80vh] flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-primary-light shrink-0 flex items-center justify-between">
            <div>
              <p className="text-base font-semibold text-text-main truncate">{selectedChat.name ?? t('group.new')}</p>
              <p className="text-xs text-text-muted">
                {t('group.members_count', { count: selectedChat.participants.length })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-main transition p-1 rounded-lg hover:bg-primary-light"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row lg:h-[380px] overflow-hidden">
            <div className="w-full lg:w-40 bg-bg-sidebar border-b lg:border-r border-primary-light flex flex-col shrink-0">
              {(['members', 'add', 'rename'] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm text-left transition ${
                    activeTab === tab
                      ? 'bg-primary-light text-primary font-semibold'
                      : 'text-text-main hover:bg-primary-light/50'
                  }`}
                >
                  {tab === 'members' && <Users size={14} className="shrink-0" />}
                  {tab === 'add' && <UserPlus size={14} className="shrink-0" />}
                  {tab === 'rename' && <Pencil size={14} className="shrink-0" />}
                  {tabLabels[tab]}
                </button>
              ))}

              <div className="flex-1" />

              {isAdmin && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                >
                  <Trash2 size={14} className="shrink-0" />
                  {t('group.delete_group')}
                </button>
              )}
              <button
                onClick={handleLeaveClick}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition"
              >
                <LogOut size={14} className="shrink-0" />
                {t('group.leave')}
              </button>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-primary-light shrink-0">
                <span className="text-sm font-semibold text-text-main">{tabLabels[activeTab]}</span>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                {activeTab === 'members' && (
                  <div className="flex flex-col gap-1">
                    {[...selectedChat.participants]
                      .sort((a, b) => {
                        if (a.userId === currentUser.id) {
                          return -1;
                        }
                        if (b.userId === currentUser.id) {
                          return 1;
                        }
                        if (a.role === 'ADMIN' && b.role !== 'ADMIN') {
                          return -1;
                        }
                        if (b.role === 'ADMIN' && a.role !== 'ADMIN') {
                          return 1;
                        }
                        return 0;
                      })
                      .map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-bg-chat transition"
                        >
                          <Avatar user={participant.user} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-text-main truncate">{participant.user.name}</p>
                            <p className="text-xs text-text-muted">
                              {participant.userId === currentUser.id ? `${t('group.you')} · ` : ''}
                              {participant.role === 'ADMIN' ? t('group.admin') : t('group.member')}
                            </p>
                          </div>
                          {participant.userId !== currentUser.id && isAdmin && (
                            <div className="flex gap-1.5 shrink-0">
                              <button
                                onClick={() =>
                                  handleUpdateRole(
                                    participant.userId,
                                    participant.role === 'ADMIN' ? 'MEMBER' : 'ADMIN'
                                  )
                                }
                                className="whitespace-nowrap rounded-md bg-primary-light px-2 py-1 text-xs text-primary hover:bg-primary hover:text-white transition"
                              >
                                {participant.role === 'ADMIN' ? t('group.to_member') : t('group.to_admin')}
                              </button>
                              <button
                                onClick={() => handleRemoveMember(participant.userId)}
                                className="whitespace-nowrap rounded-md bg-red-50 px-2 py-1 text-xs text-red-500 hover:bg-red-500 hover:text-white transition"
                              >
                                {t('group.remove')}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}

                {activeTab === 'add' && (
                  <div className="flex flex-col gap-3">
                    <SearchUserInput onSelectUser={handleAddMember} />
                    {addSuccess && (
                      <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">
                        {t('group.member_added')}
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'rename' && (
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="w-full rounded-lg border border-primary-light bg-bg-chat px-4 py-2.5 text-sm text-text-main outline-none focus:border-primary transition"
                      placeholder={t('group.name_placeholder')}
                    />
                    <button
                      onClick={handleRenameGroup}
                      className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition"
                    >
                      {t('group.rename_save')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmModal
          title={t('group.delete_group_confirm')}
          message={t('group.delete_group_message')}
          confirmLabel={t('common.delete')}
          onConfirm={() => {
            handleDeleteChat();
            setShowDeleteConfirm(false);
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {showLeaveConfirm && (
        <ConfirmModal
          title={t('group.leave_confirm')}
          message={t('group.leave_message')}
          confirmLabel={t('group.leave')}
          onConfirm={() => {
            handleLeaveGroup();
            setShowLeaveConfirm(false);
          }}
          onCancel={() => setShowLeaveConfirm(false)}
        />
      )}

      {showLastAdminWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-bg-message-in rounded-2xl border border-primary-light shadow-sm w-[400px] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-primary-light flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-main">{t('group.choose_admin')}</p>
                <p className="text-xs text-text-muted mt-0.5">{t('group.choose_admin_subtitle')}</p>
              </div>
              <button
                onClick={() => setShowLastAdminWarning(false)}
                className="text-text-muted hover:text-text-main transition p-1 rounded-lg hover:bg-primary-light"
              >
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-64 p-3 flex flex-col gap-1">
              {selectedChat.participants
                .filter((p) => p.userId !== currentUser.id)
                .map((participant) => (
                  <button
                    key={participant.id}
                    onClick={async () => {
                      await handleUpdateRole(participant.userId, 'ADMIN');
                      setShowLastAdminWarning(false);
                      setShowLeaveConfirm(true);
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary-light transition text-left w-full"
                  >
                    <Avatar user={participant.user} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-main truncate">{participant.user.name}</p>
                      <p className="text-xs text-text-muted">
                        {participant.role === 'ADMIN' ? t('group.admin') : t('group.member')}
                      </p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default GroupDropdown;
