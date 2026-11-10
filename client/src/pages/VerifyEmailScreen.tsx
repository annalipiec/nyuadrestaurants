import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import './AuthScreens.css'
import { useAuth } from '../context/AuthContext'
import { apiErrorMessage } from '../api/client'

export default function VerifyEmailScreen() {
  const { user, loading, verifyEmail, resendVerification } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const initialCode = (location.state as { devCode?: string } | null)?.devCode || ''
  const [code, setCode] = useState(initialCode)
  const [devCode, setDevCode] = useState<string | null>(initialCode || null)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.email_verified) return <Navigate to="/" replace />

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setInfo('')
    try {
      await verifyEmail(code.trim())
      navigate('/', { replace: true })
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not verify that code.'))
    } finally {
      setBusy(false)
    }
  }

  async function resend() {
    setBusy(true)
    setError('')
    setInfo('')
    try {
      const newCode = await resendVerification()
      setDevCode(newCode)
      setCode(newCode)
      setInfo('A new code has been issued.')
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not resend a code.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <h1 className="auth-screen__title">Verify your email</h1>
      <p className="auth-screen__subtitle">
        Enter the 6-digit code sent to <strong>{user.email}</strong> to like dishes, leave reviews, and
        add restaurants.
      </p>

      <p className="auth-screen__dev-note">
        Dev mode: no email provider is configured yet, so your code is shown here instead of emailed —{' '}
        <span className="auth-screen__dev-code">{devCode || '••••••'}</span>
      </p>

      <form className="auth-form" onSubmit={submit}>
        <input
          className="auth-form__input auth-form__code-input"
          required
          inputMode="numeric"
          maxLength={6}
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        {error && <p className="auth-form__error">{error}</p>}
        {info && <p className="auth-form__info">{info}</p>}
        <button className="auth-form__submit" disabled={busy}>
          Verify
        </button>
      </form>

      <button type="button" className="auth-screen__link-button" onClick={resend} disabled={busy}>
        Didn't get it? Send a new code
      </button>
    </div>
  )
}
