import { divIcon } from 'leaflet'

/**
 * Same teardrop-pin language as MapHeaderGraphic's illustrated pin, so the
 * decorative header map and this real Leaflet map read as one visual system.
 * Built with CSS custom properties (resolved against :root like any other
 * DOM node) rather than a new hardcoded color, per CLAUDE.md's token rule.
 *
 * Uses --color-accent-strong (not --color-accent) deliberately: this pin sits
 * on real OpenStreetMap tile imagery, not on one of our surface/card tokens,
 * so the "legible foreground on our surface" reasoning for --color-accent
 * doesn't apply here — a single consistent brand-purple pin regardless of
 * theme is the right call, the same way map-pin colors elsewhere don't
 * usually follow a light/dark app theme.
 */
export function restaurantMarkerIcon(active = false) {
  const size = active ? 38 : 30
  return divIcon({
    className: 'restaurant-marker',
    html: `
      <svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2a10 10 0 0 0-10 10c0 7.5 10 18 10 18s10-10.5 10-18A10 10 0 0 0 16 2Z"
              fill="var(--color-accent-strong)" stroke="var(--color-surface)" stroke-width="1.5" />
        <circle cx="16" cy="12.5" r="4.5" fill="var(--color-map-land)" />
      </svg>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  })
}
