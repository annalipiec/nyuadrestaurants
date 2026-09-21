import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../api';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', class_year: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await signup({ ...form, class_year: form.class_year ? Number(form.class_year) : null });
      navigate('/', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not create account.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="text-2xl font-bold text-nyuad-950">Join NYUAD Eats</h1>
      <p className="mt-1 text-sm text-nyuad-600">
        Only @nyu.edu emails can sign up — this keeps reviews verified and trustworthy.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          required
          placeholder="Full name"
          value={form.name}
          onChange={update('name')}
          className="w-full rounded-lg border border-nyuad-200 px-3 py-2 text-sm outline-none focus:border-nyuad-500"
        />
        <input
          type="email"
          required
          placeholder="you@nyu.edu"
          value={form.email}
          onChange={update('email')}
          className="w-full rounded-lg border border-nyuad-200 px-3 py-2 text-sm outline-none focus:border-nyuad-500"
        />
        <input
          type="number"
          placeholder="Class year (optional, e.g. 2027)"
          value={form.class_year}
          onChange={update('class_year')}
          className="w-full rounded-lg border border-nyuad-200 px-3 py-2 text-sm outline-none focus:border-nyuad-500"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Password (min 8 characters)"
          value={form.password}
          onChange={update('password')}
          className="w-full rounded-lg border border-nyuad-200 px-3 py-2 text-sm outline-none focus:border-nyuad-500"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={busy}
          className="w-full rounded-lg bg-nyuad-700 px-4 py-2 text-sm font-medium text-white hover:bg-nyuad-800 disabled:opacity-60"
        >
          Create account
        </button>
      </form>

      <p className="mt-4 text-sm text-nyuad-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-nyuad-700 underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
