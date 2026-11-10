import { NavLink } from 'react-router-dom'
import './BottomNav.css'
import { BookmarkIcon, MapIcon, SearchIcon, UserIcon } from './icons'

const TABS = [
  { to: '/', label: 'Map', Icon: MapIcon, end: true },
  { to: '/explore', label: 'Explore', Icon: SearchIcon, end: false },
  { to: '/saved', label: 'Saved', Icon: BookmarkIcon, end: false },
  { to: '/profile', label: 'Profile', Icon: UserIcon, end: false },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {TABS.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}`}
        >
          <Icon />
          <span className="bottom-nav__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
