import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import './ExploreMapScreen.css'
import { listRestaurants } from '../api/restaurants'
import type { Restaurant } from '../api/types'
import { restaurantMarkerIcon } from '../components/restaurantMarkerIcon'
import { useAuth } from '../context/AuthContext'

const NYUAD_CENTER: [number, number] = [24.5335, 54.438]

export default function ExploreMapScreen() {
  const { user, logout } = useAuth()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState<number | null>(null)

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
    <div className="explore-screen">
      <div className="explore-screen__map">
        <MapContainer center={NYUAD_CENTER} zoom={12}>
          {/*
            CARTO's free basemaps, not raw tile.openstreetmap.org — the latter
            actively blocks shared/automated traffic (exactly what a Codespace
            or CI box looks like to it) per OSM's tile usage policy
            (osm.wiki/Blocked). CARTO's tiles are explicitly meant for
            third-party apps and still carry OSM attribution/data underneath.
          */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          {restaurants.map((r) => (
            <Marker
              key={r.id}
              position={[r.lat, r.lng]}
              icon={restaurantMarkerIcon(r.id === activeId)}
              eventHandlers={{
                mouseover: () => setActiveId(r.id),
                mouseout: () => setActiveId(null),
              }}
            >
              <Popup>
                <div className="map-popup">
                  <p className="map-popup__name">{r.name}</p>
                  <p className="map-popup__meta">
                    {r.cuisine} · {r.price_tier.symbol}
                  </p>
                  <Link to={`/restaurants/${r.id}`} className="map-popup__link">
                    View details
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="explore-screen__topbar">
          <div className="explore-screen__brand">
            <span className="explore-screen__brand-mark" aria-hidden="true" />
            <span className="explore-screen__brand-name">NYUAD Eats</span>
          </div>
          {user ? (
            <button type="button" className="explore-screen__auth" onClick={logout}>
              Log out
            </button>
          ) : (
            <Link to="/login" className="explore-screen__auth">
              Log in
            </Link>
          )}
        </div>
      </div>

      <div className="explore-screen__list">
        <h1 className="explore-screen__section-title">Find affordable eats</h1>
        <input
          className="explore-screen__search"
          type="text"
          placeholder="Search restaurants, cuisines…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {loading && restaurants.length === 0 && (
          <p className="explore-screen__empty">Loading restaurants…</p>
        )}
        {!loading && restaurants.length === 0 && (
          <p className="explore-screen__empty">No restaurants match that search.</p>
        )}

        {restaurants.map((r) => (
          <Link
            key={r.id}
            to={`/restaurants/${r.id}`}
            className={`restaurant-row${r.id === activeId ? ' restaurant-row--active' : ''}`}
            onMouseEnter={() => setActiveId(r.id)}
            onMouseLeave={() => setActiveId(null)}
          >
            <div className="restaurant-row__top">
              <div>
                <p className="restaurant-row__name">{r.name}</p>
                <p className="restaurant-row__meta">
                  {r.cuisine}
                  {r.neighborhood ? ` · ${r.neighborhood}` : ''}
                </p>
              </div>
              <span className="restaurant-row__tag">{r.price_tier.label}</span>
            </div>
            <div className="restaurant-row__footer">
              {r.avg_stars ? (
                <span>
                  ★ {r.avg_stars} ({r.review_count})
                </span>
              ) : (
                <span>No reviews yet</span>
              )}
              {r.nearest_shuttle_stop && (
                <span>🚌 {Math.round(r.nearest_shuttle_stop.distance_m)}m away</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
