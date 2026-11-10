import { Outlet } from 'react-router-dom'
import './MainTabsLayout.css'
import BottomNav from './BottomNav'

/** Shared chrome for the four bottom-nav tabs (Map/Explore/Saved/Profile). */
export default function MainTabsLayout() {
  return (
    <div className="main-tabs-layout">
      <div className="main-tabs-layout__content">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  )
}
