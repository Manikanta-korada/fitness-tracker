import { useState } from 'react';
import { supabase } from '../lib/supabase';

function validatePassword(password) {
  const errors = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('At least one number');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('At least one special character');
  return errors;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordErrors = isSignUp ? validatePassword(password) : [];
  const passwordsMatch = password === confirmPassword;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (isSignUp) {
      if (passwordErrors.length > 0) {
        setError('Password does not meet requirements');
        return;
      }
      if (!passwordsMatch) {
        setError('Passwords do not match');
        return;
      }
    }

    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email to confirm your account.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">FitBot</h1>
          <p className="text-gray-500 mt-2">{isSignUp ? 'Create your account' : 'Welcome back'}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          {error && (
            <div role="alert" className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">{error}</div>
          )}
          {message && (
            <div role="status" className="bg-green-50 text-green-600 text-sm rounded-lg px-3 py-2 mb-4">{message}</div>
          )}

          <div className="mb-4">
            <label htmlFor="login-email" className="block text-sm text-gray-700 mb-1">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>

          <div className={isSignUp ? 'mb-3' : 'mb-6'}>
            <label htmlFor="login-password" className="block text-sm text-gray-700 mb-1">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              required
            />
            {isSignUp && password && passwordErrors.length > 0 && (
              <ul className="mt-2 space-y-0.5" aria-live="polite">
                {passwordErrors.map((err) => (
                  <li key={err} className="text-xs text-red-500">&bull; {err}</li>
                ))}
              </ul>
            )}
            {isSignUp && password && passwordErrors.length === 0 && (
              <p className="text-xs text-green-600 mt-1">Password meets all requirements</p>
            )}
          </div>

          {isSignUp && (
            <div className="mb-6">
              <label htmlFor="login-confirm-password" className="block text-sm text-gray-700 mb-1">Confirm Password</label>
              <input
                id="login-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                required
              />
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Log In')}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-indigo-600 font-medium">
              {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
