import { createUser, getUserByEmail } from '../api/usersApi';
import type { User } from '../types/users.tsx';
import confetti from 'canvas-confetti';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type RegisterPageProps = {
  onAuthSuccess: (user: User) => void;
};

function RegisterPage({ onAuthSuccess }: RegisterPageProps) {
  const { t } = useTranslation();
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
    <div className="flex min-h-screen bg-bg-app relative">
      <div className="absolute inset-0 bg-[url(/login-bg.jpg)] bg-[length:auto_115%] bg-[center_100%] lg:hidden" />
      <div
        className="absolute inset-0 lg:hidden"
        style={{
          background: 'linear-gradient(to bottom, transparent 15%, var(--color-bg-app) 60%)'
        }}
      />
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
      <div className="relative z-10 flex flex-1 flex-col items-center justify-end lg:justify-center p-6 sm:p-8">
        <div className="w-full max-w-sm ">
          <h1 className="text-2xl font-semibold text-text-main mb-2">
            {isLoginMode ? t('auth.welcome_back') : t('auth.create_account')}
          </h1>
          <p className="text-sm text-text-muted mb-8">
            {isLoginMode ? t('auth.sign_in_subtitle') : t('auth.register_subtitle')}
          </p>

          <div className="flex flex-col gap-4">
            {!isLoginMode && (
              <div>
                <label className="text-xs text-text-muted mb-1 block">{t('auth.name')}</label>
                <input
                  className="w-full rounded-lg border border-primary-border bg-bg-message-in px-4 py-2.5 text-sm text-text-main outline-none focus:border-primary transition placeholder:text-text-muted"
                  placeholder={t('auth.your_name')}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            )}

            <div>
              <label className="text-xs text-text-muted mb-1 block">{t('auth.email')}</label>
              <input
                className="w-full rounded-lg border border-primary-border bg-bg-message-in px-4 py-2.5 text-sm text-text-main outline-none focus:border-primary transition placeholder:text-text-muted"
                placeholder={t('auth.your_email')}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {status === 'error' && <p className="text-red-500 text-xs">{t('auth.error')}</p>}

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
                t('auth.sign_in')
              ) : (
                t('auth.register')
              )}
            </button>

            <button
              className="text-sm text-primary hover:text-primary-dark transition text-center cursor-pointer"
              onClick={() => {
                setIsLoginMode((value) => !value);
                setStatus('idle');
              }}
            >
              {isLoginMode ? t('auth.no_account') : t('auth.already_registered')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
