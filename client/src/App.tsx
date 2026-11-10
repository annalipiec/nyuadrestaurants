import type { Location } from 'react-router-dom'
import { Route, Routes, useLocation } from 'react-router-dom'
import MainTabsLayout from './components/MainTabsLayout'
import MapScreen from './pages/MapScreen'
import ExploreListScreen from './pages/ExploreListScreen'
import SavedScreen from './pages/SavedScreen'
import ProfileScreen from './pages/ProfileScreen'
import RestaurantDetailScreen from './pages/RestaurantDetailScreen'
import LoginScreen from './pages/LoginScreen'
import SignupScreen from './pages/SignupScreen'
import VerifyEmailScreen from './pages/VerifyEmailScreen'
import DetailOverlay from './components/DetailOverlay'

type BackgroundLocationState = { backgroundLocation?: Location }

/**
 * Wired up to the real server/ API (see CLAUDE.md). Four bottom-nav tabs
 * (Map/Explore/Saved/Profile) share chrome via MainTabsLayout; tapping a
 * restaurant from any of them opens RestaurantDetailScreen with real data.
 *
 * The restaurant detail route renders twice when opened from one of the
 * tabs: once for the main <Routes>, using the *previous* location (so the
 * tab stays mounted underneath, per CLAUDE.md), and once more here as a
 * bottom-sheet overlay on top of it. This is react-router's standard
 * "modal route" pattern. A direct visit to /restaurants/:id (no prior
 * in-app location — a shared link, a refresh) has no backgroundLocation,
 * so it falls through to the plain main-route render: a full standalone
 * screen with its own illustrated header, not an overlay with nothing
 * underneath it.
 */
function App() {
  const location = useLocation()
  const state = location.state as BackgroundLocationState | null
  const backgroundLocation = state?.backgroundLocation

  return (
    <>
      <Routes location={backgroundLocation || location}>
        <Route element={<MainTabsLayout />}>
          <Route path="/" element={<MapScreen />} />
          <Route path="/explore" element={<ExploreListScreen />} />
          <Route path="/saved" element={<SavedScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
        </Route>
        <Route path="/restaurants/:id" element={<RestaurantDetailScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<SignupScreen />} />
        <Route path="/verify-email" element={<VerifyEmailScreen />} />
      </Routes>

      {backgroundLocation && (
        <Routes>
          <Route
            path="/restaurants/:id"
            element={
              <DetailOverlay>
                <RestaurantDetailScreen embedded />
              </DetailOverlay>
            }
          />
        </Routes>
      )}
    </>
  )
}

export default App
