import { uploadProfileImage, deleteProfileImage, updateUser } from '../api/usersApi.tsx';
import Avatar from '../components/ui/Avatar.tsx';
import { User } from '../types/users.tsx';
import { isValidEmail, isValidName } from '../utils/validation.tsx';
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
      setError('Profil konnte nicht gespeichert/aktualisiert werden.');
    } finally {
      setIsLoadingProfile(false);
    }
  }
  const hasChanges = name !== currentUser.name || email !== currentUser.email;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100 text-gray-900">
      <header className="flex items-center gap-4 border-b border-gray-200 bg-white px-6 py-4 shrink-0">
        <button
          onClick={onBack}
          className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold hover:bg-gray-200 transition"
        >
          ← Zurück
        </button>
        <h1 className="text-xl font-bold">Mein Profil</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-lg mx-auto flex flex-col gap-8">
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Profilbild</h2>
            <div className="flex items-center gap-6">
              <Avatar user={currentUser} size="lg" overrideUrl={previewUrl} />
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoadingImage}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                >
                  {isLoadingImage ? 'Wird hochgeladen...' : 'Bild hochladen'}
                </button>
                {currentUser.profileImageUrl && (
                  <button
                    onClick={handleDeleteImage}
                    className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 transition"
                  >
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
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Profil bearbeiten</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-indigo-500"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                onClick={handleUpdateProfile}
                disabled={!hasChanges || isLoadingProfile}
                className={`rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${
                  hasChanges && !isLoadingProfile
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-indigo-300 cursor-not-allowed'
                }`}
              >
                {isLoadingProfile ? 'Wird gespeichert...' : 'Speichern'}
              </button>
              {success && <p className="text-green-500 text-sm text-center">Profil erfolgreich gespeichert!</p>}
              <button
                onClick={onBack}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
              >
                Abbrechen
              </button>
            </div>
          </section>
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-red-100">
            <h2 className="text-lg font-semibold mb-4 text-red-500">Gefahrenzone</h2>
            <p className="text-sm text-gray-500 mb-4">
              Wenn du deinen Account löschst, werden alle deine Daten unwiderruflich gelöscht.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white hover:bg-red-600 transition"
            >
              Account löschen
            </button>
            {showDeleteConfirm && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 flex flex-col gap-3">
                <p className="text-sm text-red-600 font-semibold">
                  Bist du sicher? Diese Aktion kann nicht rückgängig gemacht werden.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={onDeleteAccount}
                    className="flex-1 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition"
                  >
                    Ja, Account löschen
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
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
