import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './AuthScreens.css'
import { useAuth } from '../context/AuthContext'
import { apiErrorMessage } from '../api/client'

export default function SignupScreen() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = await signup({ name, email, password })
      navigate('/verify-email', { replace: true, state: { devCode: data.dev_verification_code } })
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not create account.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <Link to="/" className="auth-screen__back">
        ‹ Back to map
      </Link>
      <h1 className="auth-screen__title">Join NYUAD Eats</h1>
      <p className="auth-screen__subtitle">
        Only @nyu.edu emails can sign up — this keeps reviews and likes verified and trustworthy.
      </p>

      <form className="auth-form" onSubmit={submit}>
        <input
          className="auth-form__input"
          required
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="auth-form__input"
          type="email"
          required
          placeholder="you@nyu.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="auth-form__input"
          type="password"
          required
          minLength={8}
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="auth-form__error">{error}</p>}
        <button className="auth-form__submit" disabled={busy}>
          Create account
        </button>
      </form>

      <p className="auth-screen__footer">
        Already have an account?{' '}
        <Link to="/login" className="auth-screen__link">
          Log in
        </Link>
      </p>
    </div>
  )
}
