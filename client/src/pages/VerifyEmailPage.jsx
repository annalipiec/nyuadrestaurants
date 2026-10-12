import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../api';

export default function VerifyEmailPage() {
  const { user, loading, verifyEmail, resendVerification } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [code, setCode] = useState(location.state?.devCode || '');
  const [devCode, setDevCode] = useState(location.state?.devCode || null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.email_verified) return <Navigate to="/" replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setInfo('');
    try {
      await verifyEmail(code.trim());
      navigate('/', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not verify that code.'));
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setBusy(true);
    setError('');
    setInfo('');
    try {
      const newCode = await resendVerification();
      setDevCode(newCode);
      setCode(newCode);
      setInfo('A new code has been issued.');
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not resend a code.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="text-2xl font-bold text-nyuad-950">Verify your email</h1>
      <p className="mt-1 text-sm text-nyuad-600">
        Enter the 6-digit code sent to <span className="font-medium">{user.email}</span> to post
        reviews, dishes, and new restaurants.
      </p>

      <div className="mt-4 rounded-lg border border-dashed border-nyuad-300 bg-nyuad-50 p-3 text-sm text-nyuad-700">
        <p className="font-medium">Dev mode: no email provider is configured yet.</p>
        <p className="mt-1">
          Your verification code is{' '}
          <span className="font-mono text-base font-bold text-nyuad-900">{devCode || '••••••'}</span>.
          In production this would be emailed instead of shown here.
        </p>
      </div>

      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          required
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full rounded-lg border border-nyuad-200 px-3 py-2 text-center text-lg tracking-[0.3em] outline-none focus:border-nyuad-500"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-emerald-700">{info}</p>}
        <button
          disabled={busy}
          className="w-full rounded-lg bg-nyuad-700 px-4 py-2 text-sm font-medium text-white hover:bg-nyuad-800 disabled:opacity-60"
        >
          Verify
        </button>
      </form>

      <button
        onClick={resend}
        disabled={busy}
        className="mt-3 text-sm font-medium text-nyuad-700 underline disabled:opacity-60"
      >
        Didn't get it? Send a new code
      </button>
    </div>
  );
}
