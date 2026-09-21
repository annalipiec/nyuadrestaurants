import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login({ email, password });
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not log in.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="text-2xl font-bold text-nyuad-950">Welcome back</h1>
      <p className="mt-1 text-sm text-nyuad-600">Log in with your NYU email to review and add spots.</p>

      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          type="email"
          required
          placeholder="you@nyu.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-nyuad-200 px-3 py-2 text-sm outline-none focus:border-nyuad-500"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-nyuad-200 px-3 py-2 text-sm outline-none focus:border-nyuad-500"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={busy}
          className="w-full rounded-lg bg-nyuad-700 px-4 py-2 text-sm font-medium text-white hover:bg-nyuad-800 disabled:opacity-60"
        >
          Log in
        </button>
      </form>

      <p className="mt-4 text-sm text-nyuad-600">
        New here?{' '}
        <Link to="/signup" className="font-medium text-nyuad-700 underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
