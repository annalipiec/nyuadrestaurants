import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import './RestaurantDetailScreen.css'
import MapHeaderGraphic from '../components/MapHeaderGraphic'
import {
  BookmarkIcon,
  BusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  ShareIcon,
} from '../components/icons'
import { addReview, getRestaurant, likeDish, listPhrases } from '../api/restaurants'
import { apiErrorMessage } from '../api/client'
import type { Dish, Restaurant, Review } from '../api/types'
import { useAuth } from '../context/AuthContext'
import { useSaved } from '../context/SavedContext'
import { initials } from '../utils/initials'

function directionsUrl(restaurant: Restaurant) {
  const destination = `${restaurant.lat},${restaurant.lng}`
  if (restaurant.nearest_shuttle_stop) {
    const origin = `${restaurant.nearest_shuttle_stop.lat},${restaurant.nearest_shuttle_stop.lng}`
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`
  }
  return `https://www.google.com/maps/search/?api=1&query=${destination}`
}

type DishWithLikeState = Dish & { liked: boolean }

function AddTipForm({
  restaurantId,
  onAdded,
}: {
  restaurantId: number
  onAdded: (review: Review) => void
}) {
  const [phrases, setPhrases] = useState<string[]>([])
  const [stars, setStars] = useState(5)
  const [phrase, setPhrase] = useState('')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    listPhrases().then(setPhrases).catch(() => setPhrases([]))
  }, [])

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const review = await addReview(restaurantId, {
        stars,
        nyuad_phrase: phrase || null,
        text: text.trim() || null,
      })
      onAdded(review)
      setText('')
      setPhrase('')
      setStars(5)
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not post that tip.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="add-tip-form" onSubmit={submit}>
      <div className="add-tip-form__stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`add-tip-form__star${n <= stars ? ' add-tip-form__star--filled' : ''}`}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            onClick={() => setStars(n)}
          >
            ★
          </button>
        ))}
      </div>
      <select
        className="add-tip-form__select"
        value={phrase}
        onChange={(e) => setPhrase(e.target.value)}
      >
        <option value="">No vibe tag</option>
        {phrases.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <textarea
        className="add-tip-form__textarea"
        placeholder="What should other students know?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {error && <p className="add-tip-form__error">{error}</p>}
      <button type="submit" className="add-tip-form__submit" disabled={busy}>
        Post tip
      </button>
    </form>
  )
}

