import { useState } from 'react'
import './RestaurantDetailScreen.css'
import MapHeaderGraphic from './MapHeaderGraphic'
import {
  BookmarkIcon,
  BusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  ShareIcon,
} from './icons'

type Dish = {
  id: string
  name: string
  liked: boolean
}

type Tip = {
  id: string
  author: string
  text: string
}

type RestaurantDetail = {
  name: string
  cuisineTags: string[]
  shuttle: {
    routeName: string
    stopName: string
  }
  happyHours: {
    days: string
    hours: string
  }
  dishes: Dish[]
  tips: Tip[]
}

/**
 * Sample data standing in for a real backend call. This client isn't wired
 * up to the Express/SQLite API yet (see CLAUDE.md) — swap this out once it is.
 */
const SAMPLE_RESTAURANT: RestaurantDetail = {
  name: 'Ting Irie',
  cuisineTags: ['Jamaican', 'Caribbean street food'],
  shuttle: {
    routeName: 'University Shuttle',
    stopName: 'Mamsha stop',
  },
  happyHours: {
    days: 'Mon–Fri',
    hours: '12pm to 7pm',
  },
  dishes: [
    { id: 'oxtail', name: 'Oxtail sandwiches', liked: true },
    { id: 'shrimp', name: 'Caribbean pepper shrimp', liked: false },
  ],
  tips: [
    {
      id: 'tip-1',
      author: 'Amara, Class of 2027',
      text: 'Get there before 1pm on Fridays or the oxtail sells out fast.',
    },
  ],
}

function initials(name: string) {
  return name
    .split(',')[0]
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function RestaurantDetailScreen() {
  const restaurant = SAMPLE_RESTAURANT
  const [saved, setSaved] = useState(false)
  const [dishes, setDishes] = useState(restaurant.dishes)

  function toggleDish(id: string) {
    setDishes((current) =>
      current.map((dish) => (dish.id === id ? { ...dish, liked: !dish.liked } : dish)),
    )
  }

  return (
    <div className="detail-screen">
      <header className="detail-screen__header">
        <MapHeaderGraphic />
        <div className="detail-screen__header-bar">
          <button type="button" className="icon-button" aria-label="Go back">
            <ChevronLeftIcon />
          </button>
          <button type="button" className="icon-button" aria-label="Share this restaurant">
            <ShareIcon />
          </button>
        </div>
      </header>

      <div className="detail-screen__sheet">
        <div className="detail-screen__handle" aria-hidden="true" />

        <div className="detail-screen__title-row">
          <div>
            <h1 className="detail-screen__name">{restaurant.name}</h1>
            <p className="detail-screen__cuisine">{restaurant.cuisineTags.join(' · ')}</p>
          </div>
          <button
            type="button"
            className="icon-button icon-button--outline"
            aria-label={saved ? 'Remove from saved' : 'Save this restaurant'}
            aria-pressed={saved}
            onClick={() => setSaved((value) => !value)}
          >
            <BookmarkIcon filled={saved} />
          </button>
        </div>

        <button type="button" className="getting-there-card">
          <span className="getting-there-card__icon">
            <BusIcon />
          </span>
          <span className="getting-there-card__text">
            <p className="getting-there-card__label">Getting there</p>
            <p className="getting-there-card__value">
              {restaurant.shuttle.routeName}, {restaurant.shuttle.stopName}
            </p>
          </span>
          <span className="getting-there-card__chevron">
            <ChevronRightIcon />
          </span>
        </button>

        <div className="happy-hours-bar">
          <span className="happy-hours-bar__label">Happy hours</span>
          <span className="happy-hours-bar__value">
            {restaurant.happyHours.days}, {restaurant.happyHours.hours}
          </span>
        </div>

        <section className="detail-screen__section">
          <div className="detail-screen__section-header">
            <h2 className="detail-screen__section-title">Must-try dishes</h2>
          </div>
          <div className="dish-grid">
            {dishes.map((dish) => (
              <article key={dish.id} className="dish-card">
                <p className="dish-card__name">{dish.name}</p>
                <button
                  type="button"
                  className={`dish-card__like${dish.liked ? ' dish-card__like--liked' : ''}`}
                  aria-label={dish.liked ? `Unlike ${dish.name}` : `Like ${dish.name}`}
                  aria-pressed={dish.liked}
                  onClick={() => toggleDish(dish.id)}
                >
                  <HeartIcon filled={dish.liked} />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="detail-screen__section">
          <div className="detail-screen__section-header">
            <h2 className="detail-screen__section-title">From the community</h2>
            <button type="button" className="detail-screen__link-button">
              Add a tip
            </button>
          </div>
          <div className="dish-grid" style={{ gridTemplateColumns: '1fr', gap: '0.75rem' }}>
            {restaurant.tips.map((tip) => (
              <article key={tip.id} className="tip-card">
                <span className="tip-card__avatar" aria-hidden="true">
                  {initials(tip.author)}
                </span>
                <span className="tip-card__body">
                  <p className="tip-card__author">{tip.author}</p>
                  <p className="tip-card__text">{tip.text}</p>
                </span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
