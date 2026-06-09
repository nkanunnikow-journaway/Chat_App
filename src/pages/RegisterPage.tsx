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
        user = await createUser({
          name,
          email
        });
      }

      setStatus('success');

      await new Promise((resolve) => setTimeout(resolve, 1000));

      confetti({
        particleCount: 150,
        spread: 60
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      onAuthSuccess(user);
    } catch (error) {
      console.error('Authentication failed', error);
      setStatus('error');
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-8">
      <h1 className="text-4xl font-bold">{isLoginMode ? 'Sign in' : 'Sign up'}</h1>
      {!isLoginMode && (
        <input
          className="rounded border px-4 py-2"
          placeholder="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      )}
      <input
        className="rounded border px-4 py-2"
        placeholder="E-Mail"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      {status === 'error' && <p className="text-red-500">Something went wrong. Please try again.</p>}
      <button
        className="flex h-12 w-36 items-center justify-center rounded-lg bg-indigo-600 text-sm text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
        onClick={handleSubmit}
        disabled={status === 'loading' || status === 'success'}
      >
        <span className="flex items-center gap-1">
          {status === 'loading' || status === 'success' ? (
            <>
              <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.3s]" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.15s]" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" />
            </>
          ) : isLoginMode ? (
            'Sign in'
          ) : (
            'Sign up'
          )}
        </span>
      </button>
      <button
        className="text-indigo-600 underline"
        onClick={() => {
          setIsLoginMode((value) => !value);
          setStatus('idle');
        }}
      >
        {isLoginMode ? 'Not a member? Create new account' : 'Already have an account? Sign in'}
      </button>
    </div>
  );
}

export default RegisterPage;
