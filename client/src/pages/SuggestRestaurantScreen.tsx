import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './AuthScreens.css'
import './SuggestRestaurantScreen.css'
import { useAuth } from '../context/AuthContext'
import { suggestRestaurant } from '../api/restaurants'
import { apiErrorMessage } from '../api/client'
import LocationPicker, { type LatLng } from '../components/LocationPicker'

/** "24.4888, 54.3608" (as copied from Google Maps) → coordinates, or null. */
function parseCoords(text: string): LatLng | null {
  const m = /(-?\d{1,3}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)/.exec(text)
  if (!m) return null
  const lat = Number(m[1])
  const lng = Number(m[2])
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : null
}

/**
 * Students suggest a restaurant; it stays hidden until the AD Bites team approves it
 * (AdminScreen). Admins' own additions go live straight away.
 */
export default function SuggestRestaurantScreen() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [name, setName] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [price, setPrice] = useState('')
  const [point, setPoint] = useState<LatLng | null>(null)
  const [coordsText, setCoordsText] = useState('')
  const [gettingThere, setGettingThere] = useState('')
  const [happyHour, setHappyHour] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState<{ name: string; live: boolean } | null>(null)

  const goBack = () => (location.key === 'default' ? navigate('/') : navigate(-1))

  function pickOnMap(p: LatLng) {
    setPoint(p)
    setCoordsText(`${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`)
  }

  function typeCoords(text: string) {
    setCoordsText(text)
    const parsed = parseCoords(text)
    if (parsed) setPoint(parsed)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!point) {
      setError('Tap the map (or paste coordinates) to show where the restaurant is.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const created = await suggestRestaurant({
        name: name.trim(),
        cuisine: cuisine.trim(),
        avg_meal_price_aed: Number(price),
        lat: point.lat,
        lng: point.lng,
        getting_there_note: gettingThere.trim() || null,
        happy_hour_info: happyHour.trim() || null,
      })
      setDone({ name: created.name, live: created.verified })
      setName('')
      setCuisine('')
      setPrice('')
      setPoint(null)
      setCoordsText('')
      setGettingThere('')
      setHappyHour('')
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not send that suggestion.'))
    } finally {
      setBusy(false)
    }
  }

  if (loading) return null

  return (
    <div className="auth-screen suggest-screen">
      <button type="button" className="auth-screen__back suggest-screen__back" onClick={goBack}>
        ‹ Back
      </button>
      <h1 className="auth-screen__title">Suggest a restaurant</h1>
      <p className="auth-screen__subtitle">
        Know an affordable spot other students should try? Tell us about it — the AD Bites team checks every
        suggestion before it goes on the map.
      </p>

      {!user ? (
        <p className="suggest-screen__gate">
          <Link to="/login" className="auth-screen__link">
            Log in
          </Link>{' '}
          with your NYU email to suggest a restaurant.
        </p>
      ) : !user.email_verified ? (
        <p className="suggest-screen__gate">
          <Link to="/verify-email" className="auth-screen__link">
            Verify your email
          </Link>{' '}
          to suggest a restaurant.
        </p>
      ) : done ? (
        <div className="suggest-screen__done">
          <p className="suggest-screen__done-title">Thanks! {done.name} was sent.</p>
          <p className="auth-screen__subtitle">
            {done.live
              ? 'You’re on the AD Bites team, so it’s live on the map already.'
              : 'It’ll appear on the map once the AD Bites team approves it. You can check its status on your Profile.'}
          </p>
          <button type="button" className="auth-form__submit" onClick={() => setDone(null)}>
            Suggest another
          </button>
        </div>
      ) : (
        <form className="auth-form" onSubmit={submit}>
          <label className="suggest-field">
            <span className="suggest-field__label">Name</span>
            <input
              className="auth-form__input"
              required
              maxLength={80}
              placeholder="e.g. Bait El Khetyar"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="suggest-field">
            <span className="suggest-field__label">Cuisine</span>
            <input
              className="auth-form__input"
              required
              maxLength={50}
              placeholder="e.g. Lebanese"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
            />
          </label>
          <label className="suggest-field">
            <span className="suggest-field__label">Average price per person for a main meal (AED)</span>
            <input
              className="auth-form__input"
              required
              type="number"
              inputMode="decimal"
              min={1}
              max={1000}
              step="1"
              placeholder="e.g. 35"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>

          <div className="suggest-field">
            <span className="suggest-field__label">Location — tap the map to drop a pin</span>
            <LocationPicker value={point} onChange={pickOnMap} />
            <input
              className="auth-form__input"
              placeholder="…or paste coordinates, e.g. 24.4888, 54.3608"
              value={coordsText}
              onChange={(e) => typeCoords(e.target.value)}
              aria-label="Coordinates"
            />
          </div>

          <label className="suggest-field">
            <span className="suggest-field__label">Getting there (optional)</span>
            <input
              className="auth-form__input"
              maxLength={120}
              placeholder="e.g. WTC stop + 10 min walk"
              value={gettingThere}
              onChange={(e) => setGettingThere(e.target.value)}
            />
          </label>
          <label className="suggest-field">
            <span className="suggest-field__label">Happy hours / deals (optional)</span>
            <input
              className="auth-form__input"
              maxLength={120}
              placeholder="e.g. Mon–Fri 12–7 PM"
              value={happyHour}
              onChange={(e) => setHappyHour(e.target.value)}
            />
          </label>

          {error && <p className="auth-form__error">{error}</p>}
          <button type="submit" className="auth-form__submit" disabled={busy}>
            {busy ? 'Sending…' : 'Send suggestion'}
          </button>
        </form>
      )}
    </div>
  )
}
