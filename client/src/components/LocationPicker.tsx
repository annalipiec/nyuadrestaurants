import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import { restaurantMarkerIcon } from './restaurantMarkerIcon'

export type LatLng = { lat: number; lng: number }

// Downtown Abu Dhabi, where most of the restaurants are.
const DEFAULT_CENTER: [number, number] = [24.49, 54.38]

function ClickToPlace({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

/** Small map: tap anywhere to drop (or move) the restaurant pin. */
export default function LocationPicker({ value, onChange }: { value: LatLng | null; onChange: (p: LatLng) => void }) {
  return (
    <div className="location-picker">
      <MapContainer center={value ? [value.lat, value.lng] : DEFAULT_CENTER} zoom={value ? 15 : 12}>
        {/* Same Esri basemap as MapScreen — see the comment there for why not OSM tiles. */}
        <TileLayer
          attribution="Tiles &copy; Esri"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
        />
        <ClickToPlace onPick={onChange} />
        {value && <Marker position={[value.lat, value.lng]} icon={restaurantMarkerIcon(true)} />}
      </MapContainer>
    </div>
  )
}
