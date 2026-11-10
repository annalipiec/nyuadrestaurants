import { Link } from 'react-router-dom'
import './ProfileScreen.css'
import { useAuth } from '../context/AuthContext'
import { initials } from '../utils/initials'

export default function ProfileScreen() {
  const { user, logout } = useAuth()

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

      <button type="button" className="profile-screen__logout" onClick={logout}>
        Log out
      </button>
    </div>
  )
}
