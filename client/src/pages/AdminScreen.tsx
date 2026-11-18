import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import './AuthScreens.css'
import './AdminScreen.css'
import { useAuth } from '../context/AuthContext'
import { approveRestaurant, listPendingRestaurants, rejectRestaurant } from '../api/admin'
import { apiErrorMessage } from '../api/client'
import type { PendingRestaurant } from '../api/types'

/** AD Bites team only: approve or reject restaurants students have suggested. */
export default function AdminScreen() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [pending, setPending] = useState<PendingRestaurant[] | null>(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user?.is_admin) return
    listPendingRestaurants()
      .then(setPending)
      .catch((err) => setError(apiErrorMessage(err, 'Could not load suggestions.')))
  }, [user?.is_admin])

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!user.is_admin) return <Navigate to="/profile" replace />

  const goBack = () => (location.key === 'default' ? navigate('/profile') : navigate(-1))

  async function act(r: PendingRestaurant, action: 'approve' | 'reject') {
    if (action === 'reject' && !window.confirm(`Reject and delete “${r.name}”? This can't be undone.`)) return
    setBusyId(r.id)
    setError('')
    setMessage('')
    try {
      if (action === 'approve') await approveRestaurant(r.id)
      else await rejectRestaurant(r.id)
      setPending((list) => (list ?? []).filter((x) => x.id !== r.id))
      setMessage(action === 'approve' ? `${r.name} is now live on the map.` : `${r.name} was rejected.`)
    } catch (err) {
      setError(apiErrorMessage(err, 'That didn’t work. Please try again.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="auth-screen admin-screen">
      <button type="button" className="auth-screen__back admin-screen__back" onClick={goBack}>
        ‹ Back
      </button>
      <h1 className="auth-screen__title">Review suggestions</h1>
      <p className="auth-screen__subtitle">
        Restaurants students have suggested. Check the details and the pin before approving — approved places
        appear on everyone's map.
      </p>

      {message && <p className="auth-form__info admin-screen__message">{message}</p>}
      {error && <p className="auth-form__error admin-screen__message">{error}</p>}
      {!pending && !error && <p className="admin-screen__empty">Loading…</p>}
      {pending && pending.length === 0 && <p className="admin-screen__empty">No suggestions waiting. 🎉</p>}

      {pending?.map((r) => (
        <article key={r.id} className="admin-card">
          <p className="admin-card__name">{r.name}</p>
          <p className="admin-card__meta">
            {r.cuisine} · {r.avg_meal_price_aed} AED per person ({r.price_tier.label})
          </p>
          <dl className="admin-card__details">
            <dt>Getting there</dt>
            <dd>{r.getting_there_note || `Nearest stop: ${r.nearest_stop_name ?? '—'}`}</dd>
            {r.happy_hour_info && (
              <>
                <dt>Deals</dt>
                <dd>{r.happy_hour_info}</dd>
              </>
            )}
            <dt>Suggested by</dt>
            <dd>
              {r.submitted_by_name ?? 'Deleted account'}
              {r.submitted_by_email ? ` (${r.submitted_by_email})` : ''}
            </dd>
          </dl>
          <a
            className="admin-card__map-link"
            href={`https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lng}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Check the pin on Google Maps ↗
          </a>
          <div className="admin-card__actions">
            <button
              type="button"
              className="auth-form__submit admin-card__approve"
              disabled={busyId === r.id}
              onClick={() => act(r, 'approve')}
            >
              Approve
            </button>
            <button
              type="button"
              className="admin-card__reject"
              disabled={busyId === r.id}
              onClick={() => act(r, 'reject')}
            >
              Reject
            </button>
          </div>
        </article>
      ))}

      <p className="admin-screen__footer">
        Want to add one yourself?{' '}
        <Link to="/suggest" className="auth-screen__link">
          Add a restaurant
        </Link>{' '}
        — yours go live straight away.
      </p>
    </div>
  )
}
