import { useState, type FormEvent } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import type { AuthUser } from '../../../shared/types';
import { loginAccount, registerAccount } from '../../services/api';

interface AuthViewProps {
  initialMode?: 'login' | 'register';
  onAuthenticated: (user: AuthUser) => void;
  onBackToLanding: () => void;
  onViewSampleReport: () => void;
}

export function AuthView({
  initialMode = 'login',
  onAuthenticated,
  onBackToLanding,
  onViewSampleReport,
}: AuthViewProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (mode === 'register') {
      if (name.trim().length < 2) {
        setError('Please enter your name (at least 2 characters).');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }
    } else if (!password) {
      setError('Please enter your password.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const result =
        mode === 'register'
          ? await registerAccount({ name: name.trim(), email: trimmedEmail, password })
          : await loginAccount({ email: trimmedEmail, password });
      onAuthenticated(result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col justify-between px-4 py-8">
      <div className="mx-auto w-full max-w-md flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToLanding}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to StartupLens AI
        </button>
        <button
          type="button"
          onClick={onViewSampleReport}
          className="text-xs font-medium text-violet-300 hover:text-violet-200 transition-colors"
        >
          Sample Report
        </button>
      </div>

      <div className="mx-auto w-full max-w-md my-8">
        <div className="rounded-xl border border-slate-800 bg-[#111827] p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-300">
              <Lock className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <h1 className="font-display text-2xl font-bold text-white">
              {mode === 'login' ? 'Sign in to StartupLens AI' : 'Create your founder account'}
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your startup analyses and mentor conversations are scoped privately to your account.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-lg border border-slate-800 bg-[#0B1120] p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`rounded-md py-2 text-xs font-medium transition-colors ${
                mode === 'login' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`rounded-md py-2 text-xs font-medium transition-colors ${
                mode === 'register'
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-200"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" strokeWidth={1.75} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label htmlFor="auth-name" className="text-xs font-medium text-slate-300">
                  Full Name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alvina Rahim"
                  className="w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="auth-email" className="text-xs font-medium text-slate-300">
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@example.com"
                className="w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="auth-password" className="text-xs font-medium text-slate-300">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Minimum 8 characters' : 'Enter your password'}
                className="w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors disabled:opacity-50"
            >
              {isSubmitting
                ? mode === 'login'
                  ? 'Signing in...'
                  : 'Creating account...'
                : mode === 'login'
                ? 'Sign In'
                : 'Create Account'}
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </form>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500">
        Passwords are salted and hashed with scrypt; never stored in plain text.
      </div>
    </div>
  );
}
