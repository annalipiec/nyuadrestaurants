/**
 * Decorative, abstract map illustration for the restaurant detail header:
 * a shuttle stop connected by a route line to the restaurant's pin, with a
 * couple of generic "building" blocks and streets for context. Not a real
 * map — purely illustrative, built from the design tokens.
 */
export default function MapHeaderGraphic() {
  return (
    <svg
      viewBox="0 0 600 360"
      preserveAspectRatio="xMidYMid slice"
      className="map-header-graphic"
      role="img"
      aria-label="Illustration of the restaurant's location relative to the nearest shuttle stop"
    >
      <rect x="0" y="0" width="600" height="360" fill="var(--color-map-land)" />

      {/* streets */}
      <rect x="133" y="0" width="14" height="360" fill="var(--color-surface)" />
      <rect x="413" y="0" width="14" height="360" fill="var(--color-surface)" />

      {/* buildings */}
      <rect x="160" y="205" width="55" height="48" rx="8" fill="var(--color-border)" opacity="0.55" />
      <rect x="350" y="200" width="55" height="48" rx="8" fill="var(--color-border)" opacity="0.55" />
      <rect x="460" y="205" width="55" height="48" rx="8" fill="var(--color-border)" opacity="0.55" />

      {/* sky / accent wave */}
      <path
        d="M0,0 H600 V108 C520,168 460,88 380,128 C300,168 238,96 150,138 C90,163 40,150 0,170 Z"
        fill="var(--color-accent-strong)"
      />

      {/* shuttle route — "ink" on the map-land background, so this uses
          --color-accent (tuned per-theme to stay legible on that
          background), not --color-accent-strong (reserved for solid
          brand-color fills like the wave above). */}
      <path
        d="M210,300 H305 L600,345"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* shuttle stop node */}
      <circle cx="210" cy="300" r="26" fill="var(--color-map-land)" stroke="var(--color-accent)" strokeWidth="4" />
      <g transform="translate(196, 288)" fill="none" stroke="var(--color-accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="0" y="0" width="28" height="18" rx="4" />
        <path d="M0 13h28" />
        <path d="M6 18v3M22 18v3" />
      </g>

      {/* restaurant pin */}
      <polygon points="277,271 333,271 305,335" fill="var(--color-accent)" />
      <circle cx="305" cy="255" r="32" fill="var(--color-accent)" />
      <circle cx="305" cy="255" r="12" fill="var(--color-map-land)" />

      <text
        x="196"
        y="332"
        fontFamily="var(--font-sans)"
        fontWeight="700"
        fontSize="17"
        fill="var(--color-accent)"
      >
        Jacques Chirac St
      </text>
    </svg>
  )
}
