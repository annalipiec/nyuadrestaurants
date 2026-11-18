import { divIcon } from 'leaflet'

/**
 * Same visual language as the bus-stop circle in MapHeaderGraphic's
 * illustration, as a real Leaflet marker. Uses --color-accent-strong
 * deliberately (not --color-accent) — same reasoning as restaurantMarkerIcon:
 * this sits on external map tile imagery, not an app surface/card token.
 */
export function shuttleStopIcon() {
  const size = 24
  return divIcon({
    className: 'shuttle-stop-marker',
    html: `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="var(--color-surface)" stroke="var(--color-accent-strong)" stroke-width="3" />
        <g transform="translate(6.5,7)" fill="none" stroke="var(--color-accent-strong)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <rect x="0" y="0" width="11" height="7.5" rx="2" />
          <path d="M0 5.3h11" />
          <path d="M2.5 7.5v1.3M8.5 7.5v1.3" />
        </g>
      </svg>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}
