import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import './DetailOverlay.css'

/**
 * Backdrop for the "map stays visible, detail screen pops up on top of it"
 * pattern (see App.tsx). Tapping the dimmed backdrop (not the sheet itself)
 * dismisses it the same way the sheet's own back button does.
 */
export default function DetailOverlay({ children }: { children: ReactNode }) {
  const navigate = useNavigate()

  return (
    <div
      className="detail-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) navigate(-1)
      }}
    >
      {children}
    </div>
  )
}
