import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './AuthScreens.css'
import { useAuth } from '../context/AuthContext'
import { apiErrorMessage } from '../api/client'

export default function LoginScreen() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(email, password)
      const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/'
      navigate(from, { replace: true })
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not log in.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <Link to="/" className="auth-screen__back">
        ‹ Back to map
      </Link>
      <h1 className="auth-screen__title">Welcome back</h1>
      <p className="auth-screen__subtitle">Log in with your NYU email to like dishes and leave reviews.</p>

      <form className="auth-form" onSubmit={submit}>
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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="auth-form__error">{error}</p>}
        <button className="auth-form__submit" disabled={busy}>
          Log in
        </button>
      </form>

      <p className="auth-screen__footer">
        New here?{' '}
        <Link to="/signup" className="auth-screen__link">
          Create an account
        </Link>
      </p>
    </div>
  )
}
