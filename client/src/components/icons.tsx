type IconProps = {
  className?: string
}

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

export function ShareIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
      <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
    </svg>
  )
}

export function BookmarkIcon({ className, filled }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base} className={className} fill={filled ? 'currentColor' : 'none'} aria-hidden="true">
      <path d="M6 3h12a1 1 0 0 1 1 1v16l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
    </svg>
  )
}

export function HeartIcon({ className, filled }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base} className={className} fill={filled ? 'currentColor' : 'none'} aria-hidden="true">
      <path d="M12 20.5s-7.5-4.6-10-9.2C.4 8 2 4.5 5.5 4a5 5 0 0 1 6.5 2 5 5 0 0 1 6.5-2c3.5.5 5.1 4 3.5 7.3-2.5 4.6-10 9.2-10 9.2Z" />
    </svg>
  )
}

export function BusIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} fill="none" aria-hidden="true">
      <rect x="4" y="4" width="16" height="13" rx="3" />
      <path d="M4 11h16" />
      <path d="M8 17v2M16 17v2" />
      <circle cx="8.5" cy="14" r="0.5" fill="currentColor" />
      <circle cx="15.5" cy="14" r="0.5" fill="currentColor" />
    </svg>
  )
}

export function MapIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} fill="none" aria-hidden="true">
      <path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  )
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  )
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}
