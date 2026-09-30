import { useState } from 'react';
import type { FormEvent } from 'react';

import { login, saveToken, signup } from '../../api/auth';
import './Auth.css';

interface AuthProps {
  onAuthenticated: (email: string) => void;
}

type AuthMode = 'login' | 'signup';

export function Auth({ onAuthenticated }: AuthProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === 'login';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');
    setIsSubmitting(true);

    try {
      const response = isLogin
        ? await login({ email, password })
        : await signup({ email, password });

      saveToken(response.token);
      onAuthenticated(response.user.email);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Authentication failed.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModeChange = () => {
    setMode(isLogin ? 'signup' : 'login');
    setError('');
    setPassword('');
  };

  return (
    <section className="auth">
      <div className="auth__header">
        <p className="auth__eyebrow">Personal finance</p>
        <h1>{isLogin ? 'Welcome back' : 'Create your account'}</h1>
        <p>
          {isLogin
            ? 'Log in to manage your expenses.'
            : 'Sign up to start tracking your expenses.'}
        </p>
      </div>

      <form className="auth__form" onSubmit={handleSubmit}>
        <div className="auth__field">
          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
            required
          />
        </div>

        <div className="auth__field">
          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            minLength={6}
            required
          />
        </div>

        {error && (
          <p className="auth__error" role="alert">
            {error}
          </p>
        )}

        <button
          className="auth__submit"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Please wait...'
            : isLogin
              ? 'Log In'
              : 'Sign Up'}
        </button>
      </form>

      <button className="auth__switch" type="button" onClick={handleModeChange}>
        {isLogin
          ? "Don't have an account? Sign up"
          : 'Already have an account? Log in'}
      </button>
    </section>
  );
}