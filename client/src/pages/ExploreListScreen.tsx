import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import './RestaurantList.css'
import { listRestaurants } from '../api/restaurants'
import type { Restaurant } from '../api/types'
import RestaurantRow from '../components/RestaurantRow'

/** The "Explore" tab: search + list, no map — see CLAUDE.md routing notes. */
export default function ExploreListScreen() {
  const location = useLocation()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    setLoading(true)
    const handle = setTimeout(() => {
      listRestaurants({ q: query || undefined })
        .then(setRestaurants)
        .finally(() => setLoading(false))
    }, 250)
    return () => clearTimeout(handle)
  }, [query])

  return (
    <div className="restaurant-list-screen">
      <h1 className="restaurant-list-screen__title">Find affordable eats</h1>
      <input
        className="restaurant-list-screen__search"
        type="text"
        placeholder="Search restaurants, cuisines…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && restaurants.length === 0 && (
        <p className="restaurant-list-screen__empty">Loading restaurants…</p>
      )}
      {!loading && restaurants.length === 0 && (
        <p className="restaurant-list-screen__empty">No restaurants match that search.</p>
      )}

      {restaurants.map((r) => (
        <RestaurantRow key={r.id} restaurant={r} backgroundLocation={location} />
      ))}
    </div>
  )
}