export default function RestaurantDetailScreen({ embedded = false }: { embedded?: boolean }) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isSaved, toggleSaved } = useSaved()

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [dishes, setDishes] = useState<DishWithLikeState[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showTipForm, setShowTipForm] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setNotFound(false)
    getRestaurant(id)
      .then(({ restaurant, reviews }) => {
        setRestaurant(restaurant)
        setDishes(restaurant.dishes.map((d) => ({ ...d, liked: false })))
        setReviews(reviews)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  async function toggleDish(dishId: number) {
    if (!user) {
      navigate('/login')
      return
    }
    const { liked, likes } = await likeDish(dishId)
    setDishes((current) => current.map((d) => (d.id === dishId ? { ...d, liked, likes } : d)))
  }

  function handleShare() {
    if (!restaurant) return
    const shareData = { title: restaurant.name, text: `Check out ${restaurant.name} on NYUAD Eats`, url: window.location.href }
    if (navigator.share) {
      navigator.share(shareData).catch(() => {})
    } else {
      navigator.clipboard?.writeText(window.location.href)
    }
  }

  function handleReviewAdded(review: Review) {
    setReviews((current) => [review, ...current])
    setShowTipForm(false)
  }

  if (loading) {
    return (
      <div className={embedded ? 'detail-screen detail-screen--embedded' : undefined}>
        <p className="detail-screen__state">Loading restaurant…</p>
      </div>
    )
  }
  if (notFound || !restaurant) {
    return (
      <div className={embedded ? 'detail-screen detail-screen--embedded' : undefined}>
        <p className="detail-screen__state">
          Couldn't find that restaurant. <Link to="/">Back to the map</Link>
        </p>
      </div>
    )
  }

  return (
    <div className={`detail-screen${embedded ? ' detail-screen--embedded' : ''}`}>
      {!embedded && (
        <header className="detail-screen__header">
          <MapHeaderGraphic />
          <div className="detail-screen__header-bar">
            <button type="button" className="icon-button" aria-label="Go back" onClick={() => navigate(-1)}>
              <ChevronLeftIcon />
            </button>
            <button type="button" className="icon-button" aria-label="Share this restaurant" onClick={handleShare}>
              <ShareIcon />
            </button>
          </div>
        </header>
      )}

      <div className="detail-screen__sheet">
        {embedded && (
          <div className="detail-screen__embedded-controls">
            <button type="button" className="icon-button" aria-label="Close" onClick={() => navigate(-1)}>
              <ChevronLeftIcon />
            </button>
            <button type="button" className="icon-button" aria-label="Share this restaurant" onClick={handleShare}>
              <ShareIcon />
            </button>
          </div>
        )}
        <div className="detail-screen__handle" aria-hidden="true" />

        <div className="detail-screen__title-row">
          <div>
            <h1 className="detail-screen__name">{restaurant.name}</h1>
            <p className="detail-screen__cuisine">
              {[restaurant.cuisine, restaurant.neighborhood].filter(Boolean).join(' · ')}
            </p>
          </div>
          <button
            type="button"
            className="icon-button icon-button--outline"
            aria-label={isSaved(restaurant.id) ? 'Remove from saved' : 'Save this restaurant'}
            aria-pressed={isSaved(restaurant.id)}
            onClick={() => toggleSaved(restaurant.id)}
          >
            <BookmarkIcon filled={isSaved(restaurant.id)} />
          </button>
        </div>

        {restaurant.nearest_shuttle_stop && (
          <button
            type="button"
            className="getting-there-card"
            onClick={() => window.open(directionsUrl(restaurant), '_blank', 'noopener')}
          >
            <span className="getting-there-card__icon">
              <BusIcon />
            </span>
            <span className="getting-there-card__text">
              <p className="getting-there-card__label">Getting there</p>
              <p className="getting-there-card__value">
                {Math.round(restaurant.nearest_shuttle_stop.distance_m)}m from{' '}
                {restaurant.nearest_shuttle_stop.name}
              </p>
            </span>
            <span className="getting-there-card__chevron">
              <ChevronRightIcon />
            </span>
          </button>
        )}

        {restaurant.happy_hour_info && (
          <div className="happy-hours-bar">
            <span className="happy-hours-bar__label">Happy hours</span>
            <span className="happy-hours-bar__value">{restaurant.happy_hour_info}</span>
          </div>
        )}

        <section className="detail-screen__section">
          <div className="detail-screen__section-header">
            <h2 className="detail-screen__section-title">Must-try dishes</h2>
          </div>
          <div className="dish-grid">
            {dishes.map((dish) => (
              <article key={dish.id} className="dish-card">
                <p className="dish-card__name">
                  {dish.name}
                  {dish.price_aed != null ? ` · ${dish.price_aed} AED` : ''}
                </p>
                <button
                  type="button"
                  className={`dish-card__like${dish.liked ? ' dish-card__like--liked' : ''}`}
                  aria-label={dish.liked ? `Unlike ${dish.name}` : `Like ${dish.name}`}
                  aria-pressed={dish.liked}
                  onClick={() => toggleDish(dish.id)}
                >
                  <HeartIcon filled={dish.liked} />
                  <span style={{ fontSize: '0.75rem', marginLeft: 2 }}>{dish.likes}</span>
                </button>
              </article>
            ))}
            {dishes.length === 0 && <p className="detail-screen__state">No dishes added yet.</p>}
          </div>
        </section>

        <section className="detail-screen__section">
          <div className="detail-screen__section-header">
            <h2 className="detail-screen__section-title">From the community</h2>
            {!showTipForm && (
              <button type="button" className="detail-screen__link-button" onClick={() => setShowTipForm(true)}>
                Add a tip
              </button>
            )}
          </div>

          {showTipForm &&
            (!user ? (
              <p className="detail-screen__prompt">
                <Link to="/login" className="detail-screen__prompt-link">
                  Log in
                </Link>{' '}
                to add a tip.
              </p>
            ) : !user.email_verified ? (
              <p className="detail-screen__prompt">
                <Link to="/verify-email" className="detail-screen__prompt-link">
                  Verify your email
                </Link>{' '}
                to add a tip.
              </p>
            ) : (
              <AddTipForm restaurantId={restaurant.id} onAdded={handleReviewAdded} />
            ))}

          <div className="dish-grid" style={{ gridTemplateColumns: '1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
            {reviews.map((review) => (
              <article key={review.id} className="tip-card">
                <span className="tip-card__avatar" aria-hidden="true">
                  {initials(review.author_name)}
                </span>
                <span className="tip-card__body">
                  <p className="tip-card__author">{review.author_name}</p>
                  <p className="tip-card__stars">{'★'.repeat(review.stars)}</p>
                  {review.nyuad_phrase && <p className="tip-card__stars">{review.nyuad_phrase}</p>}
                  {review.text && <p className="tip-card__text">{review.text}</p>}
                </span>
              </article>
            ))}
            {reviews.length === 0 && <p className="detail-screen__state">No tips yet — be the first!</p>}
          </div>
        </section>
      </div>
    </div>
  )
}
