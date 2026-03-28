import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function SignupPage() {
  const { user, ready, signup } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
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
    const result = await signup(email, password, confirm);
    if (result.ok) {
      navigate('/', { replace: true });
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
        <h1 className="text-2xl font-bold text-center mb-1">Create account</h1>
        <p className="text-schedule-textMuted text-sm text-center mb-8">Manager schedule builder</p>

        <form onSubmit={handleSubmit} className="bg-schedule-card border border-schedule-border rounded-xl p-6 shadow-sm space-y-4">
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
          )}
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-schedule-text mb-1">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-schedule-border bg-white focus:outline-none focus:ring-2 focus:ring-schedule-accent/40"
              required
            />
          </div>
          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-schedule-text mb-1">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-schedule-border bg-white focus:outline-none focus:ring-2 focus:ring-schedule-accent/40"
              required
              minLength={6}
            />
            <p className="text-xs text-schedule-textMuted mt-1">At least 6 characters</p>
          </div>
          <div>
            <label htmlFor="signup-confirm" className="block text-sm font-medium text-schedule-text mb-1">
              Confirm password
            </label>
            <input
              id="signup-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-schedule-border bg-white focus:outline-none focus:ring-2 focus:ring-schedule-accent/40"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-schedule-accent hover:bg-schedule-accentHover text-white font-medium transition-colors"
          >
            Sign up
          </button>
        </form>

        <p className="text-center text-sm text-schedule-textMuted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-schedule-accent font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
