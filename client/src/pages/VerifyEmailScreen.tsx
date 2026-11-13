import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import './AuthScreens.css'
import { useAuth } from '../context/AuthContext'
import { apiErrorMessage } from '../api/client'

export default function VerifyEmailScreen() {
  const { user, loading, verifyEmail, resendVerification } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const navState = location.state as { devCode?: string; emailFailed?: boolean } | null
  const initialCode = navState?.devCode || ''
  const [code, setCode] = useState(initialCode)
  const [devCode, setDevCode] = useState<string | null>(initialCode || null)
  const [error, setError] = useState(
    navState?.emailFailed ? "We couldn't send your code. Tap “Send a new code” below to try again." : ''
  )
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
      if (newCode) {
        setDevCode(newCode)
        setCode(newCode)
        setInfo('A new code has been issued.')
      } else {
        setCode('')
        setInfo(`We sent a new code to ${user!.email}. Check your spam folder if it isn't there.`)
      }
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
        Enter the 6-digit code sent to <strong>{user.email}</strong> to leave reviews and add
        restaurants.
      </p>

      {devCode && (
        <p className="auth-screen__dev-note">
          Dev mode: no email provider is configured, so your code is shown here instead of emailed —{' '}
          <span className="auth-screen__dev-code">{devCode}</span>
        </p>
      )}

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
