import { uploadProfileImage, deleteProfileImage, updateUser } from '../api/usersApi.tsx';
import Avatar from '../components/ui/Avatar.tsx';
import ConfirmModal from '../components/ui/ConfirmModal.tsx';
import { User } from '../types/users.tsx';
import { isValidEmail, isValidName } from '../utils/validation.tsx';
import { Upload, Trash2, ArrowLeft, MoreVertical, Pencil } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type ProfilePageProps = {
  currentUser: User;
  onUserUpdate: (user: User) => void;
  onDeleteAccount: () => void;
  onBack: () => void;
};

function ProfilePage({ currentUser, onUserUpdate, onDeleteAccount, onBack }: ProfilePageProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
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

  async function handleUploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    try {
      setIsLoadingImage(true);
      const updatedUser = await uploadProfileImage(currentUser.id, file);
      onUserUpdate(updatedUser);
    } catch (error) {
      console.error('Profile image upload failed', error);
      setPreviewUrl(null);
    } finally {
      setIsLoadingImage(false);
    }
  }

  async function handleDeleteImage() {
    try {
      const updatedUser = await deleteProfileImage(currentUser.id);
      onUserUpdate(updatedUser);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Profile image deletion failed', error);
    }
  }

  async function handleUpdateProfile() {
    if (!isValidName(name)) {
      setError(t('profile.error_name'));
      return;
    }
    if (!isValidEmail(email)) {
      setError(t('profile.error_email'));
      return;
    }
    setError(null);
    try {
      setIsLoadingProfile(true);
      const updatedUser = await updateUser(currentUser.id, { name, email });
      onUserUpdate(updatedUser);
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error('Profile update failed', error);
      setError(t('profile.error_save'));
    } finally {
      setIsLoadingProfile(false);
    }
  }

  function handleCancelEdit() {
    setName(currentUser.name);
    setEmail(currentUser.email);
    setError(null);
    setIsEditing(false);
  }

  function handleConfirmDeleteAccount() {
    onDeleteAccount();
    setShowDeleteConfirm(false);
  }

  const hasChanges = name !== currentUser.name || email !== currentUser.email;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg-app text-text-main">
      <header className="flex items-center gap-4 bg-bg-sidebar px-6 py-4 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-lg bg-primary-light px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition"
        >
          <ArrowLeft size={14} />
          {t('profile.back')}
        </button>
        <h1 className="text-base font-semibold text-text-main">{t('profile.title')}</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-bg-sidebar rounded-2xl border border-primary-light p-8 flex gap-8 relative">
            <div className="absolute top-6 right-6" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                title={t('profile.options')}
                className="p-2 rounded-lg text-text-muted hover:bg-primary-light hover:text-primary transition"
              >
                <MoreVertical size={18} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-primary-border bg-bg-message-in shadow-lg z-20 overflow-hidden">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-text-main hover:bg-primary-light transition"
                  >
                    <Pencil size={14} />
                    {t('profile.edit')}
                  </button>
                  <hr className="border-primary-border" />
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                  >
                    <Trash2 size={14} />
                    {t('profile.delete_account')}
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-3 shrink-0">
              <Avatar user={currentUser} size="lg" overrideUrl={previewUrl} />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoadingImage}
                className="flex items-center justify-center gap-1 w-28 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark transition disabled:opacity-50"
              >
                <Upload size={12} />
                {isLoadingImage ? t('profile.uploading') : t('profile.upload')}
              </button>
              {currentUser.profileImageUrl && (
                <button
                  onClick={handleDeleteImage}
                  className="flex items-center justify-center gap-1 w-28 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition"
                >
                  <Trash2 size={12} />
                  {t('profile.delete_image')}
                </button>
              )}
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleUploadImage} />
            </div>

            <div className="flex-1 flex flex-col gap-4 pr-8">
              {isEditing ? (
                <>
                  <div>
                    <label className="text-xs text-text-muted mb-1 block">{t('profile.name')}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-primary-border bg-bg-chat px-4 py-2.5 text-sm text-text-main outline-none focus:border-primary transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted mb-1 block">{t('profile.email')}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-primary-border bg-bg-chat px-4 py-2.5 text-sm text-text-main outline-none focus:border-primary transition"
                    />
                  </div>
                  {error && <p className="text-red-500 text-xs">{error}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={!hasChanges || isLoadingProfile}
                      className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition ${
                        hasChanges && !isLoadingProfile
                          ? 'bg-primary hover:bg-primary-dark'
                          : 'bg-primary-mid opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {isLoadingProfile ? t('profile.saving') : t('profile.save')}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 rounded-lg border border-primary-border px-4 py-2.5 text-sm font-semibold text-text-muted hover:bg-bg-sidebar transition"
                    >
                      {t('profile.cancel')}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-xs text-text-muted mb-1">{t('profile.name')}</p>
                    <p className="text-base font-semibold text-text-main">{currentUser.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-1">{t('profile.email')}</p>
                    <p className="text-base text-text-main">{currentUser.email}</p>
                  </div>
                  {success && <p className="text-green-500 text-xs">{t('profile.success')}</p>}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {showDeleteConfirm && (
        <ConfirmModal
          title={t('profile.delete_account_confirm')}
          message={t('profile.delete_account_message')}
          confirmLabel={t('profile.delete_confirm')}
          onConfirm={handleConfirmDeleteAccount}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}

export default ProfilePage;
