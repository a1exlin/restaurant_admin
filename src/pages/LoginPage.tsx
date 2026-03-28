import { useState } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function LoginPage() {
  const { user, ready, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!ready) {
    return (
      <div className="min-h-screen bg-schedule-bg flex items-center justify-center text-schedule-textMuted">
        Loading…
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.ok) {
      navigate(from === '/login' ? '/' : from, { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-schedule-bg flex flex-col items-center justify-center px-4 py-12 text-schedule-text">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <a href="https://echofives.com" target="_blank" rel="noopener noreferrer">
            <img src="/logo.png" alt="ECHO FIVES" className="h-12" />
          </a>
        </div>
        <h1 className="text-2xl font-bold text-center mb-1">Sign in</h1>
        <p className="text-schedule-textMuted text-sm text-center mb-8">Manager schedule builder</p>

        <form onSubmit={handleSubmit} className="bg-schedule-card border border-schedule-border rounded-xl p-6 shadow-sm space-y-4">
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
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
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-schedule-border bg-white focus:outline-none focus:ring-2 focus:ring-schedule-accent/40"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-schedule-accent hover:bg-schedule-accentHover text-white font-medium transition-colors"
          >
            Log in
          </button>
        </form>

        <p className="text-center text-sm text-schedule-textMuted mt-6">
          No account?{' '}
          <Link to="/signup" className="text-schedule-accent font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
