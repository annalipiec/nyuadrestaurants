import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import './MapScreen.css'
import { listRestaurants } from '../api/restaurants'
import { getShuttles } from '../api/shuttles'
import type { RawShuttleStop, Restaurant, ShuttleRoute } from '../api/types'
import { restaurantMarkerIcon } from '../components/restaurantMarkerIcon'
import { shuttleStopIcon } from '../components/shuttleStopIcon'

const NYUAD_CENTER: [number, number] = [24.5335, 54.438]

/** The "Map" tab: just the map and pins, no list — see CLAUDE.md routing notes. */
export default function MapScreen() {
  const location = useLocation()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [routes, setRoutes] = useState<ShuttleRoute[]>([])
  const [stops, setStops] = useState<RawShuttleStop[]>([])
  const [showShuttles, setShowShuttles] = useState(true)

  useEffect(() => {
    listRestaurants().then(setRestaurants)
    getShuttles().then(({ routes, stops }) => {
      setRoutes(routes)
      setStops(stops)
    })
  }, [])

  return (
    <div className="map-screen">
      <MapContainer center={NYUAD_CENTER} zoom={12}>
        {/*
          Esri's free street basemap — not raw tile.openstreetmap.org (which
          blocks shared/automated traffic like a Codespace's egress IP, per
          osm.wiki/Blocked) and not CARTO's basemaps.cartocdn.com (which
          started requiring an API key). This Esri endpoint is the standard
          no-API-key fallback used across most Leaflet apps for exactly this
          reason. Note the {z}/{y}/{x} order — Esri, unlike most XYZ tile
          servers, puts y before x.
        */}
        <TileLayer
          attribution="Tiles &copy; Esri"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
        />

        {showShuttles &&
          routes.map((route) => (
            <Polyline
              key={route.id}
              positions={route.path}
              pathOptions={{ color: route.color, weight: 4, opacity: 0.75, dashArray: '1 8' }}
            />
          ))}

        {showShuttles &&
          stops.map((stop) => (
            <Marker key={`stop-${stop.id}`} position={[stop.lat, stop.lng]} icon={shuttleStopIcon()}>
              <Popup>
                <div className="map-popup">
                  <p className="map-popup__name">{stop.name}</p>
                  <p className="map-popup__meta" style={{ marginBottom: 0 }}>
                    Shuttle stop
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

        {restaurants.map((r) => (
          <Marker key={r.id} position={[r.lat, r.lng]} icon={restaurantMarkerIcon(false)}>
            <Popup>
              <div className="map-popup">
                <p className="map-popup__name">{r.name}</p>
                <p className="map-popup__meta">
                  {r.cuisine} · {r.price_tier.symbol}
                </p>
                <Link
                  to={`/restaurants/${r.id}`}
                  state={{ backgroundLocation: location }}
                  className="map-popup__link"
                >
                  View details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="map-screen__topbar">
        <div className="map-screen__brand">
          <img src="/favicon.png" alt="" className="map-screen__brand-mark" />
          <span className="map-screen__brand-name">AD Bites</span>
        </div>
      </div>

      {/* Bottom-left: clear of Leaflet's top-left zoom control and the
          top-right brand badge, and clear of the bottom nav (a flex sibling
          of map-screen, not an overlay on top of it). */}
      <label className="map-screen__toggle">
        <input
          type="checkbox"
          checked={showShuttles}
          onChange={(e) => setShowShuttles(e.target.checked)}
        />
        Shuttle routes
      </label>
    </div>
  )
}
