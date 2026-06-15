import { uploadProfileImage, deleteProfileImage, updateUser } from '../api/usersApi.tsx';
import Avatar from '../components/ui/Avatar.tsx';
import { User } from '../types/users.tsx';
import { isValidEmail, isValidName } from '../utils/validation.tsx';
import { Upload, Trash2, ArrowLeft } from 'lucide-react';
import { useRef, useState } from 'react';

type ProfilePageProps = {
  currentUser: User;
  onUserUpdate: (user: User) => void;
  onDeleteAccount: () => void;
  onBack: () => void;
};

function ProfilePage({ currentUser, onUserUpdate, onDeleteAccount, onBack }: ProfilePageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
      console.error('Profilbild konnte nicht hochgeladen werden', error);
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
      console.error('Profilbild konnte nicht gelöscht werden', error);
    }
  }

  async function handleUpdateProfile() {
    if (!isValidName(name)) {
      setError('Name muss mindestens 2 Zeichen lang sein.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Bitte gib eine gültige E-Mail-Adresse ein.');
      return;
    }
    setError(null);
    try {
      setIsLoadingProfile(true);
      const updatedUser = await updateUser(currentUser.id, { name, email });
      onUserUpdate(updatedUser);
      setSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      onBack();
    } catch (error) {
      console.error('Profil konnte nicht aktualisiert werden', error);
      setError('Profil konnte nicht gespeichert werden.');
    } finally {
      setIsLoadingProfile(false);
    }
  }

  const hasChanges = name !== currentUser.name || email !== currentUser.email;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg-app text-text-main">
      <header className="flex items-center gap-4  bg-bg-sidebar px-6 py-4 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-lg bg-primary-light px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition"
        >
          <ArrowLeft size={14} />
          Zurück
        </button>
        <h1 className="text-base font-semibold text-text-main">Mein Profil</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-lg mx-auto flex flex-col gap-6">
          <section className="bg-bg-message-in rounded-2xl p-6 border border-primary-border">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">Profilbild</h2>
            <div className="flex items-center gap-6">
              <Avatar user={currentUser} size="lg" overrideUrl={previewUrl} />
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoadingImage}
                  className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition disabled:opacity-50"
                >
                  <Upload size={14} />
                  {isLoadingImage ? 'Wird hochgeladen...' : 'Bild hochladen'}
                </button>
                {currentUser.profileImageUrl && (
                  <button
                    onClick={handleDeleteImage}
                    className=" flex items-center gap-1 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 transition"
                  >
                    <Trash2 size={14} />
                    Bild löschen
                  </button>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleUploadImage}
                />
              </div>
            </div>
          </section>

          <section className="bg-bg-message-in rounded-2xl p-6 border border-primary-border">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">Profil bearbeiten</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-text-muted mb-1 block">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-primary-border bg-bg-chat px-4 py-2.5 text-sm text-text-main outline-none focus:border-primary transition placeholder:text-text-muted"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-primary-border bg-bg-chat px-4 py-2.5 text-sm text-text-main outline-none focus:border-primary transition placeholder:text-text-muted"
                />
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button
                onClick={handleUpdateProfile}
                disabled={!hasChanges || isLoadingProfile}
                className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition ${
                  hasChanges && !isLoadingProfile
                    ? 'bg-primary hover:bg-primary-dark'
                    : 'bg-primary-mid opacity-50 cursor-not-allowed'
                }`}
              >
                {isLoadingProfile ? 'Wird gespeichert...' : 'Speichern'}
              </button>
              {success && <p className="text-green-500 text-xs text-center">Profil erfolgreich gespeichert!</p>}
              <button
                onClick={onBack}
                className="rounded-lg border border-primary-border px-4 py-2.5 text-sm font-semibold text-text-muted hover:bg-bg-sidebar transition"
              >
                Abbrechen
              </button>
            </div>
          </section>

          <section className="bg-bg-message-in rounded-2xl p-6 border border-red-200">
            <h2 className="text-sm font-semibold uppercase tracking-wide mb-2 text-red-500">Gefahrenzone</h2>
            <p className="text-xs text-text-muted mb-4">
              Wenn du deinen Account löschst, werden alle deine Daten unwiderruflich gelöscht.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition"
            >
              Account löschen
            </button>
            {showDeleteConfirm && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 flex flex-col gap-3">
                <p className="text-xs text-red-600 font-semibold">
                  Bist du sicher? Diese Aktion kann nicht rückgängig gemacht werden.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={onDeleteAccount}
                    className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition"
                  >
                    Ja, löschen
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 rounded-lg border border-primary-border px-4 py-2 text-sm font-semibold text-text-muted hover:bg-bg-sidebar transition"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
