import { useState } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { BRAND_LOGO_ALT, BRAND_SITE_URL, ECHO_FIVES_LOGO_SRC } from '../brand';

export default function LoginPage() {
  const { user, ready, login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/home';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');

  if (!ready) {
    return (
      <div className="min-h-screen bg-schedule-bg flex items-center justify-center text-schedule-textMuted">
        Loading…
      </div>
    );
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (mode === 'login') {
      const result = await login(email, password);
      if (result.ok) {
        navigate(from === '/login' || from === '/' ? '/home' : from, { replace: true });
      } else {
        setError(result.error);
      }
      return;
    }

    const result = await resetPassword(email, password, confirm);
    if (result.ok) {
      setMode('login');
      setConfirm('');
      setMessage('Password reset successful. You can log in now.');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-schedule-bg flex flex-col items-center justify-center px-4 py-12 text-schedule-text">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <a href={BRAND_SITE_URL} target="_blank" rel="noopener noreferrer">
            <img src={ECHO_FIVES_LOGO_SRC} alt={BRAND_LOGO_ALT} className="h-12" />
          </a>
        </div>
        <h1 className="text-2xl font-bold text-center mb-1">{mode === 'login' ? 'Sign in' : 'Reset password'}</h1>
        <p className="text-schedule-textMuted text-sm text-center mb-8">Manager schedule builder</p>

        <form onSubmit={handleSubmit} className="bg-schedule-card border border-schedule-border rounded-xl p-6 shadow-sm space-y-4">
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
          )}
          {message && (
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{message}</div>
          )}
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-schedule-text mb-1">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-schedule-border bg-white focus:outline-none focus:ring-2 focus:ring-schedule-accent/40"
              required
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-schedule-text mb-1">
              {mode === 'login' ? 'Password' : 'New password'}
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-schedule-border bg-white focus:outline-none focus:ring-2 focus:ring-schedule-accent/40"
              required
            />
          </div>
          {mode === 'reset' ? (
            <div>
              <label htmlFor="login-confirm" className="block text-sm font-medium text-schedule-text mb-1">
                Confirm new password
              </label>
              <input
                id="login-confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-schedule-border bg-white focus:outline-none focus:ring-2 focus:ring-schedule-accent/40"
                required
              />
            </div>
          ) : null}
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-schedule-accent hover:bg-schedule-accentHover text-white font-medium transition-colors"
          >
            {mode === 'login' ? 'Log in' : 'Reset password'}
          </button>
        </form>

        <div className="text-center text-sm text-schedule-textMuted mt-6 space-y-2">
          <p>
            No account?{' '}
            <Link to="/signup" className="text-schedule-accent font-medium hover:underline">
              Sign up
            </Link>
          </p>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'reset' : 'login');
              setError('');
              setMessage('');
              setPassword('');
              setConfirm('');
            }}
            className="text-schedule-accent font-medium hover:underline"
          >
            {mode === 'login' ? 'Forgot password?' : 'Back to sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
