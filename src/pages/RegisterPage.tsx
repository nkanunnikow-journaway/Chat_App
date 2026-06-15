import { createUser, getUserByEmail } from '../api/usersApi';
import type { User } from '../types/users.tsx';
import confetti from 'canvas-confetti';
import { useState } from 'react';

type RegisterPageProps = {
  onAuthSuccess: (user: User) => void;
};

function RegisterPage({ onAuthSuccess }: RegisterPageProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  async function handleSubmit() {
    if (status === 'loading' || status === 'success') {
      return;
    }

    try {
      setStatus('loading');

      let user: User;

      if (isLoginMode) {
        user = await getUserByEmail(email);
      } else {
        user = await createUser({ name, email });
      }

      setStatus('success');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      confetti({ particleCount: 150, spread: 60 });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onAuthSuccess(user);
    } catch (error) {
      console.error('Authentication failed', error);
      setStatus('error');
    }
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  }

  return (
    <div className="flex min-h-screen bg-bg-app">
      <div className="hidden lg:block flex-1 relative">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/login-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, transparent 60%, var(--color-bg-app) 100%)'
          }}
        />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-text-main mb-2">
            {isLoginMode ? 'Willkommen zurück' : 'Konto erstellen'}
          </h1>
          <p className="text-sm text-text-muted mb-8">
            {isLoginMode ? 'Melde dich mit deiner E-Mail an.' : 'Erstelle ein neues Konto um loszulegen.'}
          </p>

          <div className="flex flex-col gap-4">
            {!isLoginMode && (
              <div>
                <label className="text-xs text-text-muted mb-1 block">Name</label>
                <input
                  className="w-full rounded-lg border border-primary-border bg-bg-message-in px-4 py-2.5 text-sm text-text-main outline-none focus:border-primary transition placeholder:text-text-muted"
                  placeholder="Dein Name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            )}

            <div>
              <label className="text-xs text-text-muted mb-1 block">E-Mail</label>
              <input
                className="w-full rounded-lg border border-primary-border bg-bg-message-in px-4 py-2.5 text-sm text-text-main outline-none focus:border-primary transition placeholder:text-text-muted"
                placeholder="deine@email.de"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {status === 'error' && (
              <p className="text-red-500 text-xs">Etwas ist schiefgelaufen. Bitte versuche es erneut.</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={status === 'loading' || status === 'success'}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition disabled:opacity-70"
            >
              {status === 'loading' || status === 'success' ? (
                <span className="flex items-center justify-center gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-white" />
                </span>
              ) : isLoginMode ? (
                'Anmelden'
              ) : (
                'Registrieren'
              )}
            </button>

            <button
              className="text-sm text-primary hover:text-primary-dark transition text-center cursor-pointer"
              onClick={() => {
                setIsLoginMode((value) => !value);
                setStatus('idle');
              }}
            >
              {isLoginMode ? 'Noch kein Konto? Jetzt registrieren' : 'Bereits registriert? Anmelden'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
