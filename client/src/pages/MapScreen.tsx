import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import './MapScreen.css'
import { listRestaurants } from '../api/restaurants'
import type { Restaurant } from '../api/types'
import { restaurantMarkerIcon } from '../components/restaurantMarkerIcon'

const NYUAD_CENTER: [number, number] = [24.5335, 54.438]

/** The "Map" tab: just the map and pins, no list — see CLAUDE.md routing notes. */
export default function MapScreen() {
  const location = useLocation()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])

  useEffect(() => {
    listRestaurants().then(setRestaurants)
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
          attribution='Tiles &copy; Esri — Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
        />
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
          <span className="map-screen__brand-mark" aria-hidden="true" />
          <span className="map-screen__brand-name">AD Bites</span>
        </div>
      </div>
    </div>
  )
}
