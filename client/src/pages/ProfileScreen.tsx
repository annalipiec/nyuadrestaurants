import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './ProfileScreen.css'
import { useAuth } from '../context/AuthContext'
import { initials } from '../utils/initials'
import { listMySuggestions } from '../api/restaurants'
import { listPendingRestaurants } from '../api/admin'
import type { MySuggestion } from '../api/types'

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const [mine, setMine] = useState<MySuggestion[]>([])
  const [pendingCount, setPendingCount] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return
    listMySuggestions()
      .then(setMine)
      .catch(() => setMine([]))
    if (user.is_admin) {
      listPendingRestaurants()
        .then((list) => setPendingCount(list.length))
        .catch(() => setPendingCount(null))
    }
  }, [user])

  if (!user) {
    return (
      <div className="profile-screen">
        <h1 className="profile-screen__title">Profile</h1>
        <div className="profile-screen__signed-out">
          <p className="profile-screen__signed-out-text">
            Log in with your NYU email to like dishes and leave reviews.
          </p>
          <Link to="/login" className="profile-screen__cta">
            Log in
          </Link>
          <Link to="/signup" className="profile-screen__cta profile-screen__cta--secondary">
            Sign up
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-screen">
      <h1 className="profile-screen__title">Profile</h1>

      <div className="profile-card">
        <span className="profile-card__avatar" aria-hidden="true">
          {initials(user.name)}
        </span>
        <div>
          <p className="profile-card__name">{user.name}</p>
          <p className="profile-card__email">{user.email}</p>
          <div className="profile-card__meta">
            {user.class_year && <span className="profile-badge">Class of {user.class_year}</span>}
            <span className="profile-badge">{user.email_verified ? 'Verified' : 'Not verified'}</span>
          </div>
        </div>
      </div>

      {!user.email_verified && (
        <p className="profile-screen__verify-prompt">
          <Link to="/verify-email" className="profile-screen__verify-link">
            Verify your email
          </Link>{' '}
          to leave reviews and add restaurants.
        </p>
      )}

      {user.is_admin && (
        <Link to="/admin" className="profile-screen__cta profile-screen__admin">
          Review suggestions{pendingCount ? ` (${pendingCount} waiting)` : ''}
        </Link>
      )}

      <section className="profile-suggestions">
        <div className="profile-suggestions__header">
          <h2 className="profile-suggestions__title">{user.is_admin ? 'Restaurants you added' : 'Your suggestions'}</h2>
          <Link to="/suggest" className="profile-suggestions__add">
            {user.is_admin ? '+ Add' : '+ Suggest'}
          </Link>
        </div>
        {mine.length === 0 ? (
          <p className="profile-suggestions__empty">
            Know a great affordable spot? Suggest it and the AD Bites team will add it to the map.
          </p>
        ) : (
          <ul className="profile-suggestions__list">
            {mine.map((r) => (
              <li key={r.id} className="profile-suggestions__item">
                <span>
                  <span className="profile-suggestions__name">{r.name}</span>
                  <span className="profile-suggestions__cuisine"> · {r.cuisine}</span>
                </span>
                <span className="profile-badge">{r.verified ? 'Live' : 'Waiting for approval'}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button type="button" className="profile-screen__logout" onClick={logout}>
        Log out
      </button>
    </div>
  )
}
