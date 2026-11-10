import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import './RestaurantList.css'
import { listRestaurants } from '../api/restaurants'
import type { Restaurant } from '../api/types'
import RestaurantRow from '../components/RestaurantRow'
import { useSaved } from '../context/SavedContext'

/**
 * There's no "get restaurants by id" endpoint, so this fetches the full list
 * and filters client-side by the locally-saved ids — fine at this app's
 * current size (see CLAUDE.md: Saved is localStorage-only, no backend).
 */
export default function SavedScreen() {
  const location = useLocation()
  const { savedIds } = useSaved()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listRestaurants()
      .then(setRestaurants)
      .finally(() => setLoading(false))
  }, [])

  const saved = restaurants.filter((r) => savedIds.includes(r.id))

  return (
    <div className="restaurant-list-screen">
      <h1 className="restaurant-list-screen__title">Saved</h1>

      {loading && <p className="restaurant-list-screen__empty">Loading…</p>}
      {!loading && saved.length === 0 && (
        <p className="restaurant-list-screen__empty">
          Nothing saved yet — tap the bookmark icon on a restaurant to add it here.
        </p>
      )}

      {saved.map((r) => (
        <RestaurantRow key={r.id} restaurant={r} backgroundLocation={location} />
      ))}
    </div>
  )
}
